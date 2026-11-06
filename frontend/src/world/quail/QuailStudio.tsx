/**
 * Quail review studio (dev-only): the mascot on a small blueprint disc under the
 * island's moonlight rig. Views: front, three-quarter, side, wave, phone.
 * `phone` renders the bird at the size it will have in the 390px hero stage.
 */
import { useLayoutEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Quail } from './Quail';

export type QuailView = 'front' | 'three-quarter' | 'side' | 'wave' | 'phone';

const POSES: Record<QuailView, { pos: [number, number, number]; target: [number, number, number]; fov: number }> = {
  front: { pos: [0, 0.95, 5.0], target: [0, 0.58, 0], fov: 28 },
  'three-quarter': { pos: [3.5, 1.6, 3.5], target: [0, 0.55, 0], fov: 28 },
  side: { pos: [5.0, 0.95, 0.05], target: [0, 0.58, 0], fov: 28 },
  wave: { pos: [1.3, 1.1, 4.7], target: [0, 0.62, 0], fov: 28 },
  // The bird at its planned hero size on a 390px phone: ~56 CSS px tall (toy-scale, ~1.6× island scale).
  phone: { pos: [0, 2.8, 12], target: [0, 0.5, 0], fov: 30 },
};

function Camera({ view }: { view: QuailView }) {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const { size } = useThree();
  useLayoutEffect(() => {
    const p = POSES[view];
    const cam = ref.current!;
    cam.position.set(...p.pos);
    // Portrait screens: widen the lens so the bird still fits.
    cam.fov = size.width < size.height && view !== 'phone' ? p.fov * 1.55 : p.fov;
    cam.lookAt(...p.target);
    cam.updateProjectionMatrix();
  }, [view, size]);
  return <PerspectiveCamera ref={ref} makeDefault near={0.05} far={100} />;
}

function ReadyFlag() {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 15) document.documentElement.dataset.ready = 'true';
  });
  return null;
}

/** Blueprint floor: grid + construction circle, as under the island. */
function Floor() {
  return (
    <group>
      <gridHelper args={[60, 120, '#2c3462', '#2c3462']} position={[0, -0.001, 0]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[0.9, 0.912, 96]} />
        <meshBasicMaterial color="#84DBF7" transparent opacity={0.35} />
      </mesh>
    </group>
  );
}

export function QuailStudio({ view = 'three-quarter' }: { view?: QuailView }) {
  return (
    // flat = no filmic tone curve: toon colours stay as designed.
    <Canvas flat dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={['#0F1539']} />
      <fog attach="fog" args={['#0F1539', 6, 30]} />
      <Camera view={view} />
      {/* Moonlight rig (art direction §2): cool key from upper left, blue fill, sky rim from behind. */}
      {/* Flat ambient (not hemisphere) so the cel bands come only from the key and rim lights. */}
      <ambientLight color="#7d8fd6" intensity={0.5} />
      <directionalLight position={[-3, 5, 4]} intensity={1.5} color="#e3ebff" />
      <directionalLight position={[2, 3, -4]} intensity={1.0} color="#84DBF7" />
      <Floor />
      <ContactShadows position={[0, 0.003, 0]} opacity={0.55} scale={3} blur={2.4} far={1.2} color="#05081c" />
      <Quail wave={view === 'wave'} laptop={view !== 'wave'} outlines />
      <ReadyFlag />
    </Canvas>
  );
}

export default QuailStudio;
