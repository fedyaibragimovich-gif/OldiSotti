/** Build smooth, branded social previews without runtime fonts, remote services or new dependencies. */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { deflateSync, inflateSync } from 'node:zlib';

const W = 1200;
const H = 630;
const pixels = Buffer.alloc(W * H * 3);
const palette = {
  canvas: [248, 250, 252], white: [255, 255, 255], ink: [15, 23, 42],
  indigo: [79, 70, 229], muted: [51, 65, 85], border: [226, 232, 240],
  lavender: [238, 242, 255], deepIndigo: [55, 48, 163]
};
function rect(x, y, w, h, color) {
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
      const i = (yy * W + xx) * 3;
      pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2];
    }
  }
}
function roundedRect(x, y, w, h, radius, color) {
  for (let yy = y; yy < y + h; yy++) {
    for (let xx = x; xx < x + w; xx++) {
      const dx = Math.max(x + radius - xx, 0, xx - (x + w - radius - 1));
      const dy = Math.max(y + radius - yy, 0, yy - (y + h - radius - 1));
      if (dx * dx + dy * dy > radius * radius) continue;
      const i = (yy * W + xx) * 3;
      pixels[i] = color[0]; pixels[i + 1] = color[1]; pixels[i + 2] = color[2];
    }
  }
}

// The masks are pre-rendered, antialiased glyph alpha channels, NOT font files.
// They give stable typography on Vercel, independent of installed system fonts.
const masks = JSON.parse(await readFile(new URL('./og-text-masks-v3.json', import.meta.url), 'utf8'));
function text(key, x, y, color) {
  const { width, height, data } = masks[key];
  if (!Number.isSafeInteger(width) || !Number.isSafeInteger(height) || width < 1 || height < 1 || width > W || height > H) {
    throw new Error(`Invalid social-preview text mask dimensions: ${key}`);
  }
  const alpha = inflateSync(Buffer.from(data, 'base64'));
  if (alpha.length !== width * height || x < 0 || y < 0 || x + width > W || y + height > H) {
    throw new Error(`Invalid social-preview text mask data: ${key}`);
  }
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const a = alpha[row * width + col];
      if (!a) continue;
      const p = ((row + y) * W + col + x) * 3;
      for (let channel = 0; channel < 3; channel++) {
        pixels[p + channel] = Math.round((color[channel] * a + pixels[p + channel] * (255 - a)) / 255);
      }
    }
  }
}

rect(0, 0, W, H, palette.canvas);
roundedRect(44, 42, 1112, 546, 28, palette.white);
rect(44, 42, 1112, 13, palette.indigo);
roundedRect(99, 126, 12, 126, 5, palette.indigo);
text('oldi', 151, 139, palette.ink);
text('sotdi', 355, 139, palette.indigo);
rect(151, 292, 898, 2, palette.border);
text('subtitle', 152, 354, palette.muted);
roundedRect(151, 468, 898, 73, 14, palette.lavender);
text('categories', 184, 493, palette.deepIndigo);

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let bit = 0; bit < 8; bit++) c = c & 1 ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  return c >>> 0;
});
function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type, contents) {
  const label = Buffer.from(type);
  const out = Buffer.alloc(12 + contents.length);
  out.writeUInt32BE(contents.length, 0);
  label.copy(out, 4); contents.copy(out, 8);
  out.writeUInt32BE(crc32(Buffer.concat([label, contents])), 8 + contents.length);
  return out;
}
const scanlines = Buffer.alloc(H * (1 + W * 3));
for (let row = 0; row < H; row++) {
  pixels.copy(scanlines, row * (1 + W * 3) + 1, row * W * 3, (row + 1) * W * 3);
}
const header = Buffer.alloc(13);
header.writeUInt32BE(W, 0); header.writeUInt32BE(H, 4);
header[8] = 8; header[9] = 2; // Standard truecolor RGB PNG, no indexed palette.
const png = Buffer.concat([
  Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', header),
  chunk('IDAT', deflateSync(scanlines, { level: 9 })), chunk('IEND', Buffer.alloc(0))
]);
await mkdir(new URL('../public/', import.meta.url), { recursive: true });
// Keep previous share links functional while the new cache-busting URL propagates.
for (const filename of ['oldisotdi-share-v2.png', 'oldisotdi-share-v3.png']) {
  await writeFile(new URL(`../public/${filename}`, import.meta.url), png);
}
console.log(`Generated smooth RGB social preview: ${W}x${H}, ${png.length} bytes`);
