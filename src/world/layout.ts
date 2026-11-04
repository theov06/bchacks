/**
 * Tiny Okanagan: where everything sits on the island (docs/ART_DIRECTION.md §3).
 * Units: 1 ≈ 3 quail heights. +x right, +z toward the hero camera, ground top at y = 0.
 * Shared by the blockout and the final scene, so layout changes happen in one place.
 */

export type Vec2 = [number, number];
export type Vec3 = [number, number, number];

/** Island outline (x, z), smoothed into a closed curve at build time. Bean-shaped, with a shallow dip at the back. */
export const ISLAND_OUTLINE: Vec2[] = [
  [-6.9, 0.6],
  [-6.6, -2.1],
  [-5.1, -3.8],
  [-2.6, -4.4],
  [-0.2, -3.9],
  [2.4, -4.6],
  [5.2, -4.0],
  [6.9, -1.9],
  [7.1, 0.9],
  [6.1, 3.2],
  [3.6, 4.3],
  [0, 4.6],
  [-3.6, 4.4],
  [-6.0, 3.2],
];
export const SLAB_THICKNESS = 1.4;
/** Gap between the slab's underside and the blueprint grid. */
export const FLOAT_HEIGHT = 0.8;

/** Hills as half-ellipsoids: centre (x, z) and radii (rx, height, rz). */
export interface Hill {
  at: Vec2;
  r: Vec3;
}
export const HILLS: Hill[] = [
  // Back ridge: low, wide and overlapping, so it reads as one wall of mountains.
  { at: [-4.8, -2.8], r: [2.6, 1.6, 1.5] },
  { at: [-2.2, -3.3], r: [2.6, 2.1, 1.3] },
  { at: [0.6, -3.4], r: [2.2, 1.3, 1.2] },
  { at: [3.4, -3.4], r: [2.8, 2.6, 1.5] },
  { at: [5.8, -2.0], r: [1.8, 1.8, 1.6] },
  // Side hills
  { at: [6.1, 1.0], r: [1.2, 0.9, 1.5] },
  { at: [-6.0, 1.0], r: [1.1, 0.55, 1.5] },
  // Knoll under the landmark, in front of the back ridge.
  { at: [1.6, -2.3], r: [1.4, 0.7, 1.0] },
];

/** Terrain height at (x, z): the highest hill surface there, else 0. */
export function groundHeight(x: number, z: number): number {
  let h = 0;
  for (const { at, r } of HILLS) {
    const dx = (x - at[0]) / r[0];
    const dz = (z - at[1]) / r[2];
    const d = dx * dx + dz * dz;
    if (d < 1) h = Math.max(h, r[1] * Math.sqrt(1 - d));
  }
  return h;
}

/** Okanagan Lake outline (x, z). */
export const LAKE_OUTLINE: Vec2[] = [
  [-4.6, 0.7],
  [-4.0, -0.8],
  [-2.0, -1.5],
  [0.6, -1.4],
  [2.6, -0.6],
  [2.7, 0.9],
  [1.4, 2.0],
  [-0.8, 2.3],
  [-3.2, 2.1],
];
export const LAKE_CENTRE: Vec2 = [-0.8, 0.4];

/** Points of interest. y is filled from groundHeight where it matters. */
export const SPOTS = {
  landmark: [1.6, -2.3] as Vec2,
  tent: [4.1, 1.1] as Vec2,
  screen: [4.5, 0.0] as Vec2,
  bridgeWest: [-3.9, -0.5] as Vec2,
  bridgeEast: [2.0, -0.2] as Vec2,
  dock: [-2.7, 2.2] as Vec2,
  houseboat: [-3.2, 0.9] as Vec2,
  market: [-1.2, 3.4] as Vec2,
  campfire: [-4.7, 2.7] as Vec2,
  quail: [0.9, 3.0] as Vec2,
  orchard: [5.4, -1.3] as Vec2,
  vineyardWest: [-5.4, 0.2] as Vec2,
  vineyardSouth: [3.3, 3.2] as Vec2,
};

/** Areas trees must avoid (centre x, z, radius). */
export const CLEARINGS: [number, number, number][] = [
  [LAKE_CENTRE[0], LAKE_CENTRE[1], 4.0],
  [SPOTS.tent[0], SPOTS.tent[1], 1.6],
  [SPOTS.screen[0], SPOTS.screen[1], 1.0],
  [SPOTS.market[0], SPOTS.market[1], 1.6],
  [SPOTS.campfire[0], SPOTS.campfire[1], 1.1],
  [SPOTS.quail[0], SPOTS.quail[1], 1.0],
  [SPOTS.landmark[0], SPOTS.landmark[1], 1.2],
  [SPOTS.orchard[0], SPOTS.orchard[1], 1.3],
  [SPOTS.vineyardWest[0], SPOTS.vineyardWest[1], 1.4],
  [SPOTS.vineyardSouth[0], SPOTS.vineyardSouth[1], 1.6],
];

/** Scroll stops (spec 6A): which zone each section's camera visits. Poses are set in step 6. */
export const STOP_LABELS: { section: string; spot: Vec2; label: string }[] = [
  { section: 'Hero', spot: SPOTS.landmark, label: 'Logo landmark' },
  { section: 'About', spot: SPOTS.vineyardWest, label: 'Vineyard' },
  { section: 'Stats', spot: SPOTS.tent, label: 'Hack tent + screen' },
  { section: 'Tracks', spot: [-0.6, 1.3], label: 'Lake (track buoys)' },
  { section: 'Schedule', spot: [-1.0, -0.4], label: 'Bennett Bridge' },
  { section: 'Sponsors', spot: SPOTS.market, label: 'Night market + dock' },
  { section: 'Get involved', spot: SPOTS.campfire, label: 'Campfire' },
  { section: 'Mascot', spot: SPOTS.quail, label: 'Quail home spot' },
];

/** Small deterministic random generator, so layouts don't change between renders. */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Point-in-polygon on (x, z). */
export function inside(poly: Vec2[], x: number, z: number): boolean {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) hit = !hit;
  }
  return hit;
}

/** Pine positions: on the back ridge and side hills, clear of the zones above, inside the island with a margin. */
export function pinePositions(count = 40, seed = 7): Vec3[] {
  const rand = rng(seed);
  const shrunk = ISLAND_OUTLINE.map(([x, z]) => [x * 0.9, z * 0.9] as Vec2);
  const out: Vec3[] = [];
  let guard = 0;
  while (out.length < count && guard++ < 4000) {
    const x = -6.6 + rand() * 13.2;
    const z = -4.2 + rand() * 7.2;
    if (!inside(shrunk, x, z)) continue;
    if (CLEARINGS.some(([cx, cz, r]) => (x - cx) ** 2 + (z - cz) ** 2 < r * r)) continue;
    // Favour hills: flat ground keeps only a few trees.
    const h = groundHeight(x, z);
    if (h < 0.15 && rand() > 0.18) continue;
    if (out.some(([ox, , oz]) => (x - ox) ** 2 + (z - oz) ** 2 < 0.3)) continue;
    out.push([x, h, z]);
  }
  return out;
}
