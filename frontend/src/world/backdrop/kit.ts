/**
 * Shared pieces for the section backdrops (v3.1 spec 0.8.6): an orthographic camera in the
 * art's own coordinates, toon shading in the art's colours with ink outlines (the sticker
 * look), and a few reusable objects (bubbles, birds, stars).
 *
 * World units = the scene SVG's viewBox units, with y flipped (art y down → world y up).
 * Depth (z) only orders objects and drives parallax; the ortho camera never shrinks them.
 */
import * as THREE from 'three';
import type { LayerContext } from './engine';

export const INK = new THREE.Color('#0e1446');
export const CREAM = new THREE.Color('#ffe3c2');
const DUSK = new THREE.Color('#2a2470');
export const LIGHT = new THREE.Vector3(0.45, 0.75, 0.5).normalize();

/** art (x, y-down) → world position. */
export const at = (obj: THREE.Object3D, x: number, y: number, z = 0) => obj.position.set(x, -y, z);

/** Ortho camera that shows exactly the art region the layer covers. */
export function artCamera(): THREE.OrthographicCamera {
  const cam = new THREE.OrthographicCamera(0, 1, 0, -1, -4000, 4000);
  cam.position.z = 2000;
  return cam;
}
export function frameArt(cam: THREE.OrthographicCamera, { art }: LayerContext) {
  cam.left = art.left;
  cam.right = art.left + art.width;
  cam.top = -art.top;
  cam.bottom = -(art.top + art.height);
  cam.updateProjectionMatrix();
}

/**
 * Three-band toon shading: lit cap tinted toward cream, body = the art's fill, shadow pulled
 * toward dusk ink. Optional `emissive` lifts it (for glowing things).
 */
