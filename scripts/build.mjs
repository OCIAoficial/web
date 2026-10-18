import { copyFile, lstat, mkdir, readdir, realpath, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PUBLIC_DIRECTORIES, PUBLIC_FILES, isInsideDirectory } from './public-files.mjs';

export const PROJECT_DIRECTORY = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function copyPublicEntry(source, destination) {
  const entry = await lstat(source);
  if (entry.isSymbolicLink() || await realpath(source) !== source) return;
  if (entry.isDirectory()) {
    await mkdir(destination, { recursive: true });
    for (const name of (await readdir(source)).sort()) {
      if (!name.startsWith('.')) {
        await copyPublicEntry(path.join(source, name), path.join(destination, name));
      }
    }
  } else if (entry.isFile()) {
    await mkdir(path.dirname(destination), { recursive: true });
    await copyFile(source, destination);
  }
}

export async function buildSite({
  sourceDirectory = PROJECT_DIRECTORY,
  outputDirectory = path.join(sourceDirectory, 'dist'),
} = {}) {
  const source = await realpath(sourceDirectory);
  const output = path.resolve(outputDirectory);
  if (isInsideDirectory(output, source)) {
    throw new Error('La carpeta de salida no puede contener la carpeta del proyecto.');
  }

  // Validate the entry points before replacing an existing build.
  for (const file of PUBLIC_FILES) {
    if (!(await lstat(path.join(source, file))).isFile()) {
      throw new Error(`Falta el archivo público ${file}.`);
    }
  }

  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  for (const entry of [...PUBLIC_FILES, ...PUBLIC_DIRECTORIES]) {
    const sourcePath = path.join(source, entry);
    try {
      await lstat(sourcePath);
    } catch (error) {
      if (error.code === 'ENOENT' && PUBLIC_DIRECTORIES.includes(entry)) continue;
      throw error;
    }
    await copyPublicEntry(sourcePath, path.join(output, entry));
  }
  return output;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildSite()
    .then((output) => console.log(`Sitio generado en ${path.relative(PROJECT_DIRECTORY, output)}/`))
    .catch((error) => {
      console.error(`No se pudo generar el sitio: ${error.message}`);
      process.exitCode = 1;
    });
}
