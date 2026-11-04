/**
 * The 3D BCHacks logo landmark (spec 6B): the clean-SVG monogram extruded into a
 * chunky glowing block, standing on a two-tier hexagonal pedestal.
 *
 * Shape: the exact LOGO_B / LOGO_C polygons. The bevel uses bevelOffset = -bevelSize,
 * so the outer silhouette is the polygon itself and the rounding happens inward.
 * Colour: the Sky Circuit logo gradient (#B5ECFF → #84DBF7 → #3B82F6, top to bottom
 * with a slight diagonal), computed per pixel in logo space, emissive for bloom.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';
import { LOGO_B, LOGO_C, toPoints } from '../../lib/logoGeometry';
import { sceneTime } from '../toon';

/** SVG units → logo space: 500 SVG units tall (y 137..637) = 1 unit; x centred on 404.5; y up from the bottom. */
export const LOGO_SCALE = 1 / 500;
export const toLogoSpace = (px: number, py: number) => new THREE.Vector2((px - 404.5) * LOGO_SCALE, (637 - py) * LOGO_SCALE);

export const LOGO_DEPTH = 0.2;
const BEVEL = 0.022;

export function logoShapes() {
  return [LOGO_B, LOGO_C].map((poly) => new THREE.Shape(toPoints(poly).map(([x, y]) => toLogoSpace(x, y))));
}

/** Extruded monogram, front face at z = +depth/2, centred on z. */
export function useLogoGeometry(depth = LOGO_DEPTH) {
  return useMemo(() => {
    const g = new THREE.ExtrudeGeometry(logoShapes(), {
      depth: depth - BEVEL * 2,
      bevelEnabled: true,
      bevelThickness: BEVEL,
      bevelSize: BEVEL,
      bevelOffset: -BEVEL, // silhouette stays exactly on the polygon
      bevelSegments: 3,
      curveSegments: 1,
    });
    g.translate(0, 0, -depth / 2 + BEVEL);
    g.computeVertexNormals();
    return g;
  }, [depth]);
}

// Gradient axis in logo space, from the SVG gradient x1,y1 = (440,137) → x2,y2 = (370,637).
const G_FROM = toLogoSpace(440, 137);
const G_TO = toLogoSpace(370, 637);

/** Emissive gradient material. `glow` > 1 pushes the colours over the bloom threshold. */
export function makeLogoMaterial(glow = 1.0) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uFrom: { value: G_FROM },
      uTo: { value: G_TO },
      uTop: { value: new THREE.Color('#B5ECFF') },
      uMid: { value: new THREE.Color('#84DBF7') },
      uBot: { value: new THREE.Color('#3B82F6') },
      uIce: { value: new THREE.Color('#B5ECFF') },
      uGlow: { value: glow },
    },
    vertexShader: /* glsl */ `
      varying vec3 vObj;
      varying vec3 vNrm;
      varying vec3 vViewN;
      void main() {
        vObj = position;
        vNrm = normal;
        vViewN = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec2 uFrom; uniform vec2 uTo;
      uniform vec3 uTop; uniform vec3 uMid; uniform vec3 uBot; uniform vec3 uIce;
      uniform float uGlow;
      varying vec3 vObj; varying vec3 vNrm; varying vec3 vViewN;
      void main() {
        vec2 d = uTo - uFrom;
        float t = clamp(dot(vObj.xy - uFrom, d) / dot(d, d), 0.0, 1.0);
        vec3 grad = t < 0.45 ? mix(uTop, uMid, t / 0.45) : mix(uMid, uBot, (t - 0.45) / 0.55);
        // Simple form shading in logo space: front faces brightest, side walls a step darker
        // (more electric), top-facing bevels catch the ice light.
        vec3 n = normalize(vNrm);
        float front = max(n.z, 0.0);
        float up = max(n.y, 0.0);
        // Side walls sit a full step darker and lean electric, so the extrusion reads as a solid block.
        vec3 side = mix(grad, uBot, 0.45) * 0.52;
        vec3 col = mix(side, grad, front) + uIce * up * 0.14;
        // Thin edge glow where surfaces turn away from the viewer.
        float rim = pow(1.0 - abs(vViewN.z), 3.0);
        col = mix(col, uIce, rim * 0.18);
        gl_FragColor = vec4(col * uGlow, 1.0);
      }
    `,
    toneMapped: false,
  });
}

