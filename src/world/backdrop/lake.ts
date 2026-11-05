/**
 * Get involved backdrop (out on the lake, art 1440×1000): the two sailboats, the paddleboarder
 * and the buoys in 3D, bobbing and rolling on the waves, each with a wobbling reflection and a
 * little wake. Built from the art's shapes and colours (coral / violet hulls, cream and sun
 * sails, ink outlines). They stay where the art put them: right of the role cards.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, flat, frameArt, inked } from './kit';

const WATER_LIGHT = '#e8fbff';

/** A flat art shape (y down) → a thin extruded solid in world units (y up), centred in z. */
function slab(points: [number, number][], depth: number): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape(points.map(([x, y]) => new THREE.Vector2(x, -y)));
  const g = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
  g.translate(0, 0, -depth / 2);
  return g;
}

function sailboat(hull: string, main: string, jib: string) {
  const g = new THREE.Group();
  g.add(inked(slab([[-46, 0], [46, 0], [32, 18], [-32, 18]], 22), hull, 2));
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 94, 6), flat('#0e1446'));
  mast.position.set(0, 49, 0);
  g.add(mast);
  g.add(inked(slab([[4, -92], [52, -10], [4, -10]], 2), main, 2, { high: 0.2 }));
  g.add(inked(slab([[-4, -74], [-40, -10], [-4, -10]], 2), jib, 2, { high: 0.2 }));
  return g;
}

function paddleboarder() {
  const g = new THREE.Group();
  const board = inked(new THREE.SphereGeometry(1, 20, 10), '#ffd08a', 2);
  board.scale.set(58, 6, 15);
  g.add(board);
  const body = inked(new THREE.CapsuleGeometry(6, 26, 4, 10), '#ff8a7a', 1.8);
  body.position.set(0, 26, 0);
  g.add(body);
  const head = inked(new THREE.SphereGeometry(10, 16, 12), '#f2d3a0', 1.8);
  head.position.set(0, 56, 0);
  g.add(head);
  // Paddle: ink shaft + blade, swung from the shoulder.
  const paddle = new THREE.Group();
  paddle.position.set(0, 40, 6);
  const shaft = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 84, 6), flat('#0e1446'));
  shaft.position.y = -30;
  const blade = new THREE.Mesh(new THREE.CapsuleGeometry(4, 10, 3, 8), flat('#0e1446'));
  blade.position.y = -74;
  paddle.add(shaft, blade);
  g.add(paddle);
  return { g, paddle };
}

function buoy(band: string) {
  const g = new THREE.Group();
  const cone = inked(new THREE.ConeGeometry(14, 40, 12), '#fff8ec', 2);
  cone.position.y = 20;
  const ring = inked(new THREE.CylinderGeometry(20, 20, 14, 16), band, 2);
  ring.position.y = -7;
  g.add(cone, ring);
  return g;
}

/** Two short white arcs either side of the hull, swelling and fading (the art's wake strokes). */
function wake(width: number) {
  const g = new THREE.Group();
  const mat = flat(WATER_LIGHT, { transparent: true, opacity: 0.9 });
  const arc = new THREE.TorusGeometry(width * 0.22, 2, 4, 16, Math.PI * 0.7);
  for (const sx of [-1, 1]) {
    const m = new THREE.Mesh(arc, mat);
    m.rotation.z = Math.PI * 0.15;
    m.position.set(sx * width * 0.45, 0, 2);
    m.scale.set(1, 0.35, 1);
    g.add(m);
  }
  return { g, mat };
}

/** A pale, squashed, wobbling mirror image under the waterline. */
function reflection(src: THREE.Object3D) {
  const r = src.clone(true);
  const mat = flat(WATER_LIGHT, { transparent: true, opacity: 0.22, depthWrite: false });
  r.traverse((o) => {
    if ((o as THREE.Mesh).isMesh) (o as THREE.Mesh).material = mat;
  });
  r.scale.y = -0.55;
  return r;
}

