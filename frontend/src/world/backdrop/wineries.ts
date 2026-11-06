/**
 * Sponsors backdrop (valley wineries, art 1440×1200): the orchard's seven trees in 3D,
 * swaying gently from the trunk, and a small flock of birds crossing the open hills above
 * the barn. Trees take the art's exact spots, colours and ink outlines (green canopy, coral
 * fruit, brown trunk). Everything stays in the hills below the content.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, bird, frameArt, inked } from './kit';

/** From sponsors.svg .tree: canopy centre (x, y), trunk base y. */
const TREES: [number, number, number][] = [
  [90, 879, 915],
  [160, 889, 925],
  [960, 874, 910],
  [1020, 882, 918],
  [1380, 869, 905],
  [520, 1036, 1072],
  [580, 1044, 1080],
];

export function createWineriesBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const canopyGeo = new THREE.IcosahedronGeometry(24, 2);
  const fruitGeo = new THREE.SphereGeometry(5, 10, 8);
  const trunkGeo = new THREE.CylinderGeometry(4, 4.5, 22, 8);

  const trees = TREES.map(([x, y, base], i) => {
    const pivot = new THREE.Group(); // sways around the trunk base
    pivot.position.set(x, -base, -10);
    const trunk = inked(trunkGeo, '#6b4a3a', 1.6);
    trunk.position.set(0, 11, 0);
    const canopy = inked(canopyGeo, '#3fb86f', 2.5, { high: 0.35, shade: 0.3 });
    canopy.position.set(0, base - y, 0);
    pivot.add(trunk, canopy);
    // Two coral fruit, like the art (offsets from the canopy centre).
    for (const [fx, fy] of [[-8, -6], [9, 6]]) {
      const f = inked(fruitGeo, '#ff8a7a', 1.2);
      f.position.set(fx, base - y - fy, 18);
      pivot.add(f);
    }
    scene.add(pivot);
    return { pivot, phase: i * 1.37 };
  });

  // A flock crossing right → left above the barn hill (art y ≈ 730–790), wrapping around.
  const birds = Array.from({ length: tier === 'high' ? 5 : 3 }, (_, i) => {
    const b = bird(14 + (i % 3) * 3);
    scene.add(b.group);
    return { b, dx: (i % 3) * 34 + Math.floor(i / 3) * 18, dy: ((i * 7) % 5) * 9 - (i % 2) * 14, phase: i * 1.1 };
  });
  const FLOCK_Y = 760;
  const SPAN = 1440 + 400;

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(t, _dt, ctx) {
      for (const tr of trees) {
        // Calm sway, never in sync: a slow swing plus a little gust.
        tr.pivot.rotation.z = Math.sin(t * 0.6 + tr.phase) * 0.035 + Math.sin(t * 1.7 + tr.phase * 2) * 0.012;
        tr.pivot.rotation.y = Math.sin(t * 0.4 + tr.phase) * 0.25; // a slow turn shows the canopy is round
      }
      const lead = 1640 - ((t * 38) % SPAN); // flies right → left, off and back on
      for (const f of birds) {
        const x = lead + f.dx;
        const y = FLOCK_Y + f.dy + Math.sin(t * 0.8 + f.phase) * 6;
        f.b.group.position.set(x + ctx.pointer.x * 8, -y, 40);
        f.b.group.rotation.z = Math.sin(t * 0.8 + f.phase) * 0.1;
        f.b.flap(t, f.phase);
      }
    },
  };
}
