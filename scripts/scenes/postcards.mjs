/**
 * Postcard pictures for the phone Explore cards (About.tsx): a 3:2 crop of each stop's scene,
 * rendered from src/assets/scenes/*.svg to public/images/explore/*.webp.
 * Run after changing a scene: node scripts/scenes/postcards.mjs
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

/** Crop boxes in art units (each scene is 1440 wide), framed on the scene's key feature. */
const CARDS = {
  sky: { scene: 'tracks', x: 760, y: 40, w: 680, h: 453 }, // moon and constellations
  bridge: { scene: 'schedule', x: 220, y: 380, w: 1080, h: 720 }, // the trestle and the cyclist
  vineyard: { scene: 'sponsors', x: 600, y: 640, w: 840, h: 560 }, // the winery among the rows
  lake: { scene: 'involved', x: 400, y: 165, w: 1040, h: 693 }, // sailboats, paddleboarder, dock
  water: { scene: 'faq', x: 540, y: 40, w: 900, h: 600 }, // a kokanee school in the light rays
};
const OUT_W = 640;
const OUT_H = 427;
const ART_W = 1440;
const RENDER_W = 2880; // render each scene at 2× before cropping, so the crops stay sharp

await mkdir('public/images/explore', { recursive: true });
for (const [name, c] of Object.entries(CARDS)) {
  const file = `src/assets/scenes/${c.scene}.svg`;
  const { width } = await sharp(file).metadata(); // pixel width at 72 dpi
  const k = RENDER_W / ART_W;
  await sharp(file, { density: (72 * RENDER_W) / width })
    .extract({ left: Math.round(c.x * k), top: Math.round(c.y * k), width: Math.round(c.w * k), height: Math.round(c.h * k) })
    .resize(OUT_W, OUT_H, { fit: 'cover' })
    .webp({ quality: 78 })
    .toFile(`public/images/explore/${name}.webp`);
  console.log('wrote', `public/images/explore/${name}.webp`);
}
