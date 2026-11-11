import { cp, mkdir, readdir, rm } from 'node:fs/promises';
await rm('dist', { recursive: true, force: true });
await mkdir('dist');
await cp('index.html', 'dist/index.html');
for (const entry of await readdir('.', { withFileTypes: true })) {
  if (entry.isDirectory() && /^v\d+$/.test(entry.name)) {
    await cp(`${entry.name}/dist`, `dist/${entry.name}`, { recursive: true });
  }
}
