/**
 * The 3D island in About/Explore, drawn by the page's ONE shared renderer (spec 0.8.6).
 *
 * The island is a React Three Fiber scene. Instead of giving it its own <Canvas> (a second
 * WebGL context), its R3F root is handed the backdrop engine's renderer, never draws or
 * resizes on its own, and is added to the engine as one more layer: the engine advances it
 * and renders it into a 2D canvas over the island picture, only while the stage is on screen.
 *
 * - island.png stays in the page; it fades out once the first 3D frame is drawn and comes
 *   back if the engine stops (slow device). Reduced motion never loads this (backdrop.ts).
 * - Drag rotates the island up to ±18° and springs back; touch drags are horizontal only, so
 *   vertical swipes still scroll. A tap makes the quail wave.
 * - The layer sits under the hotspot links, so it never blocks them.
 */
import { useLayoutEffect, useRef, useState } from 'react';
import { advance, createRoot, extend, useFrame, useStore, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { ValleyIsland } from './ValleyIsland';
import { ANIMATION_SPEED, type Backdrop, type BackdropEngine } from '../backdrop/engine';

const WAVE_MS = 2600;
const MAX_TILT = THREE.MathUtils.degToRad(18);

/** Drag and tap state, shared between the DOM listeners and the scene. */
interface Rig {
  target: number;
  dragging: boolean;
  onTap: () => void;
}

/**
 * The layer reaches this far above the picture (fraction of its height), so the logo's glow
 * fades out in open sky instead of being cut off by the layer's top edge.
 */
const HEADROOM = 0.35;

/** Camera framing, matched to island.png (the picture's box, plus the headroom above it). */
const VIEW = {
  fov: 26,
  pitch: 22, // degrees above the horizon
  halfWidth: 7.55, // world units across half the stage, at the island's centre
  // Where the island's centre sits, from the top of the layer (0..1): 76% down the picture.
  centreY: (HEADROOM + 0.76) / (1 + HEADROOM),
};

/** Fits the island into the stage from the same angle as island.png. */
function FitCamera() {
  const { camera, size } = useThree();
  useLayoutEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    cam.fov = VIEW.fov;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const dist = VIEW.halfWidth / Math.tan(hfov / 2);
    const pitch = THREE.MathUtils.degToRad(VIEW.pitch);
    cam.position.set(0, Math.sin(pitch) * dist, Math.cos(pitch) * dist);
    cam.near = 0.5;
    cam.far = dist * 4;
    cam.lookAt(0, 0, 0);
    cam.updateProjectionMatrix();
    // Shift the picture down so the island's centre lands where it is in island.png.
    cam.projectionMatrix.elements[9] = 1 - 2 * (1 - VIEW.centreY);
    cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
  }, [camera, size]);
  return null;
}

function IslandScene({ tier, rig, onStore }: { tier: 'high' | 'medium'; rig: Rig; onStore: (store: ReturnType<typeof useStore>) => void }) {
  const store = useStore();
  const group = useRef<THREE.Group>(null);
  const vel = useRef(0);
  const [wave, setWave] = useState(false);

  useLayoutEffect(() => {
    let timer = 0;
    rig.onTap = () => {
      setWave(true);
      clearTimeout(timer);
      timer = window.setTimeout(() => setWave(false), WAVE_MS);
    };
    onStore(store);
    return () => clearTimeout(timer);
  }, [rig, store, onStore]);

  // Priority 1 takes over rendering from R3F: the engine draws the scene itself.
  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;
    if (!rig.dragging) rig.target *= Math.pow(0.02, dt); // spring back
    const k = 14; // critically damped follow
    vel.current += (rig.target - g.rotation.y) * k * k * dt - 2 * k * vel.current * dt;
    g.rotation.y += vel.current * dt;
  }, 1);

  return (
    <>
      <FitCamera />
      {/* Warm sunset key from the right, a soft lilac fill, and a teal/violet rim from the aurora above. */}
      <hemisphereLight args={['#f6eeff', '#9fb0e0', 1.9]} />
      <directionalLight position={[9, 7, 5]} intensity={1.5} color="#ffe2c4" />
      <directionalLight position={[-6, 9, -6]} intensity={0.7} color="#9fe7e0" />
      <group ref={group}>
        <ValleyIsland tier={tier} still={false} wave={wave} />
      </group>
    </>
  );
}

