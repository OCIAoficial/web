import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { buildSite } from '../scripts/build.mjs';
import { createStaticServer, parseServerOptions } from '../scripts/serve.mjs';

async function fixture(t) {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'ocia-tooling-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const files = {
    'index.html': '<!doctype html><title>OCIA</title>',
    'noticias.html': '<!doctype html><title>Noticias OCIA</title>',
    'noticia-inscripciones.html': '<!doctype html><title>Inscripciones OCIA</title>',
    'temarios.html': '<!doctype html><title>Temarios OCIA</title>',
    'materiales.html': '<!doctype html><title>Materiales OCIA</title>',
    'styles.css': 'body { color: black; }',
    'app.js': 'export const edition = "2026-2027";',
    'src/edition.js': 'export default "2026-2027";',
    'assets/icon.svg': '<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    'assets/fonts/font.woff2': 'test-font',
    'docs/referencias/guide.pdf': '%PDF-1.7\nexample',
    'private-note.txt': 'private-fixture',
    '.env': 'LOCAL_FIXTURE=not-public',
    'assets/.private.txt': 'hidden-fixture',
    'assets/.hidden/note.txt': 'nested-hidden-fixture',
    'scripts/local.mjs': 'local-script',
    'tests/local.test.mjs': 'local-test',
  };
  for (const [file, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(directory, file)), { recursive: true });
    await writeFile(path.join(directory, file), content);
  }
  await symlink(path.join(directory, 'private-note.txt'), path.join(directory, 'assets', 'alias.txt'));
  return { directory, files };
}

function request(server, requestPath, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1', port: server.address().port, path: requestPath, method,
    }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({
        status: response.statusCode,
        headers: response.headers,
        body: Buffer.concat(chunks).toString(),
      }));
      response.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

async function serve(t, directory) {
  const server = await createStaticServer({ rootDirectory: directory });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())));
  return server;
}

test('el servidor entrega archivos públicos con MIME correcto y soporta HEAD', async (t) => {
  const { directory, files } = await fixture(t);
  const server = await serve(t, directory);
  const checks = [
    ['/', 'index.html', 'text/html; charset=utf-8'],
    ['/noticias.html', 'noticias.html', 'text/html; charset=utf-8'],
    ['/noticia-inscripciones.html', 'noticia-inscripciones.html', 'text/html; charset=utf-8'],
    ['/temarios.html', 'temarios.html', 'text/html; charset=utf-8'],
    ['/materiales.html', 'materiales.html', 'text/html; charset=utf-8'],
    ['/styles.css?v=1', 'styles.css', 'text/css; charset=utf-8'],
    ['/app.js', 'app.js', 'text/javascript; charset=utf-8'],
    ['/src/edition.js', 'src/edition.js', 'text/javascript; charset=utf-8'],
    ['/assets/icon.svg', 'assets/icon.svg', 'image/svg+xml'],
    ['/assets/fonts/font.woff2', 'assets/fonts/font.woff2', 'font/woff2'],
    ['/docs/referencias/guide.pdf', 'docs/referencias/guide.pdf', 'application/pdf'],
  ];
  for (const [url, file, mime] of checks) {
    const response = await request(server, url);
    assert.equal(response.status, 200, url);
    assert.equal(response.headers['content-type'], mime, url);
    assert.equal(response.headers['x-content-type-options'], 'nosniff');
    assert.equal(response.body, files[file]);
  }
  const head = await request(server, '/app.js', 'HEAD');
  assert.equal(head.status, 200);
  assert.equal(Number(head.headers['content-length']), Buffer.byteLength(files['app.js']));
  assert.equal(head.body, '');
});

test('el servidor no expone rutas locales, archivos ocultos, aliases ni traversal', async (t) => {
  const { directory } = await fixture(t);
  const server = await serve(t, directory);
  const blocked = [
    '/.env', '/%2eenv', '/private-note.txt', '/scripts/local.mjs', '/tests/local.test.mjs',
    '/assets/.private.txt', '/assets/.hidden/note.txt', '/assets/alias.txt',
    '/assets/../private-note.txt', '/assets/%2e%2e/private-note.txt',
    '/assets/%2e%2e%2fprivate-note.txt', '/assets/%5c..%5cprivate-note.txt',
    '/assets/%00icon.svg', '/assets/%zz', '/missing-page', '/assets/missing.js', '/assets/',
  ];
  for (const url of blocked) {
    const response = await request(server, url);
    assert.equal(response.status, 404, url);
    assert.equal(response.headers['content-type'], 'text/plain; charset=utf-8', url);
    assert.equal(response.body, 'Recurso no encontrado.\n', url);
  }
  const post = await request(server, '/', 'POST');
  assert.equal(post.status, 405);
  assert.equal(post.headers.allow, 'GET, HEAD');
});

test('la distribución copia la lista pública y excluye archivos de desarrollo', async (t) => {
  const { directory, files } = await fixture(t);
  const output = path.join(directory, 'dist');
  await mkdir(output);
  await writeFile(path.join(output, 'stale.txt'), 'old-build');
  assert.equal(await buildSite({ sourceDirectory: directory }), output);
  assert.deepEqual((await readdir(output)).sort(), [
    'app.js', 'assets', 'docs', 'index.html', 'materiales.html',
    'noticia-inscripciones.html', 'noticias.html', 'src', 'styles.css', 'temarios.html',
  ]);
  for (const file of ['index.html', 'noticias.html', 'noticia-inscripciones.html', 'temarios.html', 'materiales.html', 'styles.css', 'app.js', 'src/edition.js', 'assets/icon.svg', 'docs/referencias/guide.pdf']) {
    assert.equal(await readFile(path.join(output, file), 'utf8'), files[file]);
  }
  assert.deepEqual((await readdir(path.join(output, 'assets'))).sort(), ['fonts', 'icon.svg']);
  const preview = await serve(t, output);
  assert.equal((await request(preview, '/')).status, 200);
  assert.equal((await request(preview, '/noticias.html')).status, 200);
  assert.equal((await request(preview, '/temarios.html')).status, 200);
  assert.equal((await request(preview, '/materiales.html')).status, 200);
  assert.equal((await request(preview, '/private-note.txt')).status, 404);
});

test('la generación protege la carpeta fuente y conserva el build si faltan entradas', async (t) => {
  const { directory } = await fixture(t);
  await assert.rejects(buildSite({ sourceDirectory: directory, outputDirectory: directory }), /salida/u);
  assert.ok(await readFile(path.join(directory, 'index.html'), 'utf8'));
  const output = path.join(directory, 'dist');
  await mkdir(output);
  await writeFile(path.join(output, 'existing.txt'), 'keep');
  await rm(path.join(directory, 'app.js'));
  await assert.rejects(buildSite({ sourceDirectory: directory }), /ENOENT/u);
  assert.equal(await readFile(path.join(output, 'existing.txt'), 'utf8'), 'keep');
});

test('las opciones de desarrollo y vista previa usan loopback y validan el puerto', () => {
  assert.deepEqual(parseServerOptions([]), { host: '127.0.0.1', port: 4173, preview: false, help: false });
  assert.equal(parseServerOptions(['--preview']).port, 4174);
  assert.deepEqual(parseServerOptions(['--host', '0.0.0.0', '--port', '3000']), {
    host: '0.0.0.0', port: 3000, preview: false, help: false,
  });
  assert.throws(() => parseServerOptions(['--port', '-1']), /puerto/u);
  assert.throws(() => parseServerOptions(['--port', '65536']), /puerto/u);
  assert.throws(() => parseServerOptions(['--host']), /Falta/u);
});
