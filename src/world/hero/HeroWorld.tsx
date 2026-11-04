/**
 * The hero's 3D stage: Tiny Okanagan in the hero stage slot (spec 6A, M1–M5, M9).
 * - Transparent canvas over the page blueprint; camera fits the island to the stage.
 * - First visit: the island assembles in ASSEMBLY_S seconds. Repeat visits: shown finished.
 * - `still` (reduced motion / slow device): renders on demand, no idle motion.
 * - Drag rotates the island up to ±18° and springs back. Touch: horizontal only (pan-y).
 * - Pauses off-screen and in hidden tabs. Any tier reports if frames run slow (→ still island).
 */
import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Island, LANDMARK_HEIGHT, type Tier } from '../island/Island';
import { SPOTS, groundHeight } from '../layout';

const Effects = lazy(() => import('./Effects'));

export const ASSEMBLY_S = 0.9;

export interface LandmarkOnScreen {
  /** Landmark logo centre in stage CSS px, and its on-screen height. */
  x: number;
  y: number;
  h: number;
}

export interface HeroWorldProps {
  tier: Tier;
  still: boolean;
  intro: boolean;
  /** Called after the first frame is drawn, with the landmark's on-screen position. */
  onReady: (landmark: LandmarkOnScreen) => void;
  /** Called if the device can't keep up; the parent switches to still frames. */
  onSlow?: () => void;
}

/** Fit the island into the stage (art direction §4); phones use a wider lens instead of backing off. */
function HeroCamera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    cam.fov = aspect < 1 ? THREE.MathUtils.lerp(48, 30, Math.max(0, (aspect - 0.45) / 0.55)) : 30;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    // The canvas is a little wider than the stage (soft edges); on phones that margin is off-screen, so fill less of it.
    const fill = size.width < 600 ? 0.8 : 0.95;
    const byWidth = 7.6 / fill / Math.tan(hfov / 2);
    const byHeight = 6.6 / Math.tan(vfov / 2);
    const dist = Math.max(byWidth, byHeight);
    const pitch = THREE.MathUtils.degToRad(30);
    const yaw = THREE.MathUtils.degToRad(-8);
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.near = 0.5;
    cam.far = dist * 4;
    cam.lookAt(0, -0.1, 0);
    cam.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

/** Pointer drag → island yaw (±18°), spring back on release. Horizontal touch drags only; vertical swipes scroll. */
function DragRig({ still, children }: { still: boolean; children: ReactNode }) {
  const group = useRef<THREE.Group>(null);
  const { gl, invalidate } = useThree();
  const target = useRef(0);
  const vel = useRef(0);
  const dragging = useRef(false);
  useEffect(() => {
    const el = gl.domElement;
    el.style.touchAction = 'pan-y';
    let startX = 0;
    let base = 0;
    const max = THREE.MathUtils.degToRad(18);
    const down = (e: PointerEvent) => {
      dragging.current = true;
      startX = e.clientX;
      base = target.current;
      el.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!dragging.current) return;
      target.current = THREE.MathUtils.clamp(base + ((e.clientX - startX) / el.clientWidth) * 1.4, -max, max);
      invalidate();
    };
    const up = () => {
      dragging.current = false;
      invalidate();
    };
    el.addEventListener('pointerdown', down);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', up);
    };
  }, [gl, invalidate]);
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!dragging.current) target.current *= Math.pow(0.02, dt); // spring back
    if (still) {
      g.rotation.y = target.current;
      if (Math.abs(target.current) > 0.001) invalidate();
      return;
    }
    // Critically damped follow
    const k = 14;
    vel.current += (target.current - g.rotation.y) * k * k * dt - 2 * k * vel.current * dt;
    g.rotation.y += vel.current * dt;
  });
  return <group ref={group}>{children}</group>;
}

/** Pause rendering when the canvas is off-screen or the tab is hidden (M4). */
function Pauser({ still }: { still: boolean }) {
  const { gl, setFrameloop } = useThree();
  useEffect(() => {
    if (still) return;
    let onScreen = true;
    const apply = () => setFrameloop(onScreen && !document.hidden ? 'always' : 'never');
    const io = new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      apply();
    });
    io.observe(gl.domElement);
    document.addEventListener('visibilitychange', apply);
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', apply);
    };
  }, [gl, setFrameloop, still]);
  return null;
}

