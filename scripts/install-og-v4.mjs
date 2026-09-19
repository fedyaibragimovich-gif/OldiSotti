import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const readEncoded = async (path) => (await readFile(new URL(path, import.meta.url), 'utf8')).trim();
const partial = Buffer.from((await readEncoded('./social-hero-v4/part-01.b64')) + (await readEncoded('./social-hero-v4/part-02.b64')), 'base64');
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
const prefix = partial.subarray(0, 9000);
if (prefix.length !== 9000 || hash(prefix) !== '8306aacdf1a2cadf4e01ce1ccc4a6aaeb8502250a01aa1b31ee97e844d96fe07') {
  throw new Error(`Archived JPEG prefix differs from original. Length=${partial.length}; diagnostic SHA256 1800=${hash(partial.subarray(0,1800))} 3000=${hash(partial.subarray(0,3000))} 5000=${hash(partial.subarray(0,5000))} 8000=${hash(partial.subarray(0,8000))}`);
}
const jpeg = Buffer.concat([prefix, Buffer.from(await readEncoded('./og-v5-tail.base64'), 'base64')]);
if (jpeg.length !== 10708 || hash(jpeg) !== '7b2242ed85f2df1db767a1cdc55ebea1bdfdf47549c20eab323a9d60b67f59dc') throw new Error('Full illustrated JPEG checksum mismatch');
const sof = jpeg.indexOf(Buffer.from([0xff, 0xc0]));
if (sof < 0 || jpeg.readUInt16BE(sof+5) !== 315 || jpeg.readUInt16BE(sof+7) !== 600) throw new Error('Unexpected JPEG dimensions');
for (const file of ['oldisotdi-share-v4.jpg','oldisotdi-share-v5.jpg']) await writeFile(new URL(`../public/${file}`,import.meta.url),jpeg);
console.log(`Validated complete illustrated JPEG: ${jpeg.length} bytes`);