export function toon(fill: string, opts: { high?: number; shade?: number; opacity?: number } = {}): THREE.ShaderMaterial {
  const base = new THREE.Color(fill);
  const transparent = (opts.opacity ?? 1) < 1;
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: base },
      uHigh: { value: base.clone().lerp(CREAM, opts.high ?? 0.45) },
      uShade: { value: base.clone().lerp(DUSK, opts.shade ?? 0.28) },
      uLight: { value: LIGHT },
      uOpacity: { value: opts.opacity ?? 1 },
    },
    transparent,
    depthWrite: !transparent,
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uBase, uHigh, uShade, uLight;
      uniform float uOpacity;
      varying vec3 vNormal;
      void main() {
        float d = dot(normalize(vNormal), uLight);
        vec3 c = d > 0.72 ? uHigh : (d > -0.1 ? uBase : uShade);
        gl_FragColor = vec4(c, uOpacity);
        #include <colorspace_fragment>
      }`,
  });
}

/** Ink outline (inverted hull): the art's 2.5–3px navy strokes, in art units. */
const outlineMats = new Map<number, THREE.ShaderMaterial>();
export function outlineMaterial(thickness = 2.5): THREE.ShaderMaterial {
  let m = outlineMats.get(thickness);
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: { uInk: { value: INK }, uThick: { value: thickness } },
      side: THREE.BackSide,
      vertexShader: `
        uniform float uThick;
        void main() {
          // Grow along the normal by a fixed number of art units, whatever the object's scale.
          vec4 world = modelMatrix * vec4(position, 1.0);
          vec3 n = normalize(mat3(modelMatrix) * normal);
          world.xyz += n * uThick;
          gl_Position = projectionMatrix * viewMatrix * world;
        }`,
      fragmentShader: `
        uniform vec3 uInk;
        void main() {
          gl_FragColor = vec4(uInk, 1.0);
          #include <colorspace_fragment>
        }`,
    });
    outlineMats.set(thickness, m);
  }
  return m;
}

/** A toon mesh with its ink outline (outline drawn behind it). */
export function inked(geo: THREE.BufferGeometry, fill: string, thickness = 2.5, opts?: Parameters<typeof toon>[1]): THREE.Group {
  const g = new THREE.Group();
  const outline = new THREE.Mesh(geo, outlineMaterial(thickness));
  outline.renderOrder = -1;
  g.add(outline, new THREE.Mesh(geo, toon(fill, opts)));
  return g;
}

/** Flat colour, no lighting (silhouettes, sails, strokes). */
export const flat = (color: string | THREE.Color, opts: THREE.MeshBasicMaterialParameters = {}) =>
  new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide, ...opts });

/** Radial soft-edged disc texture (shadows, glows). Shared. */
let disc: THREE.CanvasTexture | null = null;
export function softDisc(): THREE.CanvasTexture {
  if (disc) return disc;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  // Fade the colour as well as the alpha: alphaMap reads the green channel, map reads alpha.
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  disc = new THREE.CanvasTexture(c);
  return disc;
}

/** Deterministic pseudo-random (stable layouts across reloads). */
export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------------------------------------------------------------------------------------
// Bubbles: glassy rings that rise, wobble and respawn (instanced, one draw call).
// ---------------------------------------------------------------------------------------
export interface BubbleField {
  mesh: THREE.InstancedMesh;
  update(t: number, dt: number): void;
}
export function bubbles(opts: {
  count: number;
  /** Spawn area (art units): x range and the y they start from. */
  x: [number, number];
  y: [number, number];
  /** They fade out and respawn when they rise above this y. */
  top: number;
  size: [number, number];
  color: string;
  opacity: number;
  speed?: number;
  seed?: number;
  /** Optional emitter: every bubble starts here instead (e.g. a diving helmet). */
  from?: () => [number, number];
}): BubbleField {
  const rand = rng(opts.seed ?? 7);
  const geo = new THREE.RingGeometry(0.78, 1, 20);
  const mat = new THREE.MeshBasicMaterial({ color: opts.color, transparent: true, opacity: opts.opacity, depthWrite: false });
  const mesh = new THREE.InstancedMesh(geo, mat, opts.count);
  const state = Array.from({ length: opts.count }, () => ({ x: 0, y: 0, r: 0, v: 0, ph: 0 }));
  const spawn = (b: (typeof state)[number], anywhere: boolean) => {
    const [fx, fy] = opts.from ? opts.from() : [opts.x[0] + rand() * (opts.x[1] - opts.x[0]), opts.y[0] + rand() * (opts.y[1] - opts.y[0])];
    b.x = fx;
    b.y = anywhere && !opts.from ? opts.top + rand() * (fy - opts.top) : fy;
    b.r = opts.size[0] + rand() * (opts.size[1] - opts.size[0]);
    b.v = (opts.speed ?? 22) * (0.6 + rand() * 0.8) * (0.6 + b.r / opts.size[1] * 0.6);
    b.ph = rand() * 6.28;
  };
  state.forEach((b) => spawn(b, true));
  if (opts.from) state.forEach((b, i) => (b.y -= (i / opts.count) * 260)); // stagger an emitter's stream
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const p = new THREE.Vector3();
  return {
    mesh,
    update(t, dt) {
      state.forEach((b, i) => {
        b.y -= b.v * dt;
        if (b.y < opts.top) spawn(b, false);
        const wob = Math.sin(t * 2 + b.ph) * (2 + b.r * 0.4);
        p.set(b.x + wob, -b.y, 5);
        const squash = 1 + Math.sin(t * 3.1 + b.ph) * 0.08;
        // Shrink away over the last stretch instead of popping out of existence.
        const fade = Math.min(1, Math.max(0.001, (b.y - opts.top) / 60));
        s.set(b.r * squash * fade, (b.r / squash) * fade, 1);
        m.compose(p, q, s);
        mesh.setMatrixAt(i, m);
      });
      mesh.instanceMatrix.needsUpdate = true;
    },
  };
}

// ---------------------------------------------------------------------------------------
// Birds: flat ink silhouettes with hinged, flapping wings (like the art's "~" birds).
// ---------------------------------------------------------------------------------------
let wingGeo: THREE.BufferGeometry | null = null;
export function bird(span: number, color = '#2a2470') {
  if (!wingGeo) {
    wingGeo = new THREE.BufferGeometry();
    wingGeo.setAttribute(
      'position',
      new THREE.Float32BufferAttribute([0, 0.12, 0, 0, -0.12, 0, 0.5, 0.42, 0, 0, -0.12, 0, 0.5, 0.2, 0, 0.5, 0.42, 0, 0.5, 0.2, 0, 1.05, 0.02, 0, 0.5, 0.42, 0], 3),
    );
  }
  const mat = flat(color);
  const pivot = new THREE.Group();
  const half = span * 0.6;
  const left = new THREE.Mesh(wingGeo, mat);
  left.scale.set(-half, half, half);
  const right = new THREE.Mesh(wingGeo, mat);
  right.scale.set(half, half, half);
  pivot.add(left, right);
  return {
    group: pivot,
    flap(t: number, phase: number) {
      const glide = Math.sin(t * 0.5 + phase) > 0.6 ? 0.25 : 1;
      const f = Math.sin(t * 7 + phase * 3) * 0.55 * glide;
      left.rotation.z = f;
      right.rotation.z = -f;
    },
  };
}
