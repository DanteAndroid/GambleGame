import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');
const OPT_DIR = path.join(ASSETS_DIR, 'opt');
const FONTS_DIR = path.join(PUBLIC_DIR, 'fonts');

const IMAGE_EXTS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

function walkFiles(dir, predicate) {
  const results = [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (full === OPT_DIR) continue;
      results.push(...walkFiles(full, predicate));
    } else if (!predicate || predicate(full)) {
      results.push(full);
    }
  }
  return results;
}

function collectCorpusCharacters() {
  const chars = new Set();
  const basePunctuation =
    '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ' +
    ' ，。、；：？！「」『』《》（）【】—…·・～＋－×÷＝％￥$@#&*';
  for (const ch of basePunctuation) chars.add(ch);

  const files = [
    path.join(ROOT, 'index.html'),
    ...walkFiles(SRC_DIR, (p) => /\.(ts|tsx|css)$/.test(p)),
  ];

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const ch of content) {
      if (ch.trim()) chars.add(ch);
    }
  }
  return [...chars].sort().join('');
}

function collectDisplayCharacters() {
  const chars = new Set();
  const staticDisplayCopy =
    '博弈游戏全部赌局待收录作品书架0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ《》「」·— ';
  for (const ch of staticDisplayCopy) {
    if (ch.trim()) chars.add(ch);
  }

  const dataFiles = walkFiles(path.join(SRC_DIR, 'data'), (p) => /\.ts$/.test(p));
  for (const file of dataFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Match title: '...' and spreadTitleLines: ['...', '...']
    for (const m of content.matchAll(/(?:title:\s*['"]([^'"]+)['"]|spreadTitleLines:\s*\[([^\]]+)\])/g)) {
      const text = m[1] || m[2] || '';
      for (const ch of text) {
        if (ch.trim()) chars.add(ch);
      }
    }
  }
  return [...chars].sort().join('');
}

async function resolvePyftsubset() {
  const candidates = [
    'pyftsubset',
    '/Users/l/.local/bin/pyftsubset',
    '/opt/homebrew/bin/pyftsubset',
  ];
  for (const bin of candidates) {
    try {
      await execFileAsync(bin, ['--help']);
      return bin;
    } catch {
      // try next
    }
  }
  throw new Error('pyftsubset not found');
}

async function subsetFonts() {
  const pyftsubset = await resolvePyftsubset();
  const fullCorpus = collectCorpusCharacters();
  const displayCorpus = collectDisplayCharacters();
  const fullCharsFile = path.join(os.tmpdir(), 'gamblegame-font-chars.txt');
  const displayCharsFile = path.join(os.tmpdir(), 'gamblegame-display-chars.txt');
  fs.writeFileSync(fullCharsFile, fullCorpus, 'utf8');
  fs.writeFileSync(displayCharsFile, displayCorpus, 'utf8');

  const jobs = [
    {
      src: path.join(FONTS_DIR, 'PingFangLaiJiangHuLangYa.ttf'),
      dst: path.join(FONTS_DIR, 'PingFangLaiJiangHuLangYa-subset.woff2'),
      charsFile: displayCharsFile,
      count: displayCorpus.length,
    },
    {
      src: path.join(FONTS_DIR, 'HuiwenMincho-GBK.ttf'),
      dst: path.join(FONTS_DIR, 'HuiwenMincho-subset.woff2'),
      charsFile: fullCharsFile,
      count: fullCorpus.length,
    },
  ];

  for (const job of jobs) {
    if (!fs.existsSync(job.src)) {
      throw new Error(`Missing source font: ${job.src}`);
    }
    await execFileAsync(pyftsubset, [
      job.src,
      `--text-file=${job.charsFile}`,
      '--unicodes=U+0020-007E',
      '--flavor=woff2',
      '--layout-features=*',
      `--output-file=${job.dst}`,
    ]);

    const srcKB = (fs.statSync(job.src).size / 1024).toFixed(1);
    const dstKB = (fs.statSync(job.dst).size / 1024).toFixed(1);
    console.log(
      `Font ${path.basename(job.src)} [${job.count} chars] (${srcKB} KB) -> ${path.basename(job.dst)} (${dstKB} KB)`
    );
  }
  fs.rmSync(fullCharsFile, { force: true });
  fs.rmSync(displayCharsFile, { force: true });
}

async function convertOneVariant(src, dst, maxWidth, quality) {
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (fs.existsSync(dst)) {
    const srcMtime = fs.statSync(src).mtimeMs;
    const dstMtime = fs.statSync(dst).mtimeMs;
    if (dstMtime >= srcMtime) return;
  }
  await execFileAsync('magick', [
    src,
    '-auto-orient',
    '-strip',
    '-resize',
    `${maxWidth}x>`,
    '-quality',
    String(quality),
    '-define',
    'webp:method=6',
    dst,
  ]);
}

async function runPool(items, concurrency, worker) {
  let cursor = 0;
  async function next() {
    while (cursor < items.length) {
      const idx = cursor++;
      await worker(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, next));
}

async function optimizeImages() {
  const files = walkFiles(ASSETS_DIR, (p) =>
    IMAGE_EXTS.has(path.extname(p).toLowerCase())
  ).sort();

  let srcBytes = 0;
  let thumbBytes = 0;
  let displayBytes = 0;
  const optimizedUrls = [];

  await runPool(files, 8, async (srcFile) => {
    const rel = path.relative(ASSETS_DIR, srcFile);
    const relNoExt = rel.replace(/\.[^.]+$/, '');
    const thumbDst = path.join(OPT_DIR, 'thumb', `${relNoExt}.webp`);
    const displayDst = path.join(OPT_DIR, 'display', `${relNoExt}.webp`);

    await convertOneVariant(srcFile, thumbDst, 440, 80);
    await convertOneVariant(srcFile, displayDst, 1080, 84);

    srcBytes += fs.statSync(srcFile).size;
    thumbBytes += fs.statSync(thumbDst).size;
    displayBytes += fs.statSync(displayDst).size;

    const publicUrl = '/assets/' + rel.split(path.sep).join('/');
    optimizedUrls.push(publicUrl);
  });

  optimizedUrls.sort();
  const manifestPath = path.join(SRC_DIR, 'data', 'optimizedImages.ts');
  const manifestContent =
    `// Auto-generated by scripts/optimize-assets.mjs. Do not edit manually.\n` +
    `export const OPTIMIZED_ASSET_PATHS: ReadonlySet<string> = new Set([\n` +
    optimizedUrls.map((u) => `  '${u}',`).join('\n') +
    `\n]);\n`;
  fs.writeFileSync(manifestPath, manifestContent, 'utf8');

  console.log(
    `Optimized ${optimizedUrls.length} images:\n` +
      `  Original total : ${(srcBytes / 1024 / 1024).toFixed(2)} MB\n` +
      `  Thumb (440px)  : ${(thumbBytes / 1024 / 1024).toFixed(2)} MB\n` +
      `  Display(1080px): ${(displayBytes / 1024 / 1024).toFixed(2)} MB\n` +
      `  Manifest       : ${path.relative(ROOT, manifestPath)}`
  );
}

async function main() {
  await subsetFonts();
  await optimizeImages();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