interface Floater {
  obj: THREE.Group;
  refl?: THREE.Object3D;
  wake?: ReturnType<typeof wake>;
  x: number;
  y: number; // the art group's origin (art y)
  /** How far below the origin the waterline is, in the object's own units (hull bottom). */
  bottom: number;
  scale: number;
  phase: number;
  roll: number;
  bob: number;
  turn: number; // how far it swings round to show its side (radians)
}

export function createLakeBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const floaters: Floater[] = [];
  const addFloater = (obj: THREE.Group, f: Omit<Floater, 'obj' | 'refl' | 'wake'>, withWake = 0) => {
    obj.scale.setScalar(f.scale);
    scene.add(obj);
    const fl: Floater = { obj, ...f };
    if (tier === 'high') {
      fl.refl = reflection(obj);
      fl.refl.scale.set(f.scale, -0.55 * f.scale, f.scale);
      scene.add(fl.refl);
    }
    if (withWake) {
      fl.wake = wake(withWake);
      fl.wake.g.scale.setScalar(f.scale);
      scene.add(fl.wake.g);
    }
    floaters.push(fl);
    return fl;
  };

  // From involved.svg .boat: hull top sits on the waterline at the group origin.
  addFloater(sailboat('#ff8a7a', '#ffffff', '#ffd08a'), { x: 1180, y: 300, bottom: 18, scale: 1.2, phase: 0, roll: 0.06, bob: 4, turn: 0.5 }, 92);
  addFloater(sailboat('#7656c4', '#fff8ec', '#5fd6e8'), { x: 1330, y: 620, bottom: 18, scale: 0.85, phase: 2.3, roll: 0.07, bob: 3.5, turn: 0.45 }, 92);
  const sup = paddleboarder();
  const supF = addFloater(sup.g, { x: 1050, y: 760, bottom: 6, scale: 1, phase: 4.1, roll: 0.04, bob: 2.5, turn: 0.3 }, 110);
  // Buoys (anchored: they only bob and tilt). Origin = the cone's base, on the band.
  addFloater(buoy('#ff8a7a'), { x: 120, y: 760, bottom: 14, scale: 1, phase: 1.2, roll: 0.12, bob: 3, turn: 0.6 });
  addFloater(buoy('#ffd08a'), { x: 260, y: 860, bottom: 14, scale: 1, phase: 3.3, roll: 0.12, bob: 3, turn: 0.6 });

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(t) {
      for (const f of floaters) {
        const s = t * 0.9 + f.phase;
        const lift = Math.sin(s) * f.bob;
        const roll = Math.sin(s * 0.8 + 0.6) * f.roll;
        // The paddleboarder glides a little with each stroke.
        const drift = f === supF ? Math.sin(t * 0.35) * 24 : Math.sin(t * 0.12 + f.phase) * 6;
        f.obj.position.set(f.x + drift, -(f.y - lift), 0);
        f.obj.rotation.z = roll;
        f.obj.rotation.y = Math.sin(t * 0.18 + f.phase) * f.turn; // swings round, showing it's solid
        if (f.refl) {
          // Mirror about the waterline: the reflection's origin sits as far below it as the
          // squashed (×0.55) object reaches above it.
          const water = f.y + f.bottom * f.scale;
          f.refl.position.set(f.x + drift, -(water + f.bottom * f.scale * 0.55 + lift * 0.3), -5);
          f.refl.rotation.copy(f.obj.rotation);
          f.refl.rotation.z = -roll;
          f.refl.scale.x = f.scale * (1 + Math.sin(t * 2.4 + f.phase) * 0.04); // ripples
        }
        if (f.wake) {
          const pulse = (t * 0.45 + f.phase) % 1;
          f.wake.g.position.set(f.x + drift, -(f.y + f.bottom * f.scale + 4), 1);
          f.wake.g.scale.set(f.scale * (0.85 + pulse * 0.35), f.scale, 1);
          f.wake.mat.opacity = 0.85 * (1 - pulse);
        }
      }
      // Paddle strokes, alternating sides.
      const stroke = t * 1.4;
      sup.paddle.rotation.z = Math.sin(stroke) * 0.55;
      sup.paddle.rotation.y = Math.cos(stroke) > 0 ? 0.6 : -0.6;
    },
  };
}
