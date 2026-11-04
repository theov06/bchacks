/**
 * Hero backdrop in 3D (v3.1 spec 0.8.6, first section): puffy toon clouds drifting at
 * different depths, and two small flocks of flapping birds whose faint shadows slide over
 * the hills. Works in the hero art's own coordinates (viewBox 1920×1080, y down), so
 * everything starts exactly where the SVG drew it and the swap is invisible.
 *
 * Stays out of the copy: clouds live in the sky right of x≈1000 and above the hills; they
 * grow in at the left edge of that zone and drift right, off the art.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';

const ART_W = 1920;
const ART_H = 1080;
const FOV = 30;

/** Clouds from hero.svg #d-clouds: puffs (cx, cy, r) + flat base (x, y, w, h) + colour. */
interface CloudDef {
  puffs: [number, number, number][];
  base: [number, number, number, number];
  color: string;
  /** Depth: 0 = the art's plane; negative = farther (smaller parallax, slower). */
  z: number;
  speed: number; // art units per second
  tier?: 'high';
}
const CLOUDS: CloudDef[] = [
  {
    puffs: [[1170, 370, 38], [1208, 346, 50], [1254, 339, 60], [1300, 356, 43], [1331, 374, 29]],
    base: [1156, 360, 189, 34],
    color: '#f2a6c2',
    z: 0,
    speed: 9,
  },
  {
    puffs: [[1508, 258, 29], [1537, 240, 37], [1570, 234, 44], [1604, 247, 32], [1628, 260, 22]],
    base: [1498, 250, 140, 25],
    color: '#e99bc4',
    z: -140,
    speed: 6,
  },
  {
    puffs: [[976, 527, 24], [1000, 511, 32], [1029, 507, 37], [1057, 518, 27], [1077, 529, 18]],
    base: [967, 520, 119, 21],
    color: '#f7b3a6',
    z: -70,
    speed: 7,
  },
  // Extra far, small clouds on the high tier (the art's palette, scaled-down puffs).
  {
    puffs: [[1380, 150, 16], [1398, 140, 21], [1418, 138, 24], [1438, 146, 17]],
    base: [1372, 146, 76, 14],
    color: '#e99bc4',
    z: -260,
    speed: 4,
    tier: 'high',
  },
  {
    puffs: [[1790, 400, 18], [1810, 389, 24], [1834, 387, 27], [1856, 396, 19]],
    base: [1781, 394, 88, 15],
    color: '#f2a6c2',
    z: -200,
    speed: 5,
    tier: 'high',
  },
];

/** Clouds drift right inside this band of the art and wrap; they grow in at its left edge. */
const ZONE_LEFT = 1010;
const ZONE_RIGHT = 2080;
const GROW = 70; // art units over which a cloud puffs up after wrapping

/** Birds from hero.svg #d-details: two little flocks (home x, y, span). */
const FLOCKS: { home: [number, number]; birds: [number, number, number][] }[] = [
  { home: [1128, 268], birds: [[1120, 250, 24], [1160, 270, 19], [1095, 285, 17], [1182, 246, 15]] },
  { home: [1718, 462], birds: [[1700, 470, 19], [1735, 455, 16], [1752, 474, 13]] },
];
const BIRD_COLOR = '#2a2470';

/** y-down art coordinates → world (y up). */
const wx = (x: number) => x;
const wy = (y: number) => -y;

/**
 * Toon shading in the art's own colours: the cloud's fill for the body, the art's cream
 * (#ffe3c2, its highlight strokes) for the sunlit caps, and the fill pulled a little toward
 * dusk violet for the undersides. Three hard bands, light from the sun (upper right).
 */
const CREAM = new THREE.Color('#ffe3c2');
const DUSK = new THREE.Color('#7a5aa8');
const LIGHT = new THREE.Vector3(0.5, 0.75, 0.45).normalize();

