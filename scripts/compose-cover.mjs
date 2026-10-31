#!/usr/bin/env node
/**
 * Builds a project cover by laying real project images side by side, at equal height, on a
 * neutral background. Nothing is redrawn or mocked up: the pieces are only arranged.
 *
 * Usage
 *   npm run cover -- --out <cover.jpg> <image> [image...] [options]
 *
 * Options
 *   --out <file>        Output JPEG (required).
 *   --width <px>        Canvas width. Default 1800.
 *   --height <px>       Canvas height. Default 1200 (3:2, the card format used on the site).
 *   --padding <px>      Space around the arrangement. Default 140.
 *   --gap <px>          Space between images. Default 36.
 *   --bg <hex>          Background colour. Default #E9E9E4 (matches the site's light grey surface).
 *
 * Example
 *   npm run cover -- --out src/content/work/fotoowl-meta-ads/cover.jpg src/content/work/fotoowl-meta-ads/images/meta-ad-01.jpg src/content/work/fotoowl-meta-ads/images/meta-ad-02.jpg
 */
import { resolve } from 'node:path';
import sharp from 'sharp';

function parseArgs(argv) {
  const options = { images: [], width: 1800, height: 1200, padding: 140, gap: 36, bg: '#E9E9E4' };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };
    if (arg === '--out') options.out = next();
    else if (arg === '--width') options.width = Number(next());
    else if (arg === '--height') options.height = Number(next());
    else if (arg === '--padding') options.padding = Number(next());
    else if (arg === '--gap') options.gap = Number(next());
    else if (arg === '--bg') options.bg = next();
    else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else options.images.push(arg);
  }
  if (!options.out) throw new Error('Pass --out <file>.');
  if (options.images.length === 0) throw new Error('Pass at least one image.');
  return options;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const metas = await Promise.all(o.images.map((file) => sharp(resolve(file)).metadata()));
  const ratios = metas.map((m) => m.width / m.height);

  const availableWidth = o.width - o.padding * 2 - o.gap * (ratios.length - 1);
  const availableHeight = o.height - o.padding * 2;
  const rowHeight = Math.floor(Math.min(availableHeight, availableWidth / ratios.reduce((a, b) => a + b, 0)));
  const widths = ratios.map((r) => Math.round(r * rowHeight));
  const rowWidth = widths.reduce((a, b) => a + b, 0) + o.gap * (ratios.length - 1);

  let left = Math.round((o.width - rowWidth) / 2);
  const top = Math.round((o.height - rowHeight) / 2);
  const layers = [];
  for (const [i, file] of o.images.entries()) {
    const w = widths[i];
    // Soft contact shadow so light artwork separates from the background.
    const shadow = await sharp({
      create: { width: w + 80, height: rowHeight + 80, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
    })
      .composite([
        {
          input: await sharp({
            create: { width: w, height: rowHeight, channels: 4, background: { r: 20, g: 18, b: 14, alpha: 0.2 } },
          })
            .png()
            .toBuffer(),
          left: 40,
          top: 52,
        },
      ])
      .blur(18)
      .png()
      .toBuffer();
    layers.push({ input: shadow, left: left - 40, top: top - 40 });
    layers.push({ input: await sharp(resolve(file)).resize(w, rowHeight, { fit: 'fill' }).toBuffer(), left, top });
    left += w + o.gap;
  }

  const info = await sharp({ create: { width: o.width, height: o.height, channels: 3, background: o.bg } })
    .composite(layers)
    .jpeg({ quality: 86, mozjpeg: true, progressive: true })
    .toFile(resolve(o.out));
  console.log(`${o.out}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
