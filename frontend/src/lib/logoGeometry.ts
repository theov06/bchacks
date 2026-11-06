/**
 * The BCHacks monogram, traced from logo.jpg as straight 30° polygons (SVG user units,
 * viewBox 276 131 257 512). One source for the 2D logo and the 3D landmark.
 * Swap for the official SVG paths when available.
 */
export const LOGO_B = '282,280 340,245 340,528 405,566 464,531 405,497 405,428 527,497 527,565 405,637 282,565';
export const LOGO_C = '405,207 527,137 527,210 464,247 464,314 527,350 527,420 405,350';
export const LOGO_VIEWBOX = { x: 276, y: 131, width: 257, height: 512 } as const;

/** Polygon points as [x, y] pairs. */
export const toPoints = (s: string): [number, number][] =>
  s.split(' ').map((p) => p.split(',').map(Number) as [number, number]);