function cloudMaterial(fill: string): THREE.ShaderMaterial {
  const base = new THREE.Color(fill);
  return new THREE.ShaderMaterial({
    uniforms: {
      uBase: { value: base },
      uHigh: { value: base.clone().lerp(CREAM, 0.75) },
      uShade: { value: base.clone().lerp(DUSK, 0.22) },
      uLight: { value: LIGHT },
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: `
      uniform vec3 uBase, uHigh, uShade, uLight;
      varying vec3 vNormal;
      void main() {
        float d = dot(normalize(vNormal), uLight);
        vec3 c = d > 0.8 ? uHigh : (d > -0.15 ? uBase : uShade);
        gl_FragColor = vec4(c, 1.0);
        #include <colorspace_fragment>
      }`,
  });
}

function softDisc(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

interface Cloud {
  group: THREE.Group;
  /** Home x of the cloud's left edge (art units), current offset, width. */
  left: number;
  width: number;
  offset: number;
  def: CloudDef;
}

interface Bird {
  pivot: THREE.Group;
  left: THREE.Mesh;
  right: THREE.Mesh;
  home: THREE.Vector2;
  phase: number;
  span: number;
  shadow: THREE.Mesh;
}

export function createHeroBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, 16 / 9, 10, 8000);

  const sphere = new THREE.IcosahedronGeometry(1, 3);
  const disc = softDisc();

  // ---------- Clouds ----------
  const clouds: Cloud[] = CLOUDS.filter((d) => !d.tier || tier === 'high').map((def) => {
    const group = new THREE.Group();
    const mat = cloudMaterial(def.color);
    const [bx, by, bw, bh] = def.base;
    for (const [cx, cy, r] of def.puffs) {
      const puff = new THREE.Mesh(sphere, mat);
      puff.position.set(wx(cx) - bx, wy(cy) + by, r * 0.35);
      puff.scale.set(r, r * 0.94, r * 0.8);
      group.add(puff);
    }
    // Flat bottom: a capsule along the base, like the art's rounded rect.
    const base = new THREE.Mesh(new THREE.CapsuleGeometry(bh / 2, bw - bh, 6, 16), mat);
    base.rotation.z = Math.PI / 2;
    base.scale.z = 0.8;
    base.position.set(bw / 2, -bh / 2, bh * 0.2);
    group.add(base);
    // The faint shadow line under each cloud (the art's 10% rect), soft-edged.
    const shadow = new THREE.Mesh(
      new THREE.PlaneGeometry(bw * 0.95, bh * 0.5),
      new THREE.MeshBasicMaterial({ color: '#000000', alphaMap: disc, transparent: true, opacity: 0.12, depthWrite: false }),
    );
    shadow.position.set(bw / 2, -bh - 6, -bh);
    group.add(shadow);

    group.position.set(wx(bx), wy(by), def.z);
    scene.add(group);
    return { group, left: bx, width: bw, offset: 0, def };
  });

  // ---------- Birds (flat silhouettes in the art's ink, hinged wings) ----------
  const wingGeo = new THREE.BufferGeometry();
  // One wing, like the art's "~" birds: from the body (0,0) up to the elbow and out to the tip.
  wingGeo.setAttribute(
    'position',
    new THREE.Float32BufferAttribute([0, 0.12, 0, 0, -0.12, 0, 0.5, 0.42, 0, 0, -0.12, 0, 0.5, 0.2, 0, 0.5, 0.42, 0, 0.5, 0.2, 0, 1.05, 0.02, 0, 0.5, 0.42, 0], 3),
  );
  const birdMat = new THREE.MeshBasicMaterial({ color: BIRD_COLOR, side: THREE.DoubleSide });
  const shadowMat = new THREE.MeshBasicMaterial({ color: '#0e1446', alphaMap: disc, transparent: true, opacity: 0.22, depthWrite: false });
  const shadowGeo = new THREE.PlaneGeometry(1, 1);

  const birds: Bird[] = [];
  FLOCKS.forEach((flock, f) =>
    flock.birds.forEach(([x, y, span], i) => {
      if (tier === 'medium' && i > 2) return;
      const pivot = new THREE.Group();
      const half = span * 0.6;
      const left = new THREE.Mesh(wingGeo, birdMat);
      left.scale.set(-half, half, half);
      const right = new THREE.Mesh(wingGeo, birdMat);
      right.scale.set(half, half, half);
      pivot.add(left, right);
      pivot.position.set(wx(x + half), wy(y), 40 - f * 60);
      scene.add(pivot);
      const shadow = new THREE.Mesh(shadowGeo, shadowMat);
      shadow.scale.set(span * 0.9, span * 0.28, 1);
      scene.add(shadow);
      birds.push({ pivot, left, right, home: new THREE.Vector2(x + half, y), phase: f * 1.7 + i * 0.9, span, shadow });
    }),
  );

  // Camera framing (set in resize). An object at depth z is pushed out from the view centre and
  // scaled by (dist - z) / dist, so it still lands where the art drew it: depth then shows only
  // as parallax and shading, never as a shifted or shrunken cloud.
  const view = { cx: ART_W / 2, cy: ART_H / 2, dist: 1 };
  const depthK = (z: number) => (view.dist - z) / view.dist;
  const place = (obj: THREE.Object3D, artX: number, artY: number, z: number, scale = 1) => {
    const k = depthK(z);
    obj.position.set(wx(view.cx + (artX - view.cx) * k), wy(view.cy + (artY - view.cy) * k), z);
    obj.scale.setScalar(scale * k);
  };

  /** Frames the art box the way the SVG does (xMidYMax slice): same crop, same scale. */
  const resize = ({ width, height }: LayerContext) => {
    const scale = Math.max(width / ART_W, height / ART_H);
    const visW = width / scale;
    const visH = height / scale;
    const cx = ART_W / 2;
    const cy = ART_H - visH / 2;
    const dist = visH / 2 / Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    Object.assign(view, { cx, cy, dist });
    camera.aspect = visW / visH;
    camera.position.set(wx(cx), wy(cy), dist);
    camera.lookAt(wx(cx), wy(cy), 0);
    camera.updateProjectionMatrix();
  };

  const update = (t: number, dt: number, ctx: LayerContext) => {
    // Parallax: nearer things (higher z) move more with the pointer and with scrolling.
    const px = ctx.pointer.x;
    const py = ctx.pointer.y;
    const scrollLift = Math.min(1.5, Math.max(0, ctx.scroll)) * 60;

    for (const c of clouds) {
      c.offset += c.def.speed * dt;
      const span = ZONE_RIGHT - ZONE_LEFT + c.width;
      // Wrap: when a cloud has drifted off the right edge it comes back at the zone's left.
      let x = c.left + c.offset;
      if (x > ZONE_RIGHT) {
        c.offset -= span;
        x = c.left + c.offset;
      }
      // Clouds that wrapped re-enter at ZONE_LEFT; until they're fully inside, they puff up.
      const enter = x < ZONE_LEFT ? 0 : Math.min(1, (x - ZONE_LEFT) / GROW);
      const grow = c.offset < 0 ? THREE.MathUtils.smoothstep(enter, 0, 1) : 1;
      const depth = 1 + c.def.z / 400; // 1 near … 0.35 far
      c.group.visible = grow > 0.01;
      const bob = Math.sin(t * 0.35 + c.left) * 3;
      place(c.group, Math.max(x, ZONE_LEFT) + px * 14 * depth, c.def.base[1] + bob + py * 8 * depth - scrollLift * depth, c.def.z, Math.max(0.01, grow));
    }

    for (const b of birds) {
      // A slow lazy loop around home, wings flapping, an occasional glide.
      const s = t * 0.22 + b.phase;
      const x = b.home.x + Math.sin(s) * 34 + Math.sin(s * 0.37) * 18;
      const y = b.home.y + Math.sin(s * 1.3) * 10;
      place(b.pivot, x + px * 10, y + py * 6 - scrollLift, b.pivot.position.z);
      b.pivot.rotation.z = Math.cos(s) * 0.12; // bank into the turn
      const glide = Math.sin(t * 0.5 + b.phase) > 0.6 ? 0.25 : 1;
      const flap = Math.sin(t * 7 + b.phase * 3) * 0.55 * glide;
      b.left.rotation.z = flap;
      b.right.rotation.z = -flap;
      // Shadow on the hills: down and to the left of the bird (the sun is to the right).
      b.shadow.position.set(wx(x - 70), wy(840 + (y - b.home.y) * 0.4), 0);
      b.shadow.scale.set(b.span * (0.7 + 0.25 * Math.abs(Math.cos(t * 7 + b.phase * 3))), b.span * 0.28, 1);
    }
  };

  return { scene, camera, resize, update };
}
