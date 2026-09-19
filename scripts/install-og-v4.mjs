import { readFile, writeFile } from 'node:fs/promises';

// Preserve the illustrated JPEG in small text segments for the text-only GitHub connector.
const first = await readFile(new URL('./social-hero-v4/part-01.b64', import.meta.url), 'utf8');
const second = await readFile(new URL('./social-hero-v4/part-02.b64', import.meta.url), 'utf8');
const encoded = `${first}${second}`.replace(/\s+/g, '');
if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(encoded)) {
  throw new Error('Invalid illustrated social-preview base64');
}
const jpeg = Buffer.from(encoded, 'base64');
if (jpeg.length < 1000 || jpeg[0] !== 0xff || jpeg[1] !== 0xd8 || jpeg.at(-2) !== 0xff || jpeg.at(-1) !== 0xd9) {
  throw new Error('Illustrated social-preview source is not a complete JPEG');
}
await writeFile(new URL('../public/oldisotdi-share-v4.jpg', import.meta.url), jpeg);
console.log(`Generated illustrated JPEG preview (${jpeg.length} bytes)`);
