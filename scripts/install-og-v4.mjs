import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// The previous illustrated JPEG was accidentally archived without its final bytes.
// Rebuild from its unchanged first 9,000 bytes and the independently preserved tail.
// Verify both hashes to fail the build rather than deploy a JPEG with only valid markers.
const readEncoded = async (path) => (await readFile(new URL(path, import.meta.url), 'utf8')).trim();
const partial = Buffer.from(
  (await readEncoded('./social-hero-v4/part-01.b64')) +
  (await readEncoded('./social-hero-v4/part-02.b64')),
  'base64'
);
const prefix = partial.subarray(0, 9000);
const hash = (bytes) => createHash('sha256').update(bytes).digest('hex');
if (prefix.length !== 9000 || hash(prefix) !== '8306aacdf1a2cadf4e01ce1ccc4a6aaeb8502250a01aa1b31ee97e844d96fe07') {
  throw new Error('Illustrated JPEG prefix does not match the original image');
}
const tail = Buffer.from(await readEncoded('./og-v5-tail.base64'), 'base64');
const jpeg = Buffer.concat([prefix, tail]);
if (jpeg.length !== 10708 || hash(jpeg) !== '7b2242ed85f2df1db767a1cdc55ebea1bdfdf47549c20eab323a9d60b67f59dc') {
  throw new Error('Illustrated JPEG is incomplete or its checksum does not match');
}
const sof = jpeg.indexOf(Buffer.from([0xff, 0xc0]));
if (sof < 0 || jpeg.readUInt16BE(sof + 5) !== 315 || jpeg.readUInt16BE(sof + 7) !== 600) {
  throw new Error('Illustrated JPEG has unexpected dimensions');
}
// Repair the previously published URL and expose a fresh URL for Telegram cache busting.
for (const file of ['oldisotdi-share-v4.jpg', 'oldisotdi-share-v5.jpg']) {
  await writeFile(new URL(`../public/${file}`, import.meta.url), jpeg);
}
console.log(`Verified illustrated JPEG: 600x315, ${jpeg.length} bytes, SHA-256 ${hash(jpeg)}`);