/** Radial glow texture for the light pool (white centre → transparent). */
function useGlowTexture() {
  return useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    // Soft, roughly exponential falloff so the edge never reads as a disc.
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.18, 'rgba(255,255,255,0.62)');
    g.addColorStop(0.42, 'rgba(255,255,255,0.22)');
    g.addColorStop(0.7, 'rgba(255,255,255,0.06)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
}

const HEX_TO_TORUS = Math.PI / 6; // torus hex vertices sit on +x; the cylinder's on +z

/** Two-tier hexagonal pedestal with glowing hex rings and a light pool. Top surface at y = PEDESTAL_TOP. */
export const PEDESTAL_TOP = 0.2;

function Pedestal() {
  const glow = useGlowTexture();
  return (
    <group>
      {/* Light pool on the ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial map={glow} color="#3B82F6" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
      {/* Base tier */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.66, 0.7, 0.12, 6]} />
        <meshStandardMaterial color="#151B45" roughness={0.6} metalness={0.2} flatShading />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[Math.PI / 2, 0, HEX_TO_TORUS]}>
        <torusGeometry args={[0.665, 0.012, 6, 6]} />
        <meshBasicMaterial color={new THREE.Color('#84DBF7').multiplyScalar(1.2)} toneMapped={false} />
      </mesh>
      {/* Top tier */}
      <mesh position={[0, 0.16, 0]}>
        <cylinderGeometry args={[0.5, 0.54, 0.08, 6]} />
        <meshStandardMaterial color="#262C55" roughness={0.5} metalness={0.25} flatShading />
      </mesh>
      <mesh position={[0, PEDESTAL_TOP, 0]} rotation={[Math.PI / 2, 0, HEX_TO_TORUS]}>
        <torusGeometry args={[0.5, 0.014, 6, 6]} />
        <meshBasicMaterial color={new THREE.Color('#B5ECFF').multiplyScalar(1.3)} toneMapped={false} />
      </mesh>
      {/* Glowing top face: an inner hex panel */}
      <mesh position={[0, PEDESTAL_TOP + 0.001, 0]} rotation={[-Math.PI / 2, 0, HEX_TO_TORUS]}>
        <circleGeometry args={[0.42, 6]} />
        <meshBasicMaterial color={new THREE.Color('#3B82F6').multiplyScalar(0.55)} toneMapped={false} />
      </mesh>
    </group>
  );
}

export interface LandmarkProps {
  /** Logo height in world units. */
  height?: number;
  /** Gentle hover and glow pulse. Off for stills and reduced motion. */
  animate?: boolean;
  /** Logo only (no pedestal): used by the shape check. */
  bare?: boolean;
  /** Replace the gradient with flat white (shape check mask). */
  mask?: boolean;
}

export function Landmark({ height = 1.6, animate = true, bare = false, mask = false }: LandmarkProps) {
  const geo = useLogoGeometry();
  const mat = useMemo(() => (mask ? new THREE.MeshBasicMaterial({ color: '#ffffff' }) : makeLogoMaterial()), [mask]);
  const logo = useRef<THREE.Group>(null);
  const halo = useRef<THREE.Mesh>(null);
  const haloTex = useGlowTexture();
  useFrame(({ clock }) => {
    if (!animate || !logo.current) return;
    const t = sceneTime(clock.elapsedTime);
    logo.current.position.y = (bare ? 0 : PEDESTAL_TOP + 0.08) + Math.sin(t * 1.1) * 0.025;
    if (mat instanceof THREE.ShaderMaterial) mat.uniforms.uGlow.value = 1.0 + Math.sin(t * 1.6) * 0.04;
    if (halo.current) (halo.current.material as THREE.MeshBasicMaterial).opacity = 0.2 + Math.sin(t * 1.6) * 0.03;
  });
  return (
    <group>
      {!bare && <Pedestal />}
      <group ref={logo} position={[0, bare ? 0 : PEDESTAL_TOP + 0.08, 0]}>
        <mesh geometry={geo} material={mat} scale={height} />
        {/* Soft sky halo behind the logo: the glow, without pushing the gradient past white. */}
        {!bare && (
          <Billboard position={[0, height * 0.52, -LOGO_DEPTH * height]}>
            <mesh ref={halo}>
              <planeGeometry args={[height * 1.35, height * 1.35]} />
              <meshBasicMaterial map={haloTex} color="#84DBF7" transparent opacity={0.2} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
            </mesh>
          </Billboard>
        )}
      </group>
      {!bare && <pointLight position={[0, PEDESTAL_TOP + height * 0.55, 0.7]} color="#84DBF7" intensity={2.2} distance={4} decay={2} />}
    </group>
  );
}

export default Landmark;
