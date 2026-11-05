/**
 * Gallery backdrop (night sky, art 1440×980): stars with depth. Three layers of twinkling
 * stars (far, mid, near) slide at different rates with scrolling and the pointer, so the sky
 * reads as deep. Now and then a shooting star crosses the open sky on the right.
 * The SVG's own stars, moon and constellations stay as they are underneath.
 * Keeps clear of the heading (top left) and the moon.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, frameArt, rng, softDisc } from './kit';

const W = 1440;
const H = 980;
/** Areas without new stars: the heading block and the moon (art units). */
const KEEP_CLEAR = [
  { x0: 80, y0: 70, x1: 900, y1: 270 },
  { x0: 1130, y0: 90, x1: 1350, y1: 290 },
];
const COLORS = ['#fff1b8', '#cfe9ff', '#ffffff'];
const LAYERS = [
  { count: [140, 80], size: [1.6, 2.6], depth: 0.25, alpha: 0.55 },
  { count: [80, 45], size: [2.6, 3.8], depth: 0.6, alpha: 0.75 },
  { count: [36, 18], size: [3.8, 5.2], depth: 1, alpha: 0.9 },
];

export function createNightSkyBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const rand = rng(42);
  const layers: { points: THREE.Points; depth: number; mat: THREE.ShaderMaterial }[] = [];

  for (const L of LAYERS) {
    const n = tier === 'high' ? L.count[0] : L.count[1];
    const pos: number[] = [];
    const size: number[] = [];
    const phase: number[] = [];
    const color: number[] = [];
    while (pos.length / 3 < n) {
      const x = rand() * W;
      const y = rand() * (H - 200); // the ridge and pines fill the bottom
      if (KEEP_CLEAR.some((r) => x > r.x0 && x < r.x1 && y > r.y0 && y < r.y1)) continue;
      pos.push(x, -y, 0);
      size.push(L.size[0] + rand() * (L.size[1] - L.size[0]));
      phase.push(rand() * 6.283);
      const c = new THREE.Color(COLORS[Math.floor(rand() * COLORS.length)]);
      color.push(c.r, c.g, c.b);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.Float32BufferAttribute(size, 1));
    geo.setAttribute('aPhase', new THREE.Float32BufferAttribute(phase, 1));
    geo.setAttribute('aColor', new THREE.Float32BufferAttribute(color, 3));
    const mat = new THREE.ShaderMaterial({
      uniforms: { uTime: { value: 0 }, uPx: { value: 1 }, uAlpha: { value: L.alpha }, uTex: { value: softDisc() } },
      transparent: true,
      depthWrite: false,
      vertexShader: `
        uniform float uTime, uPx;
        attribute float aSize, aPhase;
        attribute vec3 aColor;
        varying vec3 vColor;
        varying float vTw;
        void main() {
          vColor = aColor;
          // Slow twinkle with an occasional brighter sparkle.
          float tw = 0.55 + 0.45 * sin(uTime * (0.8 + fract(aPhase) * 1.6) + aPhase * 7.0);
          vTw = tw * tw;
          gl_PointSize = aSize * uPx * (0.85 + 0.3 * tw);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }`,
      fragmentShader: `
        uniform float uAlpha;
        uniform sampler2D uTex;
        varying vec3 vColor;
        varying float vTw;
        void main() {
          float a = texture2D(uTex, gl_PointCoord).a;
          // A bright core inside the soft glow.
          float core = smoothstep(0.55, 1.0, a);
          gl_FragColor = vec4(vColor, (a * 0.45 + core * 0.8) * uAlpha * (0.35 + 0.65 * vTw));
          #include <colorspace_fragment>
        }`,
    });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    layers.push({ points, depth: L.depth, mat });
  }

  // ---------- Shooting star: a bright head with a fading tail, every 8–12 s ----------
  const tailGeo = new THREE.PlaneGeometry(1, 1);
  tailGeo.translate(-0.5, 0, 0); // origin at the head
  const tailMat = new THREE.ShaderMaterial({
    uniforms: { uFade: { value: 0 } },
    transparent: true,
    depthWrite: false,
    vertexShader: `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform float uFade;
      varying vec2 vUv;
      void main() {
        float along = vUv.x;                         // 1 at the head, 0 at the tail end
        float across = 1.0 - abs(vUv.y - 0.5) * 2.0;
        gl_FragColor = vec4(1.0, 0.97, 0.88, pow(along, 2.2) * across * uFade);
        #include <colorspace_fragment>
      }`,
  });
  const tail = new THREE.Mesh(tailGeo, tailMat);
  tail.scale.set(170, 3.2, 1);
  tail.visible = false;
  scene.add(tail);
  const shot = { start: 4, from: new THREE.Vector2(), dir: new THREE.Vector2(), next: 4 };
  const launch = (t: number) => {
    shot.start = t;
    shot.from.set(900 + rand() * 260, 170 + rand() * 230);
    // Up and to the right, like the art's two streaks (world y is up).
    const a = THREE.MathUtils.degToRad(17 + rand() * 12);
    shot.dir.set(Math.cos(a), Math.sin(a));
    shot.next = t + 8 + rand() * 4;
  };

  let px = 1;
  return {
    scene,
    camera,
    resize(ctx: LayerContext) {
      frameArt(camera, ctx);
      // Point sizes are in device pixels: art units × (device px per art unit).
      px = (ctx.width / ctx.art.width) * ctx.res;
      layers.forEach((l) => (l.mat.uniforms.uPx.value = px));
    },
    update(t, _dt, ctx) {
      for (const l of layers) {
        l.mat.uniforms.uTime.value = t;
        l.points.position.x = ctx.pointer.x * 16 * l.depth;
        l.points.position.y = ctx.scroll * 70 * l.depth - ctx.pointer.y * 8 * l.depth;
      }
      if (t >= shot.next) launch(t);
      const age = t - shot.start;
      const life = 1.1;
      tail.visible = age >= 0 && age < life;
      if (tail.visible) {
        const d = age * 620;
        tail.position.set(shot.from.x + shot.dir.x * d, -shot.from.y + shot.dir.y * d, 10);
        tail.rotation.z = Math.atan2(shot.dir.y, shot.dir.x);
        tailMat.uniforms.uFade.value = Math.sin((age / life) * Math.PI);
      }
    },
  };
}
