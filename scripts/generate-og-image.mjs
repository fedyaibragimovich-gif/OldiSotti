/** Generate the homepage Open Graph image as a standard RGB PNG (no palette). */
import { mkdir, writeFile } from 'node:fs/promises';
import { deflateSync } from 'node:zlib';

const W = 1200, H = 630;
const pixels = Buffer.alloc(W * H * 3);
const rgb = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));
function paint(x, y, w, h, hex) {
  const [r, g, b] = rgb(hex);
  for (let yy = Math.max(0, y); yy < Math.min(H, y + h); yy++) {
    for (let xx = Math.max(0, x); xx < Math.min(W, x + w); xx++) {
      const i = (yy * W + xx) * 3;
      pixels[i] = r; pixels[i + 1] = g; pixels[i + 2] = b;
    }
  }
}
const glyphs = {
  A:['01110','10001','10001','11111','10001','10001','10001'],
  B:['11110','10001','10001','11110','10001','10001','11110'],
  C:['01111','10000','10000','10000','10000','10000','01111'],
  D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],
  F:['11111','10000','10000','11110','10000','10000','10000'],
  G:['01111','10000','10000','10111','10001','10001','01111'],
  H:['10001','10001','10001','11111','10001','10001','10001'],
  I:['11111','00100','00100','00100','00100','00100','11111'],
  J:['00111','00010','00010','00010','10010','10010','01100'],
  K:['10001','10010','10100','11000','10100','10010','10001'],
  L:['10000','10000','10000','10000','10000','10000','11111'],
  M:['10001','11011','10101','10101','10001','10001','10001'],
  N:['10001','11001','10101','10011','10001','10001','10001'],
  O:['01110','10001','10001','10001','10001','10001','01110'],
  P:['11110','10001','10001','11110','10000','10000','10000'],
  Q:['01110','10001','10001','10001','10101','10010','01101'],
  R:['11110','10001','10001','11110','10100','10010','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'],
  T:['11111','00100','00100','00100','00100','00100','00100'],
  U:['10001','10001','10001','10001','10001','10001','01110'],
  V:['10001','10001','10001','10001','10001','01010','00100'],
  W:['10001','10001','10001','10101','10101','10101','01010'],
  X:['10001','10001','01010','00100','01010','10001','10001'],
  Y:['10001','10001','01010','00100','00100','00100','00100'],
  Z:['11111','00001','00010','00100','01000','10000','11111'],
  '.':['00000','00000','00000','00000','00000','01100','01100'],
  "'":['00100','00100','00010','00000','00000','00000','00000'],
  '-':['00000','00000','00000','11111','00000','00000','00000'],
  ' ':['00000','00000','00000','00000','00000','00000','00000'],
};
function lettering(value, x, y, scale, color) {
  for (const letter of value.toUpperCase()) {
    const rows = glyphs[letter] ?? glyphs[' '];
    rows.forEach((row, gy) => [...row].forEach((bit, gx) => {
      if (bit === '1') paint(x + gx * scale, y + gy * scale, scale, scale, color);
    }));
    x += 6 * scale;
  }
}
paint(0, 0, W, H, '#f8fafc');
paint(42, 42, 1116, 546, '#ffffff');
paint(42, 42, 1116, 16, '#4f46e5');
paint(92, 105, 13, 115, '#4f46e5');
lettering('OLDI', 130, 125, 13, '#0f172a');
lettering('SOTDI.UZ', 130 + 6 * 13 * 4, 125, 13, '#4f46e5');
paint(129, 297, 942, 2, '#e2e8f0');
lettering("O'ZBEKISTON E'LONLAR PLATFORMASI", 132, 355, 4, '#334155');
paint(132, 467, 936, 65, '#eef2ff');
lettering('AVTO  /  UY-JOY  /  ELEKTRONIKA  /  XIZMATLAR', 155, 488, 3, '#3730a3');

const crcTable = Array.from({ length: 256 }, (_, i) => {
  let c = i;
  for (let n = 0; n < 8; n++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(data) {
  let c = 0xffffffff;
  for (const v of data) c = crcTable[(c ^ v) & 255] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(name, data) {
  const kind = Buffer.from(name);
  const result = Buffer.alloc(12 + data.length);
  result.writeUInt32BE(data.length, 0);
  kind.copy(result, 4); data.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([kind, data])), 8 + data.length);
  return result;
}
const raw = Buffer.alloc(H * (1 + W * 3));
for (let y = 0; y < H; y++) pixels.copy(raw, y * (1 + W * 3) + 1, y * W * 3, (y + 1) * W * 3);
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0); ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; ihdr[9] = 2; // PNG color type 2 = 8-bit RGB, no indexed palette.
const png = Buffer.concat([
  Buffer.from('89504e470d0a1a0a', 'hex'), chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0)),
]);
await mkdir('public', { recursive: true });
await writeFile('public/oldisotdi-share-v2.png', png);
console.log(`Generated RGB social preview: ${W}x${H} (${png.length} bytes)`);
