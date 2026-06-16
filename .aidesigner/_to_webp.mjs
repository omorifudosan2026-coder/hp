import sharp from "sharp";

const input = process.argv[2];
const output = process.argv[3];
const THRESHOLD = 240;

if (!input || !output) {
  console.error("usage: node _to_webp.mjs <input.png> <output.webp>");
  process.exit(1);
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const out = Buffer.from(data);

const visited = new Uint8Array(width * height);
const stack = [];
const push = (idx) => { if (!visited[idx]) stack.push(idx); };

for (let x = 0; x < width; x++) { push(x); push((height - 1) * width + x); }
for (let y = 0; y < height; y++) { push(y * width); push(y * width + width - 1); }

while (stack.length) {
  const idx = stack.pop();
  if (visited[idx]) continue;
  visited[idx] = 1;
  const i = idx * channels;
  if (out[i] < THRESHOLD || out[i + 1] < THRESHOLD || out[i + 2] < THRESHOLD) continue;
  out[i + 3] = 0;
  const x = idx % width;
  const y = (idx - x) / width;
  if (x > 0) push(idx - 1);
  if (x < width - 1) push(idx + 1);
  if (y > 0) push(idx - width);
  if (y < height - 1) push(idx + width);
}

await sharp(out, { raw: { width, height, channels } })
  .webp({ quality: 85, alphaQuality: 90, effort: 6 })
  .toFile(output);
const meta = await sharp(output).metadata();
const stat = await import("node:fs/promises").then((fs) => fs.stat(output));
console.log("Done:", output, `${meta.width}x${meta.height}`, `${stat.size} bytes`);
