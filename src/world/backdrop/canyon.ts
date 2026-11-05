/**
 * Schedule backdrop (Myra Canyon at first light, art 1440×1100): the cyclist rides the
 * trestle in 3D, wheels spinning and legs pedalling, brakes at each end and turns around.
 * A second rider (high tier) uses the far lane, so they pass each other. Built from the
 * art's cyclist (coral shirt, aqua helmet, ink frame) in the sticker style: toon shading with
 * ink outlines, seen a little from the side so the turn reads as 3D.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, flat, frameArt, inked } from './kit';

/**
 * The trestle deck (schedule.svg #m-trestle): x 250–1190, riding surface at y 752.
 * Riders go end to end: the bike reaches 24 units behind and 26 ahead of its centre, so the
 * wheels touch each end of the deck before the turn.
 */
const GROUND = 752;
const DECK_LEFT = 250;
const DECK_RIGHT = 1190;
const X_MIN = DECK_LEFT + 26;
const X_MAX = DECK_RIGHT - 26;
const INK = '#0e1446';

function makeCyclist(shirt: string, helmet: string) {
  const root = new THREE.Group(); // position on the deck; turns around its own vertical axis
  const bike = new THREE.Group();
  root.add(bike);

  // Wheels: ink rims with two spokes so the spin shows.
  const wheel = () => {
    const w = new THREE.Group();
    w.add(new THREE.Mesh(new THREE.TorusGeometry(10, 1.5, 6, 24), flat(INK)));
    const spoke = new THREE.BoxGeometry(19, 1, 1);
    w.add(new THREE.Mesh(spoke, flat(INK)));
    const s2 = new THREE.Mesh(spoke, flat(INK));
    s2.rotation.z = Math.PI / 2;
    w.add(s2);
    return w;
  };
  const back = wheel();
  back.position.set(-14, 10, 0);
  const front = wheel();
  front.position.set(16, 10, 0);
  bike.add(back, front);

  // Frame (the art's "M-14-10 0-26l16 16M0-26l-6 16m6-16 4-12" in ink).
  const bar = (x0: number, y0: number, x1: number, y1: number, r = 1.4) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), flat(INK));
    m.position.set((x0 + x1) / 2, (y0 + y1) / 2, 0);
    m.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2;
    bike.add(m);
    return m;
  };
  bar(-14, 10, 0, 26);
  bar(0, 26, 16, 10);
  bar(0, 26, -6, 10);
  bar(0, 26, 4, 38); // seat post up to the saddle
  bar(16, 10, 12, 36); // fork up to the bars
  bar(8, 36, 16, 36, 1.2); // handlebar

  // Rider: coral torso leaning forward, skin-tone head, aqua helmet (all inked).
  const torso = inked(new THREE.CapsuleGeometry(4.2, 12, 4, 10), shirt, 1.6);
  torso.position.set(6, 38, 0);
  torso.rotation.z = -0.55;
  bike.add(torso);
  const head = inked(new THREE.SphereGeometry(7, 16, 12), '#f2d3a0', 1.6);
  head.position.set(10, 52, 0);
  bike.add(head);
  const lid = inked(new THREE.SphereGeometry(7.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2.2), helmet, 1.4);
  lid.position.set(10.5, 53, 0);
  lid.rotation.z = -0.35;
  bike.add(lid);
  const arm = inked(new THREE.CapsuleGeometry(1.6, 9, 3, 6), shirt, 1.2);
  arm.position.set(12, 39, 3);
  arm.rotation.z = -1.0;
  bike.add(arm);

  // Legs: two thighs + shins that follow the crank (ink trousers like the frame).
  const crank = new THREE.Vector3(0, 12, 0);
  const hip = new THREE.Vector3(2, 32, 0);
  const legs = [0, Math.PI].map((offset, side) => {
    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(2, 9, 3, 6), flat('#2a2470'));
    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(1.7, 9, 3, 6), flat('#2a2470'));
    thigh.position.z = shin.position.z = side ? -3 : 3;
    bike.add(thigh, shin);
    return { thigh, shin, offset };
  });
  const placeLimb = (m: THREE.Mesh, a: THREE.Vector3, b: THREE.Vector3) => {
    m.position.set((a.x + b.x) / 2, (a.y + b.y) / 2, m.position.z);
    m.rotation.z = Math.atan2(b.y - a.y, b.x - a.x) - Math.PI / 2;
  };
  const foot = new THREE.Vector3();
  const knee = new THREE.Vector3();

  return {
    root,
    /** angle = crank / wheel angle in radians. */
    pedal(angle: number) {
      back.rotation.z = front.rotation.z = -angle;
      for (const leg of legs) {
        // Pedal forward: the cranks turn the same way as the wheels (clockwise when riding right).
        const a = -angle + leg.offset;
        foot.set(crank.x + Math.cos(a) * 6, crank.y + Math.sin(a) * 6, 0);
        // Knee: out in front of the line hip→foot.
        knee.set((hip.x + foot.x) / 2 + 6, (hip.y + foot.y) / 2 + 2, 0);
        placeLimb(leg.thigh, hip, knee);
        placeLimb(leg.shin, knee, foot);
      }
    },
  };
}

interface Rider {
  c: ReturnType<typeof makeCyclist>;
  x: number;
  dir: 1 | -1;
  speed: number;
  /** Turn progress: 0 = riding, then 0→1 while turning around at an end. */
  turn: number;
  facing: number; // current yaw
  crank: number;
  z: number;
}

export function createCanyonBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const riders: Rider[] = [];
  const add = (shirt: string, helmet: string, x: number, dir: 1 | -1, speed: number, z: number) => {
    const c = makeCyclist(shirt, helmet);
    scene.add(c.root);
    riders.push({ c, x, dir, speed, turn: 0, facing: dir > 0 ? 0 : Math.PI, crank: 0, z });
  };
  add('#ff8a7a', '#5fd6e8', 520, 1, 46, 30); // the art's rider, near lane
  if (tier === 'high') add('#5fd6e8', '#ffd08a', 980, -1, 34, -30); // far lane

  // Three-quarter view: riders are turned a little toward the viewer, so turning reads as 3D.
  const VIEW = 0.42;

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(_t, dt) {
      for (const r of riders) {
        if (r.turn > 0) {
          // Braked at the end of the deck: swing around over ~1.4 s.
          r.turn = Math.min(1, r.turn + dt / 1.4);
          const from = r.dir > 0 ? Math.PI : 0;
          const to = r.dir > 0 ? 0 : Math.PI;
          r.facing = from + (to - from) * THREE.MathUtils.smootherstep(r.turn, 0, 1);
          if (r.turn >= 1) r.turn = 0;
        } else {
          r.x += r.dir * r.speed * dt;
          r.crank += (r.speed * dt) / 10; // wheel radius 10
          if ((r.dir > 0 && r.x >= X_MAX) || (r.dir < 0 && r.x <= X_MIN)) {
            r.dir = r.dir > 0 ? -1 : 1;
            r.turn = 0.0001;
          }
        }
        r.c.pedal(r.crank);
        r.c.root.position.set(r.x, -GROUND, r.z);
        // Facing 0 = riding right. Yaw toward the viewer by VIEW for the three-quarter look.
        r.c.root.rotation.y = r.facing - VIEW * Math.cos(r.facing); // smooth through the turn
      }
    },
  };
}
