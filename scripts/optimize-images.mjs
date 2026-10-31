#!/usr/bin/env node
/**
 * Turns design exports (PNG, JPG, WebP, TIFF) into web-ready JPEG files for the portfolio.
 *
 * - Resizes to a maximum width (never enlarges).
 * - Removes all metadata (Canva/Adobe document IDs, location data, content credentials).
 * - Flattens transparency onto white and saves a high-quality progressive JPEG.
 *
 * Usage
 *   npm run images -- <file-or-folder> [more files...] --out <folder> [options]
 *
 * Options
 *   --out <folder>      Where to write the JPEGs (required).
 *   --name <prefix>     Name outputs <prefix>-01.jpg, <prefix>-02.jpg ... (default: original file names).
 *   --width <px>        Maximum width. Default 1800.
 *   --quality <1-100>   JPEG quality. Default 82.
 *   --crop x,y,w,h      Crop this rectangle (in source pixels) before resizing.
 *
 * Example
 *   npm run images -- "D:\Fotoowl\Navratri (1).png" --out src/content/work/fotoowl-whatsapp-creatives/images --name navratri --width 1200
 */
import { mkdir, readdir, stat } from 'node:fs/promises';
import { basename, extname, join, resolve } from 'node:path';
import sharp from 'sharp';

const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.tif', '.tiff', '.avif']);

function parseArgs(argv) {
  const options = { inputs: [], width: 1800, quality: 82 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };
    if (arg === '--out') options.out = next();
    else if (arg === '--name') options.name = next();
    else if (arg === '--width') options.width = Number(next());
    else if (arg === '--quality') options.quality = Number(next());
    else if (arg === '--crop') options.crop = next().split(',').map(Number);
    else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else options.inputs.push(arg);
  }
  if (!options.out) throw new Error('Pass --out <folder>.');
  if (options.inputs.length === 0) throw new Error('Pass at least one image file or folder.');
  if (options.crop && (options.crop.length !== 4 || options.crop.some(Number.isNaN))) {
    throw new Error('--crop expects x,y,width,height');
  }
  return options;
}

async function expandInputs(inputs) {
  const files = [];
  for (const input of inputs) {
    const path = resolve(input);
    const info = await stat(path);
    if (info.isDirectory()) {
      const entries = (await readdir(path)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      for (const entry of entries) {
        if (IMAGE_EXTENSIONS.has(extname(entry).toLowerCase())) files.push(join(path, entry));
      }
    } else {
      files.push(path);
    }
  }
  return files;
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const files = await expandInputs(options.inputs);
  if (files.length === 0) throw new Error('No image files found.');
  await mkdir(resolve(options.out), { recursive: true });

  for (const [index, file] of files.entries()) {
    const outName = options.name
      ? files.length === 1
        ? `${options.name}.jpg`
        : `${options.name}-${String(index + 1).padStart(2, '0')}.jpg`
      : `${slugify(basename(file, extname(file)))}.jpg`;
    const target = resolve(options.out, outName);

    let pipeline = sharp(file, { limitInputPixels: false }).rotate();
    if (options.crop) {
      const [left, top, width, height] = options.crop;
      pipeline = pipeline.extract({ left, top, width, height });
    }
    const info = await pipeline
      .resize({ width: options.width, withoutEnlargement: true })
      .flatten({ background: '#ffffff' })
      .jpeg({ quality: options.quality, mozjpeg: true, progressive: true, chromaSubsampling: '4:4:4' })
      .toFile(target);
    console.log(`${outName}  ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
