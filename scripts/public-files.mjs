import path from 'node:path';

export const PUBLIC_FILES = [
  'index.html', 'noticias.html', 'noticia-inscripciones.html',
  'temarios.html', 'materiales.html', 'styles.css', 'app.js',
];
export const PUBLIC_DIRECTORIES = ['src', 'assets', 'docs/referencias'];

export function isPublicPath(relativePath) {
  const parts = relativePath.split('/');
  if (parts.some((part) => !part || part.startsWith('.') || part.includes('\\'))) {
    return false;
  }
  return PUBLIC_FILES.includes(relativePath)
    || PUBLIC_DIRECTORIES.some((directory) => relativePath.startsWith(`${directory}/`));
}

export function isInsideDirectory(directory, file) {
  const relativePath = path.relative(directory, file);
  return relativePath !== '..'
    && !relativePath.startsWith(`..${path.sep}`)
    && !path.isAbsolute(relativePath);
}