/** Watchdog: if the average frame time stays over ~45 ms for 2 s, tell the parent (it switches to a still island). */
function Watchdog({ onSlow }: { onSlow?: () => void }) {
  const acc = useRef({ t: 0, n: 0, fired: false });
  useFrame((_, dt) => {
    const a = acc.current;
    if (a.fired || !onSlow) return;
    a.t += dt;
    a.n += 1;
    if (a.t > 2) {
      if (a.t / a.n > 0.045) {
        a.fired = true;
        onSlow();
      }
      a.t = 0;
      a.n = 0;
    }
  });
  return null;
}

/** Assembly timeline + first-frame handshake (projects the landmark to stage pixels for the 2D → 3D handoff). */
function Director({ intro, progress, onReady }: { intro: boolean; progress: { current: number }; onReady: HeroWorldProps['onReady'] }) {
  const { camera, size } = useThree();
  const start = useRef<number | null>(null);
  const reported = useRef(false);
  useFrame(({ clock }) => {
    if (start.current === null) start.current = clock.elapsedTime;
    progress.current = intro ? Math.min(1, (clock.elapsedTime - start.current) / ASSEMBLY_S) : 1;
    if (!reported.current) {
      reported.current = true;
      const [lx, lz] = SPOTS.landmark;
      const base = groundHeight(lx, lz) + (0.28 * LANDMARK_HEIGHT) / 1.6;
      const top = new THREE.Vector3(lx, base + LANDMARK_HEIGHT, lz).project(camera);
      const bottom = new THREE.Vector3(lx, base, lz).project(camera);
      const toPx = (v: THREE.Vector3) => ({ x: ((v.x + 1) / 2) * size.width, y: ((1 - v.y) / 2) * size.height });
      const t = toPx(top);
      const b = toPx(bottom);
      onReady({ x: (t.x + b.x) / 2, y: (t.y + b.y) / 2, h: Math.abs(b.y - t.y) });
    }
  });
  return null;
}

export function HeroWorld({ tier, still, intro, onReady, onSlow }: HeroWorldProps) {
  const progress = useMemo(() => ({ current: intro && !still ? 0 : 1 }), [intro, still]);
  // The quail waves for a moment once the island has assembled, then goes back to its laptop.
  const [wave, setWave] = useState(!still);
  useEffect(() => {
    if (still) return;
    const id = setTimeout(() => setWave(false), (intro ? ASSEMBLY_S : 0) * 1000 + 2600);
    return () => clearTimeout(id);
  }, [intro, still]);

  return (
    <Canvas
      flat
      frameloop={still ? 'demand' : 'always'}
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      gl={{ alpha: true, antialias: tier === 'high', powerPreference: 'high-performance' }}
      camera={{ fov: 30, near: 0.5, far: 200 }}
      style={{ position: 'absolute', inset: 0 }}
    >
      <HeroCamera />
      {/* Fog fades toward the twilight sky (--twilight-3), so distant edges never read as a dark cutout. */}
      <fog attach="fog" args={['#2a4a9e', 40, 75]} />
      {/*
       * Twilight moonlight rig: the moon sits upper right in the scenery, so the key comes from
       * upper right and slightly in front; bright blue ambient; a sky rim from back-left.
       */}
      <ambientLight color="#93a8ec" intensity={1.15} />
      <directionalLight position={[7, 10, 3]} intensity={2.1} color="#eef4ff" />
      <directionalLight position={[-5, 5, -8]} intensity={0.85} color="#84DBF7" />
      <DragRig still={still}>
        <Island tier={tier} still={still} progress={progress} wave={wave && !still} />
      </DragRig>
      <Director intro={intro && !still} progress={progress} onReady={onReady} />
      <Pauser still={still} />
      {!still && <Watchdog onSlow={onSlow} />}
      {tier === 'high' && (
        <Suspense fallback={null}>
          <Effects />
        </Suspense>
      )}
    </Canvas>
  );
}

export default HeroWorld;
