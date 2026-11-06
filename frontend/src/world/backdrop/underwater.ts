/**
 * FAQ backdrop (underwater, art 1440×1300): two schools of kokanee swimming in 3D with
 * boids-style flocking (they keep together, line up and give each other room), turning
 * round in 3D when they change direction; bubbles rising and wobbling; and the deep-shadow:
 * a soft, faceless, abstract dark volume gliding very slowly far behind everything.
 * Fish use the art's look: pale blue-grey body, the kokanee's red side stripe, ink outline.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, bubbles, frameArt, inked, rng, softDisc } from './kit';

/**
 * Each school roams a box (art units) around where the art drew it. `drawn` are the art's own
 * fish (x, y, scale): the first fish of each school start exactly on them, so the 3D takes over
 * from the picture without a jump; any extra fish start scattered around `start`.
 */
const SCHOOLS = [
  {
    box: [860, 150, 1400, 420],
    start: [1100, 270],
    count: [6, 4],
    scale: 0.85,
    drawn: [[1080, 260, 1], [1140, 300, 0.8], [1030, 320, 0.85], [1170, 220, 0.7]],
  },
  { box: [120, 790, 640, 990], start: [330, 880], count: [5, 3], scale: 0.8, drawn: [[330, 860, 0.9], [390, 900, 0.75], [280, 910, 0.7]] },
] as const;

function makeFish() {
  const g = new THREE.Group();
  const body = inked(new THREE.SphereGeometry(1, 18, 12), '#b9d3ea', 2.2, { high: 0.5 });
  body.scale.set(30, 11, 9);
  // The kokanee's red side stripe: a slimmer ellipsoid that shows through on both flanks.
  const stripe = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 8), new THREE.MeshBasicMaterial({ color: '#ff8a9a' }));
  stripe.scale.set(25, 2.6, 9.4);
  stripe.position.y = -1.5;
  // Tail: a thin fin hinged at the back of the body.
  const tail = new THREE.Group();
  tail.position.x = -27;
  const fin = new THREE.Shape([new THREE.Vector2(0, 0), new THREE.Vector2(-18, 12), new THREE.Vector2(-14, 0), new THREE.Vector2(-18, -12)]);
  const finGeo = new THREE.ExtrudeGeometry(fin, { depth: 1.5, bevelEnabled: false });
  finGeo.translate(0, 0, -0.75);
  tail.add(inked(finGeo, '#9bbbd8', 2));
  const eye = new THREE.Mesh(new THREE.SphereGeometry(2.2, 8, 6), new THREE.MeshBasicMaterial({ color: '#0e1446' }));
  eye.position.set(18, 3, 7.5);
  const eye2 = eye.clone();
  eye2.position.z = -7.5;
  g.add(body, stripe, tail, eye, eye2);
  return { g, tail };
}

interface Fish {
  f: ReturnType<typeof makeFish>;
  p: THREE.Vector2;
  v: THREE.Vector2;
  yaw: number;
  /** The yaw it's turning toward: 0 = facing right, π = facing left. */
  target: number;
  phase: number;
  school: number;
}

