#!/usr/bin/env node
/**
 * Makes a web-friendly copy of a finished video plus a poster image for the portfolio.
 * Needs ffmpeg and ffprobe on the PATH. The source file is never changed.
 *
 * Output
 *   public/media/video/<name>.mp4         H.264 + AAC, fast-start, long edge capped (default 1920 px)
 *   <poster-dir>/<name>-poster.jpg         a still frame used before the video plays
 *
 * Usage
 *   npm run video -- <input.mp4> --name <file-name> --poster-dir <folder> [options]
 *
 * Options
 *   --name <file-name>    Output file name without extension (required), e.g. fotoowl-publish-landscape
 *   --poster-dir <dir>    Folder for the poster JPEG, usually the project's images folder (required)
 *   --poster <seconds>    Time of the poster frame. Default 2.
 *   --max <px>            Longest edge of the web copy. Default 1920.
 *   --crf <number>        Quality: lower is better and larger. Default 28.
 *   --blur x,y,w,h,from,to
 *                         Blur a rectangle (source pixels) between two times in seconds, e.g. to
 *                         hide an email address. Repeat the option for more areas.
 *
 * Example
 *   npm run video -- "D:\Tutorial\output-new\publish-vertical_2026-10-27_12-46-41.mp4" --name fotoowl-publish-vertical --poster-dir src/content/work/fotoowl-videos/images --poster 6
 */
import { spawnSync } from 'node:child_process';
import { mkdir, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

function parseArgs(argv) {
  const options = { poster: 2, max: 1920, crf: 28, blur: [] };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    const next = () => {
      const value = argv[++i];
      if (value === undefined) throw new Error(`Missing value for ${arg}`);
      return value;
    };
    if (arg === '--name') options.name = next();
    else if (arg === '--poster-dir') options.posterDir = next();
    else if (arg === '--poster') options.poster = Number(next());
    else if (arg === '--max') options.max = Number(next());
    else if (arg === '--crf') options.crf = Number(next());
    else if (arg === '--blur') {
      const parts = next().split(',').map(Number);
      if (parts.length !== 6 || parts.some(Number.isNaN)) throw new Error('--blur expects x,y,w,h,from,to');
      options.blur.push(parts);
    } else if (arg.startsWith('--')) throw new Error(`Unknown option ${arg}`);
    else options.input = arg;
  }
  if (!options.input) throw new Error('Pass the input video path.');
  if (!options.name || !/^[a-z0-9-]+$/.test(options.name)) {
    throw new Error('Pass --name using lowercase letters, numbers and dashes.');
  }
  if (!options.posterDir) throw new Error('Pass --poster-dir <folder>.');
  return options;
}

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (result.error) throw new Error(`Could not start ${command}: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} failed:\n${result.stderr.slice(-2000)}`);
  return result.stdout;
}

function probe(file) {
  const json = JSON.parse(
    run('ffprobe', ['-v', 'error', '-show_entries', 'stream=codec_type,width,height:format=duration', '-of', 'json', file]),
  );
  const video = json.streams.find((s) => s.codec_type === 'video');
  return {
    width: video.width,
    height: video.height,
    hasAudio: json.streams.some((s) => s.codec_type === 'audio'),
    duration: Number(json.format.duration),
  };
}

const even = (n) => Math.max(2, Math.round(n / 2) * 2);

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const input = resolve(options.input);
  const source = probe(input);
  const scale = Math.min(1, options.max / Math.max(source.width, source.height));
  const width = even(source.width * scale);
  const height = even(source.height * scale);

  // Optional blur boxes are applied on the full-resolution frame, then the result is scaled.
  const filters = [];
  let label = '0:v';
  options.blur.forEach(([x, y, w, h, from, to], i) => {
    filters.push(
      `[${label}]split[base${i}][copy${i}]`,
      `[copy${i}]crop=${w}:${h}:${x}:${y},boxblur=luma_radius=24:luma_power=3[blur${i}]`,
      `[base${i}][blur${i}]overlay=${x}:${y}:enable='between(t,${from},${to})'[v${i}]`,
    );
    label = `v${i}`;
  });
  filters.push(`[${label}]scale=${width}:${height}:flags=lanczos,setsar=1,format=yuv420p[out]`);

  const outDir = resolve('public/media/video');
  await mkdir(outDir, { recursive: true });
  const target = join(outDir, `${options.name}.mp4`);
  const args = [
    '-y', '-v', 'error', '-i', input,
    '-filter_complex', filters.join(';'),
    '-map', '[out]',
    ...(source.hasAudio ? ['-map', '0:a:0', '-c:a', 'aac', '-b:a', '128k', '-ac', '2'] : ['-an']),
    '-c:v', 'libx264', '-preset', 'slow', '-crf', String(options.crf), '-profile:v', 'high',
    '-movflags', '+faststart', target,
  ];
  run('ffmpeg', args);

  // Poster: grab the frame from the web copy so any blur is included.
  const posterDir = resolve(options.posterDir);
  await mkdir(posterDir, { recursive: true });
  const frame = join(tmpdir(), `${options.name}-poster-${Date.now()}.png`);
  const at = Math.min(options.poster, Math.max(0, source.duration - 0.2));
  run('ffmpeg', ['-y', '-v', 'error', '-ss', String(at), '-i', target, '-frames:v', '1', frame]);
  const posterPath = join(posterDir, `${options.name}-poster.jpg`);
  await sharp(frame).jpeg({ quality: 84, mozjpeg: true, progressive: true }).toFile(posterPath);
  await rm(frame, { force: true });

  const out = probe(target);
  const size = (await stat(target)).size;
  console.log(
    `${options.name}.mp4  ${out.width}x${out.height}  ${out.duration.toFixed(1)}s  ${(size / 1024 / 1024).toFixed(1)} MB  poster @ ${at}s`,
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
