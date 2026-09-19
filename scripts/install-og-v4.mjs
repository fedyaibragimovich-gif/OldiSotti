import { readFile, writeFile } from 'node:fs/promises';

// The asset is stored as text to support the repository's text-only file connector.
// Decode it before Vite copies public assets; never serve base64 text as a .jpg.
const encoded = (await readFile(new URL('./og-share-v4.base64', import.meta.url), 'utf8')).trim();
if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
  throw new Error('Invalid illustrated social-preview base64');
}
const jpeg = Buffer.from(encoded, 'base64');
if (jpeg.length < 1000 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg.at(-2) !== 0xff || jpeg.at(-1) !== 0xd9) {
  throw new Error('Illustrated social-preview source is not a complete JPEG');
}
await writeFile(new URL('../public/oldisotdi-share-v4.jpg', import.meta.url), jpeg);
console.log(`Generated illustrated JPEG preview (${jpeg.length} bytes)`);
