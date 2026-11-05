/**
 * Footer backdrop (the lakebed, art 1440×900): bubbles in 3D. A steady stream rises from the
 * diving quail's helmet and fades out before the footer's links; a few faint ones drift up
 * along the lakebed (as faint as the art's own, so text above stays easy to read).
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, bubbles, frameArt, rng } from './kit';

/** The diving quail (footer.svg #f-diver-quail at 1160, 780): top of its helmet. */
const HELMET: [number, number] = [1174, 702];

export function createLakebedBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const rand = rng(5);

  const stream = bubbles({
    count: tier === 'high' ? 12 : 7,
    x: [HELMET[0], HELMET[0]],
    y: [HELMET[1], HELMET[1]],
    top: 580, // gone well before the contact column above the quail
    size: [2.5, 5.5],
    color: '#84dbf7',
    opacity: 0.6,
    speed: 30,
    from: () => [HELMET[0] - 3 + rand() * 6, HELMET[1]],
    seed: 3,
  });
  const ambient = bubbles({
    count: tier === 'high' ? 18 : 10,
    x: [40, 1400],
    y: [700, 880],
    top: 610, // fade out inside the layer's band (mount.ts region starts at 560)
    size: [1.6, 4.2],
    color: '#84dbf7',
    opacity: 0.25,
    speed: 16,
    seed: 9,
  });
  scene.add(stream.mesh, ambient.mesh);

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(t, dt) {
      stream.update(t, dt);
      ambient.update(t, dt);
    },
  };
}
