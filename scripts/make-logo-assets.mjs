// One-off: derive web logo assets from the source logo.jpg (dark, black bg).
//   - logo-mark.png   : black border trimmed off → tight mark (used in the nav
//                       with mix-blend-mode:lighten so the black bg disappears
//                       against the dark header; also the favicon source).
//   - favicon-32.png  : 32px square mark on black (browser tab icon).
//   - apple-touch.png : 180px square mark on black.
//   - og-default.png  : 1200×630 share card, mark centered on black.
// Run: node scripts/make-logo-assets.mjs
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(__dirname, '..', 'public', 'images');
// Source logo lives outside the repo. Pass its path via LOGO_SRC:
//   LOGO_SRC=/path/to/logo.jpg node scripts/make-logo-assets.mjs
const SRC = process.env.LOGO_SRC || path.resolve(__dirname, '..', 'logo-source.jpg');

// Tight-trim the black border to get the bare mark.
const markBuf = await sharp(SRC).trim({ threshold: 25 }).png().toBuffer();
const mark = sharp(markBuf);
const meta = await mark.metadata();
console.log(`trimmed mark: ${meta.width}x${meta.height}`);

// Nav mark + favicon source — cap height for crispness, keep aspect.
await sharp(markBuf).resize({ height: 240 }).png().toFile(path.join(OUT, 'logo-mark.png'));

// Square favicons: center the (likely non-square) mark on a square black canvas.
const composeSquare = async (size, file) => {
  const inner = await sharp(markBuf)
    .resize({ width: Math.round(size * 0.8), height: Math.round(size * 0.8), fit: 'inside' })
    .png()
    .toBuffer();
  await sharp({ create: { width: size, height: size, channels: 3, background: '#0e0e0e' } })
    .composite([{ input: inner, gravity: 'center' }])
    .png()
    .toFile(path.join(OUT, file));
};

await composeSquare(32, 'favicon-32.png');
await composeSquare(180, 'apple-touch.png');

// OG share card: mark centered on a 1200x630 black canvas.
const ogInner = await sharp(markBuf).resize({ height: 360, fit: 'inside' }).png().toBuffer();
await sharp({ create: { width: 1200, height: 630, channels: 3, background: '#0e0e0e' } })
  .composite([{ input: ogInner, gravity: 'center' }])
  .png()
  .toFile(path.join(OUT, 'og-default.png'));

console.log('Wrote logo-mark.png, favicon-32.png, apple-touch.png, og-default.png');
