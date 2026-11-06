/**
 * Landmark review studio (dev-only). Views: front, three-quarter, close, phone, mask.
 * `mask` renders the bare logo flat white through an orthographic camera fitted to the
 * SVG viewBox (276 131 257 512), so scripts/visual/logo-match.mjs can compare it pixel
 * by pixel with the clean SVG.
 */
import { useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Landmark, LOGO_SCALE } from './Landmark';

export type LandmarkView = 'front' | 'three-quarter' | 'close' | 'phone' | 'mask';

const H = 1.6; // logo height in the studio (same as on the island)
const POSES: Record<Exclude<LandmarkView, 'mask'>, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  front: { pos: [0, 1.25, 6.2], target: [0, 1.0, 0], fov: 28 },
  'three-quarter': { pos: [3.9, 2.0, 4.6], target: [0, 0.95, 0], fov: 28 },
  close: { pos: [1.05, 2.25, 1.75], target: [0.12, 1.62, 0], fov: 30 },
  // The landmark at its planned size in the 390px hero stage (~90 CSS px tall).
  phone: { pos: [0, 4.2, 15], target: [0, 1.0, 0], fov: 30 },
};

function ReadyFlag() {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 15) document.documentElement.dataset.ready = 'true';
  });
  return null;
}

function Camera({ view }: { view: Exclude<LandmarkView, 'mask'> }) {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  useLayoutEffect(() => {
    const p = POSES[view];
    const cam = ref.current!;
    cam.position.set(...p.pos);
    cam.fov = size.width < size.height && view !== 'phone' ? p.fov * 1.6 : p.fov;
    cam.lookAt(...p.target);
    cam.updateProjectionMatrix();
  }, [view, size]);
  return <PerspectiveCamera ref={ref} makeDefault near={0.05} far={100} />;
}

/** Orthographic camera covering exactly the SVG viewBox in logo space (logo height = 1, bare). */
function MaskCamera() {
  const s = LOGO_SCALE;
  const left = (276 - 404.5) * s;
  const right = (533 - 404.5) * s;
  const top = (637 - 131) * s;
  const bottom = (637 - 643) * s;
  return <OrthographicCamera makeDefault left={left} right={right} top={top} bottom={bottom} near={0.01} far={10} position={[0, 0, 5]} zoom={1} />;
}

function Floor() {
  return (
    <group>
      <gridHelper args={[60, 120, '#2c3462', '#2c3462']} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[1.25, 1.265, 96]} />
        <meshBasicMaterial color="#84DBF7" transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function LandmarkStudio({ view = 'three-quarter' }: { view?: LandmarkView }) {
  if (view === 'mask') {
    return (
      <Canvas flat dpr={1} gl={{ antialias: false }}>
        <color attach="background" args={['#000000']} />
        <MaskCamera />
        <Landmark height={1} bare mask animate={false} />
        <ReadyFlag />
      </Canvas>
    );
  }
  return (
    <Canvas flat dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#0F1539']} />
      <fog attach="fog" args={['#0F1539', 8, 40]} />
      <Camera view={view} />
      <ambientLight color="#7d8fd6" intensity={0.5} />
      <directionalLight position={[-3, 5, 4]} intensity={1.2} color="#e3ebff" />
      <Floor />
      <Landmark height={H} animate={false} />
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.62} luminanceSmoothing={0.3} intensity={1.25} radius={0.72} />
      </EffectComposer>
      <ReadyFlag />
    </Canvas>
  );
}

export default LandmarkStudio;
