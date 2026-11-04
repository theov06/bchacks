/**
 * Soft toon outline (art direction §2): an inverted hull pushed out in screen
 * space, so the line keeps the same pixel width on scaled parts and at any
 * render size. Place <Outline /> inside a <mesh>; it reuses the parent geometry.
 * One shared material per width; the canvas size is updated once per frame.
 */
import { useLayoutEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OUTLINE } from './toon';

const materials = new Map<string, THREE.ShaderMaterial>();
const resolution = new THREE.Vector2(1, 1);

function outlineMaterial(px: number, color: string) {
  const key = `${px}:${color}`;
  let m = materials.get(key);
  if (!m) {
    m = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        uPx: { value: px },
        uColor: { value: new THREE.Color(color) },
        uResolution: { value: resolution },
      },
      vertexShader: /* glsl */ `
        uniform float uPx;
        uniform vec2 uResolution;
        void main() {
          vec4 clip = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          vec3 n = normalize(normalMatrix * normal);
          vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
          float len = length(dir);
          if (len > 0.0) clip.xy += (dir / len) * uPx * 2.0 / uResolution * clip.w;
          gl_Position = clip;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        void main() { gl_FragColor = vec4(uColor, 1.0); }
      `,
    });
    materials.set(key, m);
  }
  return m;
}

export function Outline({ px = 2, color = OUTLINE }: { px?: number; color?: string }) {
  const ref = useRef<THREE.Group>(null);
  const { gl } = useThree();
  useLayoutEffect(() => {
    const group = ref.current;
    const parent = group?.parent as THREE.Mesh | null;
    if (!group || !parent?.geometry) return;
    const hull = new THREE.Mesh(parent.geometry, outlineMaterial(px, color));
    hull.raycast = () => {};
    group.add(hull);
    return () => {
      group.remove(hull);
    };
  });
  // Drawing-buffer size (device pixels), so the width is right at any DPR.
  useFrame(() => {
    gl.getDrawingBufferSize(resolution);
  });
  return <group ref={ref} />;
}

export default Outline;
