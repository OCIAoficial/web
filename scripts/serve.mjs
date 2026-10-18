import { createReadStream } from 'node:fs';
import { realpath, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isInsideDirectory, isPublicPath } from './public-files.mjs';

const PROJECT_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.ttf': 'font/ttf',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

function sendText(response, statusCode, text, head = false) {
  response.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(text),
    'X-Content-Type-Options': 'nosniff',
    'Cache-Control': 'no-store',
  });
  response.end(head ? undefined : text);
}

export function publicRequestPath(requestUrl) {
  try {
    if (!requestUrl.startsWith('/')) return null;
    const decoded = decodeURIComponent(requestUrl.split('?')[0]);
    if (/[\\\u0000-\u001f\u007f]/u.test(decoded)) return null;
    if (decoded === '/') return 'index.html';
    const relativePath = decoded.slice(1);
    return isPublicPath(relativePath) ? relativePath : null;
  } catch {
    return null;
  }
}

export async function createStaticServer({ rootDirectory = PROJECT_DIRECTORY } = {}) {
  const root = await realpath(rootDirectory);
  return createServer(async (request, response) => {
    const head = request.method === 'HEAD';
    if (request.method !== 'GET' && !head) {
      response.setHeader('Allow', 'GET, HEAD');
      sendText(response, 405, 'Método no permitido.\n');
      return;
    }
    const relativePath = publicRequestPath(request.url ?? '');
    if (!relativePath) {
      sendText(response, 404, 'Recurso no encontrado.\n', head);
      return;
    }
    try {
      const requestedFile = path.resolve(root, relativePath);
      const canonicalFile = await realpath(requestedFile);
      // Reject aliases as well as escapes: public symlinks must not expose local files.
      if (canonicalFile !== requestedFile || !isInsideDirectory(root, canonicalFile)) {
        sendText(response, 404, 'Recurso no encontrado.\n', head);
        return;
      }
      const info = await stat(canonicalFile);
      if (!info.isFile()) {
        sendText(response, 404, 'Recurso no encontrado.\n', head);
        return;
      }
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(canonicalFile).toLowerCase()] ?? 'application/octet-stream',
        'Content-Length': info.size,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'no-store',
      });
      if (head) {
        response.end();
      } else {
        const stream = createReadStream(canonicalFile);
        stream.on('error', () => response.destroy());
        response.on('close', () => stream.destroy());
        stream.pipe(response);
      }
    } catch (error) {
      if (['ENOENT', 'ENOTDIR', 'EACCES'].includes(error.code)) {
        sendText(response, 404, 'Recurso no encontrado.\n', head);
      } else {
        console.error('No se pudo servir el recurso:', error.message);
        sendText(response, 500, 'No se pudo cargar el recurso.\n', head);
      }
    }
  });
}

export function parseServerOptions(args) {
  const options = { host: '127.0.0.1', port: undefined, preview: false, help: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--preview') options.preview = true;
    else if (argument === '--help' || argument === '-h') options.help = true;
    else if (argument === '--host' || argument === '--port') {
      const value = args[++index];
      if (!value || value.startsWith('--')) throw new Error(`Falta un valor para ${argument}.`);
      if (argument === '--host') options.host = value;
      else {
        if (!/^\d+$/u.test(value) || Number(value) > 65535) {
          throw new Error('El puerto debe ser un número entre 0 y 65535.');
        }
        options.port = Number(value);
      }
    } else throw new Error(`Opción desconocida: ${argument}`);
  }
  options.port ??= options.preview ? 4174 : 4173;
  return options;
}

export async function startServer(args = process.argv.slice(2)) {
  const options = parseServerOptions(args);
  if (options.help) {
    console.log('Uso: npm run dev -- [--host 127.0.0.1] [--port 4173]\n     npm run preview -- [--host 127.0.0.1] [--port 4174]');
    return;
  }
  const rootDirectory = options.preview ? path.join(PROJECT_DIRECTORY, 'dist') : PROJECT_DIRECTORY;
  let server;
  try {
    server = await createStaticServer({ rootDirectory });
  } catch (error) {
    if (options.preview && error.code === 'ENOENT') {
      throw new Error('No existe dist/. Ejecuta npm run build antes de la vista previa.');
    }
    throw error;
  }
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(options.port, options.host, resolve);
  });
  const { port } = server.address();
  const host = options.host.includes(':') ? `[${options.host}]` : options.host;
  console.log(`OCIA · ${options.preview ? 'Vista previa' : 'Desarrollo'}: http://${host}:${port}`);
  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  startServer().catch((error) => {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
  });
}