export function createUnderwaterBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const rand = rng(11);

  // ---------- The deep-shadow: two overlapping soft dark blobs, very faint, far back ----------
  const deep = new THREE.Group();
  const deepMat = new THREE.MeshBasicMaterial({ color: '#030b2c', alphaMap: softDisc(), transparent: true, opacity: 0.32, depthWrite: false });
  const blobGeo = new THREE.PlaneGeometry(1, 1);
  const blobs = [
    { w: 760, h: 110, x: 0, y: 0 },
    { w: 520, h: 90, x: 300, y: 14 },
    { w: 380, h: 70, x: -320, y: -6 },
  ].map((b) => {
    const m = new THREE.Mesh(blobGeo, deepMat);
    m.scale.set(b.w, b.h, 1);
    m.position.set(b.x, b.y, 0);
    deep.add(m);
    return { m, ...b };
  });
  deep.position.set(720, -1015, -800);
  scene.add(deep);

  // ---------- Kokanee schools ----------
  const fish: Fish[] = [];
  SCHOOLS.forEach((s, si) => {
    const n = tier === 'high' ? s.count[0] : s.count[1];
    for (let i = 0; i < n; i++) {
      const f = makeFish();
      const art = s.drawn[i] as readonly [number, number, number] | undefined;
      const jitter = [rand(), rand(), rand()]; // drawn always, so the extras stay the same
      f.g.scale.setScalar(art ? art[2] : s.scale * (0.85 + jitter[0] * 0.3));
      scene.add(f.g);
      const dir = si === 0 ? 1 : -1;
      fish.push({
        f,
        p: art ? new THREE.Vector2(art[0], art[1]) : new THREE.Vector2(s.start[0] + (jitter[1] - 0.5) * 140, s.start[1] + (jitter[2] - 0.5) * 80),
        v: new THREE.Vector2(dir * (18 + rand() * 10), (rand() - 0.5) * 6),
        yaw: dir > 0 ? 0 : Math.PI,
        target: dir > 0 ? 0 : Math.PI,
        phase: rand() * 6.28,
        school: si,
      });
    }
  });

  // ---------- Bubbles ----------
  const field = bubbles({
    count: tier === 'high' ? 30 : 16,
    x: [60, 1380],
    y: [1150, 1290],
    top: 60,
    size: [3, 7.5],
    color: '#b5ecff',
    opacity: 0.55,
    speed: 26,
  });
  scene.add(field.mesh);

  const acc = new THREE.Vector2();
  const tmp = new THREE.Vector2();
  const MAX = 42;
  const MIN = 16;

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(t, dt, ctx) {
      // Deep-shadow: a 70 s glide one way and back, breathing slowly. Never sharp, never a face.
      const glide = Math.sin((t / 70) * Math.PI * 2);
      deep.position.x = 720 + glide * 160 + ctx.pointer.x * 6;
      blobs.forEach((b, i) => {
        b.m.scale.set(b.w * (1 + Math.sin(t * 0.15 + i) * 0.06), b.h * (1 + Math.sin(t * 0.21 + i * 2) * 0.1), 1);
      });

      // Boids, per school.
      for (const a of fish) {
        const s = SCHOOLS[a.school];
        acc.set(0, 0);
        const centre = new THREE.Vector2();
        const align = new THREE.Vector2();
        let n = 0;
        for (const b of fish) {
          if (b === a || b.school !== a.school) continue;
          const d = a.p.distanceTo(b.p);
          if (d < 160) {
            centre.add(b.p);
            align.add(b.v);
            n++;
          }
          if (d < 46 && d > 0) acc.add(tmp.copy(a.p).sub(b.p).multiplyScalar((46 - d) / d * 1.6)); // separation
        }
        if (n) {
          acc.add(centre.divideScalar(n).sub(a.p).multiplyScalar(0.35)); // cohesion
          acc.add(align.divideScalar(n).sub(a.v).multiplyScalar(0.5)); // alignment
        }
        // A slow wander so the school drifts and turns on its own.
        acc.x += Math.sin(t * 0.13 + a.school * 2) * 6;
        acc.y += Math.sin(t * 0.21 + a.school) * 2;
        // Stay inside the school's box (soft walls).
        const [x0, y0, x1, y1] = s.box;
        const m = 60;
        const my = 25; // the boxes are short; a thin top/bottom margin keeps them from bobbing
        if (a.p.x < x0 + m) acc.x += (x0 + m - a.p.x) * 0.8;
        if (a.p.x > x1 - m) acc.x -= (a.p.x - (x1 - m)) * 0.8;
        if (a.p.y < y0 + my) acc.y += (y0 + my - a.p.y) * 0.5;
        if (a.p.y > y1 - my) acc.y -= (a.p.y - (y1 - my)) * 0.5;

        a.v.addScaledVector(acc, dt);
        const sp = a.v.length();
        if (sp > MAX) a.v.multiplyScalar(MAX / sp);
        if (sp < MIN) a.v.multiplyScalar(MIN / Math.max(sp, 0.001));
        // Kokanee swim mostly level: climbing or diving is capped at a gentle slope.
        const maxClimb = Math.max(Math.abs(a.v.x), MIN) * 0.3;
        a.v.y = THREE.MathUtils.clamp(a.v.y, -maxClimb, maxClimb);
        // Face the way the school wants to go: turn round only when it clearly heads the other
        // way (a little hysteresis, so a fish doesn't flip back and forth when it slows down).
        if (a.v.x > 4) a.target = 0;
        else if (a.v.x < -4) a.target = Math.PI;
        a.yaw += (a.target - a.yaw) * Math.min(1, dt * 3);
        // Swim along the way it faces, never backwards: while it turns (cos(yaw) passing 0) it
        // slows to a hover and swings round, then swims forward again.
        a.p.x += Math.abs(a.v.x) * Math.cos(a.yaw) * dt;
        a.p.y += a.v.y * dt;
        const pitch = THREE.MathUtils.clamp(Math.atan2(a.v.y, Math.abs(a.v.x)) * -0.6, -0.2, 0.2); // ≤ ~11° tilt
        a.f.g.position.set(a.p.x, -a.p.y, 40 + a.school * 10);
        a.f.g.rotation.set(0, a.yaw, Math.cos(a.yaw) >= 0 ? pitch : -pitch);
        a.f.tail.rotation.y = Math.sin(t * 6 + a.phase) * 0.45;
      }

      field.update(t, dt);
    },
  };
}