/** Drag to tilt (horizontal only on touch), tap to wave. Listens on the layer canvas only. */
function bindPointer(el: HTMLElement, rig: Rig) {
  let startX = 0;
  let base = 0;
  let moved = false;
  el.addEventListener('pointerdown', (e) => {
    rig.dragging = true;
    moved = false;
    startX = e.clientX;
    base = rig.target;
    el.setPointerCapture(e.pointerId);
  });
  el.addEventListener('pointermove', (e) => {
    if (!rig.dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 4) moved = true;
    rig.target = THREE.MathUtils.clamp(base + (dx / el.clientWidth) * 1.4, -MAX_TILT, MAX_TILT);
  });
  const end = (tap: boolean) => {
    if (tap && !moved) rig.onTap();
    rig.dragging = false;
  };
  el.addEventListener('pointerup', () => end(true));
  el.addEventListener('pointercancel', () => end(false));
}

export function mountIsland(engine: BackdropEngine, stage: HTMLElement) {
  if (!engine.running) return;
  const layerPx = new THREE.Vector2(1, 1);
  const shared = engine.renderer;
  // The island's view of the shared renderer: it may draw with it, but never resize it, and
  // its drawing-buffer size is the island layer's (the outlines use it for their width).
  const gl = new Proxy(shared, {
    get(target, key) {
      if (key === 'setSize' || key === 'setPixelRatio') return () => {};
      if (key === 'getDrawingBufferSize') return (v: THREE.Vector2) => v.copy(layerPx);
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
    set(target, key, value) {
      return Reflect.set(target, key, value, target);
    },
  });

  // <Canvas> registers three's classes (mesh, fog, lights…) itself; a bare root has to.
  extend(THREE as unknown as Parameters<typeof extend>[0]);
  const root = createRoot(document.createElement('canvas'));
  const rig: Rig = { target: 0, dragging: false, onTap: () => {} };
  let added = false;

  const onStore = (store: ReturnType<typeof useStore>) => {
    if (added) return;
    added = true;
    const state = (): RootState => store.getState();
    const backdrop: Backdrop = {
      get scene() {
        return state().scene;
      },
      get camera() {
        return state().camera;
      },
      resize(ctx) {
        layerPx.set(Math.round(ctx.width * ctx.res), Math.round(ctx.height * ctx.res));
        state().setSize(ctx.width, ctx.height);
      },
      update(t) {
        // Runs the island's own animations (useFrame) at real speed; it never renders itself.
        advance(t / ANIMATION_SPEED, true, state());
      },
    };
    // Compile the island's shaders now, so the first frames (and the first tap) don't stall.
    shared.compile(state().scene, state().camera);

    // The layer box: the picture's area plus headroom above it, under the hotspot links
    // (they come later in the stage) and over the picture.
    const box = document.createElement('div');
    box.setAttribute('aria-hidden', 'true');
    box.dataset.islandLayer = '';
    box.style.cssText = `position:absolute;left:0;right:0;bottom:0;top:${-HEADROOM * 100}%;pointer-events:none;`;
    stage.querySelector('[data-world-mark]')?.after(box);
    engine.add(stage, box, backdrop, {
      keep: true, // the 2D island is off, so a slow device keeps the 3D one
      onFirstFrame: () => (stage.dataset.world = 'ready'),
      onStop: () => {
        stage.dataset.world = 'fallback';
        box.remove();
        stage.querySelector('[data-island-hit]')?.remove();
        root.unmount();
      },
    });
    // Drags are caught over the picture's area only (not the headroom over the text above).
    const hit = document.createElement('div');
    hit.setAttribute('aria-hidden', 'true');
    hit.dataset.islandHit = '';
    box.after(hit);
    bindPointer(hit, rig);
  };

  stage.dataset.world = 'loading';
  root.configure({
    gl,
    frameloop: 'never',
    flat: true,
    dpr: 1,
    events: undefined,
    camera: { fov: 30, near: 0.5, far: 200 },
    size: { width: stage.clientWidth || 1, height: stage.clientHeight || 1, top: 0, left: 0 },
  });
  root.render(<IslandScene tier={engine.tier} rig={rig} onStore={onStore} />);
}
