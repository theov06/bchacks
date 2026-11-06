/**
 * The Explore island (spec 0.4), modelled after docs/bchacks-design-reference-v3/assets/island.png:
 * a low-poly island sitting in the lake on a sand beach with a white foam line (no slab sides),
 * teal-green slopes rising to violet upper slopes and pink-white snow, a turquoise inner lake
 * with the trestle bridge over it, the pink tent, vineyard rows, a campfire, the quail, and the
 * glowing logo landmark on the mountain. Warm sunset light from the right.
 *
 * Positions are tuned so the Explore hotspot dots (content/about.ts) land on the same
 * features in 3D as in the picture. Units: +x right, +z toward the camera, ground at y = 0.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Landmark } from '../landmark/Landmark';
import { Quail } from '../quail/Quail';
import { rng } from '../layout';
import { sceneTime } from '../toon';

export type Tier = 'high' | 'medium';

/** Island ellipse (ground), and the beach and foam rings around it. */
export const ISLAND = { rx: 6.7, rz: 4.3 };
const BEACH = { rx: 7.15, rz: 4.75 };
const FOAM = { rx: 7.5, rz: 5.05 };

/** The inner lake (ellipse) and where things stand. */
export const LAKE = { x: -0.9, z: 0.7, rx: 3.1, rz: 1.5 };
export const PLACES = {
  bridgeWest: [-3.9, -0.3] as const,
  bridgeEast: [-0.1, -0.35] as const,
  tent: [2.1, 0.15] as const,
  quail: [-2.1, 1.6] as const,
  campfire: [-4.5, 1.5] as const,
  landmark: [0.9, -1.5] as const,
};

const COLORS = {
  sand: '#fbd9bf',
  foam: '#ffffff',
  grassLight: '#7fd6a0',
  grass: '#5ec08f',
  grassDark: '#3f9e78',
  teal: '#4fae8e',
  violet: '#9d82ea',
  lilac: '#cfb2f4',
  snow: '#f7e3fa',
  snowWhite: '#fff4fd',
  water: '#78d3f6',
  waterLight: '#c2eefc',
  pine: '#2f8a76',
  pineLight: '#3fa58a',
  trunk: '#6b4a5a',
  orchard: '#4fb07c',
  vine: '#5bbf6e',
  vineDark: '#3f9a58',
  tent: '#f29bb2',
  tentShade: '#e48aa3',
  bridge: '#9a98e6',
  bridgeDark: '#6f6cc8',
  log: '#8a5a3a',
  flame: '#ffd27a',
};

/* ------------------------------------------------------------------ terrain */

/** Smooth bump: height h at (cx, cz), radii rx/rz, cosine falloff. */
function bump(x: number, z: number, cx: number, cz: number, rx: number, rz: number, h: number) {
  const d = Math.hypot((x - cx) / rx, (z - cz) / rz);
  return d < 1 ? h * (0.5 + 0.5 * Math.cos(Math.PI * d)) : 0;
}

/** Rounded dome: height h at (cx, cz), radii rx/rz; a broad top with steep sides. */
function dome(x: number, z: number, cx: number, cz: number, rx: number, rz: number, h: number) {
  const d2 = ((x - cx) / rx) ** 2 + ((z - cz) / rz) ** 2;
  return d2 < 1 ? h * (1 - d2) : 0;
}

/** Terrain height: a broad two-topped mountain at the back, side slopes, a flat front and the lake basin. */
export function terrainHeight(x: number, z: number): number {
  let h = 0;
  h = Math.max(h, bump(x, z, 0.4, -3.0, 7.0, 3.8, 4.8)); // the mountain's body, a gentle front slope
  h = Math.max(h, dome(x, z, -1.9, -3.0, 3.6, 2.0, 5.4)); // left top
  h = Math.max(h, dome(x, z, 3.4, -2.9, 3.2, 2.1, 5.9)); // right top
  h = Math.max(h, dome(x, z, 5.6, -0.6, 1.6, 2.5, 3.2)); // right flank
  h = Math.max(h, bump(x, z, -4.8, -0.9, 2.4, 2.2, 2.6)); // left slope
  h = Math.max(h, bump(x, z, 4.6, 1.6, 2.6, 2.2, 1.3)); // right front slope (vineyard)
  h = Math.max(h, bump(x, z, -6.0, 0.2, 1.3, 1.5, 1.1)); // left terraces
  h = Math.max(h, bump(x, z, 1.8, 3.4, 3.2, 1.3, 0.3)); // front swell
  // The lake basin stays flat.
  const l = Math.hypot((x - LAKE.x) / (LAKE.rx + 0.5), (z - LAKE.z) / (LAKE.rz + 0.45));
  if (l < 1) h *= THREE.MathUtils.smoothstep(l, 0.75, 1);
  // Fall to the beach at the edge.
  const e = Math.hypot(x / ISLAND.rx, z / ISLAND.rz);
  return h * (1 - THREE.MathUtils.smoothstep(e, 0.86, 1));
}

/** Face colour by height (low-poly bands: grass, teal, violet, lilac, snow). */
function bandColor(h: number, r: number): THREE.Color {
  const c = new THREE.Color();
  if (h < 1.2) c.set(COLORS.grassLight);
  else if (h < 2.5) c.set(COLORS.grass);
  else if (h < 3.0) c.set(COLORS.teal);
  else if (h < 3.6) c.set(COLORS.violet);
  else if (h < 4.4) c.set(COLORS.lilac);
  else c.set(h < 5 ? COLORS.snow : COLORS.snowWhite);
  // A small step between neighbouring faces keeps the low-poly look without streaks.
  return c.multiplyScalar(0.975 + r * 0.04);
}

/** The ground: a polar grid over the island ellipse, displaced, faceted and coloured per face. */
function Ground() {
  const geo = useMemo(() => {
    const rand = rng(21);
    // A square grid over the island; points outside the ellipse are pulled onto its edge.
    const nx = 96;
    const nz = 62;
    const pos: number[] = [];
    const grid: THREE.Vector3[][] = [];
    for (let i = 0; i <= nz; i++) {
      const row: THREE.Vector3[] = [];
      for (let j = 0; j <= nx; j++) {
        let x = (j / nx - 0.5) * 2 * ISLAND.rx;
        let z = (i / nz - 0.5) * 2 * ISLAND.rz;
        const e = Math.hypot(x / ISLAND.rx, z / ISLAND.rz);
        const edge = e >= 0.999;
        if (edge) {
          x /= e;
          z /= e;
        } else {
          // Small jitter breaks the grid into low-poly facets.
          x += (rand() - 0.5) * 0.06;
          z += (rand() - 0.5) * 0.06;
        }
        const y = edge ? 0 : terrainHeight(x, z) + (rand() - 0.5) * 0.05;
        row.push(new THREE.Vector3(x, Math.max(0, y), z));
      }
      grid.push(row);
    }
    const col: number[] = [];
    const tri = (a: THREE.Vector3, b: THREE.Vector3, c: THREE.Vector3) => {
      // Skip the slivers squashed onto the edge.
      const area = Math.abs((b.x - a.x) * (c.z - a.z) - (c.x - a.x) * (b.z - a.z));
      if (area < 1e-5 && Math.max(a.y, b.y, c.y) < 0.01) return;
      pos.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z);
      const color = bandColor(Math.max(a.y, b.y, c.y) * 0.5 + ((a.y + b.y + c.y) / 3) * 0.5, rand());
      for (let k = 0; k < 3; k++) col.push(color.r, color.g, color.b);
    };
    for (let i = 0; i < nz; i++) {
      for (let j = 0; j < nx; j++) {
        const a = grid[i][j];
        const b = grid[i][j + 1];
        const c = grid[i + 1][j];
        const d = grid[i + 1][j + 1];
        if ((i + j) % 2) {
          tri(a, c, b);
          tri(b, c, d);
        } else {
          tri(a, c, d);
          tri(a, d, b);
        }
      }
    }
    // Smooth normals from the terrain's slope: soft shading, with the facets carried by the colours.
    const nrm: number[] = [];
    const e = 0.05;
    for (let k = 0; k < pos.length; k += 3) {
      const x = pos[k];
      const z = pos[k + 2];
      const dx = (terrainHeight(x + e, z) - terrainHeight(x - e, z)) / (2 * e);
      const dz = (terrainHeight(x, z + e) - terrainHeight(x, z - e)) / (2 * e);
      const n = new THREE.Vector3(-dx, 1, -dz).normalize();
      nrm.push(n.x, n.y, n.z);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      <meshLambertMaterial vertexColors />
    </mesh>
  );
}

/** Sand beach and the white foam line, flat rings around the ground. */
function Shore() {
  const ring = (rx: number, rz: number) => {
    const g = new THREE.CircleGeometry(1, 128);
    g.scale(rx, rz, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  };
  const [beach, foam] = useMemo(() => [ring(BEACH.rx, BEACH.rz), ring(FOAM.rx, FOAM.rz)], []);
  return (
    <>
      <mesh geometry={foam} position={[0, -0.04, 0]}>
        <meshBasicMaterial color={COLORS.foam} />
      </mesh>
      <mesh geometry={beach} position={[0, -0.02, 0]}>
        <meshLambertMaterial color={COLORS.sand} />
      </mesh>
    </>
  );
}

/** The inner lake: turquoise with a lighter rim and slow rings. */
function InnerLake() {
  const geo = useMemo(() => {
    const g = new THREE.CircleGeometry(1, 96);
    g.scale(LAKE.rx, LAKE.rz, 1);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uWater: { value: new THREE.Color(COLORS.water) },
          uLight: { value: new THREE.Color(COLORS.waterLight) },
          uR: { value: new THREE.Vector2(LAKE.rx, LAKE.rz) },
          uC: { value: new THREE.Vector2(LAKE.x, LAKE.z) },
        },
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          void main() { vec4 w = modelMatrix * vec4(position, 1.0); vXZ = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec3 uWater; uniform vec3 uLight; uniform vec2 uR; uniform vec2 uC;
          varying vec2 vXZ;
          void main() {
            vec2 d = (vXZ - uC) / uR;
            float r = length(d);
            vec3 col = mix(uWater, uLight, smoothstep(0.82, 1.0, r) * 0.8);
            // Slow rings spreading from the middle.
            float ring = abs(fract(r * 3.0 - uTime * 0.08) - 0.5);
            col = mix(col, uLight, (1.0 - smoothstep(0.0, 0.03, ring)) * 0.45 * (1.0 - smoothstep(0.7, 0.95, r)));
            gl_FragColor = vec4(col, 1.0);
          }
        `,
      }),
    [],
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = sceneTime(clock.elapsedTime);
  });
  return <mesh geometry={geo} material={mat} position={[LAKE.x, 0.03, LAKE.z]} />;
}

/* ------------------------------------------------------------------ vegetation */

/** Pines on the green slopes, instanced (trunk + two cones). */
function Pines() {
  const pts = useMemo(() => {
    const rand = rng(9);
    const out: [number, number, number][] = [];
    let guard = 0;
    while (out.length < 30 && guard++ < 6000) {
      const x = (rand() * 2 - 1) * ISLAND.rx * 0.92;
      const z = (rand() * 2 - 1) * ISLAND.rz * 0.92;
      if (Math.hypot(x / ISLAND.rx, z / ISLAND.rz) > 0.86) continue;
      const h = terrainHeight(x, z);
      if (h < 0.6 || h > 2.5) continue;
      if (Math.hypot((x - PLACES.landmark[0]) / 1.6, (z - PLACES.landmark[1]) / 1.2) < 1) continue;
      if (x > 1.2 && z > 0.6) continue; // vineyard slope
      if (x > 3.0 && z > -1.2 && z < 0.6) continue; // orchard
      if (x < -5.0 && z > -0.8) continue; // left terraces
      if (Math.hypot(x - PLACES.campfire[0], z - PLACES.campfire[1]) < 1.1) continue;
      if (out.some(([ox, , oz]) => (x - ox) ** 2 + (z - oz) ** 2 < 0.6)) continue;
      out.push([x, h, z]);
    }
    return out;
  }, []);
  const trunk = useRef<THREE.InstancedMesh>(null);
  const low = useRef<THREE.InstancedMesh>(null);
  const high = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const s3 = new THREE.Vector3();
    pts.forEach(([x, y, z], i) => {
      const s = 0.75 + ((i * 37) % 10) / 28;
      m.compose(v.set(x, y + 0.1 * s, z), q, s3.set(s, s, s));
      trunk.current!.setMatrixAt(i, m);
      m.compose(v.set(x, y + 0.45 * s, z), q, s3.set(s, s, s));
      low.current!.setMatrixAt(i, m);
      m.compose(v.set(x, y + 0.82 * s, z), q, s3.set(s * 0.72, s * 0.8, s * 0.72));
      high.current!.setMatrixAt(i, m);
    });
    [trunk, low, high].forEach((r) => (r.current!.instanceMatrix.needsUpdate = true));
  }, [pts]);
  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, undefined, pts.length]}>
        <cylinderGeometry args={[0.05, 0.06, 0.22, 6]} />
        <meshLambertMaterial color={COLORS.trunk} />
      </instancedMesh>
      <instancedMesh ref={low} args={[undefined, undefined, pts.length]}>
        <coneGeometry args={[0.32, 0.6, 7]} />
        <meshLambertMaterial color={COLORS.pine} flatShading />
      </instancedMesh>
      <instancedMesh ref={high} args={[undefined, undefined, pts.length]}>
        <coneGeometry args={[0.29, 0.56, 7]} />
        <meshLambertMaterial color={COLORS.pineLight} flatShading />
      </instancedMesh>
    </>
  );
}

/** Round orchard trees on the right slope. */
function Orchard() {
  const trees = useMemo(() => {
    const rand = rng(14);
    const out: [number, number, number][] = [];
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 3; j++) {
        const x = 3.3 + i * 0.6 + (rand() - 0.5) * 0.2;
        const z = -0.9 + j * 0.5 + (rand() - 0.5) * 0.2;
        out.push([x, terrainHeight(x, z), z]);
      }
    return out;
  }, []);
  return (
    <group>
      {trees.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.14, 0]}>
            <cylinderGeometry args={[0.045, 0.055, 0.28, 6]} />
            <meshLambertMaterial color={COLORS.trunk} />
          </mesh>
          <mesh position={[0, 0.44, 0]}>
            <icosahedronGeometry args={[0.27, 0]} />
            <meshLambertMaterial color={COLORS.orchard} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Vineyard rows: lines of small square vines following the ground. */
function Vineyard({ x0, z0, rows, per, dx, dz, seed }: { x0: number; z0: number; rows: number; per: number; dx: number; dz: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const items = useMemo(() => {
    const rand = rng(seed);
    const out: { p: THREE.Vector3; dark: boolean }[] = [];
    for (let r = 0; r < rows; r++)
      for (let i = 0; i < per; i++) {
        const x = x0 + i * dx + (r % 2) * dx * 0.5;
        const z = z0 + r * dz;
        if (Math.hypot(x / ISLAND.rx, z / ISLAND.rz) > 0.95) continue;
        out.push({ p: new THREE.Vector3(x, terrainHeight(x, z), z), dark: rand() < 0.4 });
      }
    return out;
  }, [x0, z0, rows, per, dx, dz, seed]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    items.forEach(({ p, dark }, i) => {
      m.makeTranslation(p.x, p.y + 0.09, p.z);
      ref.current!.setMatrixAt(i, m);
      ref.current!.setColorAt(i, c.set(dark ? COLORS.vineDark : COLORS.vine));
    });
    ref.current!.instanceMatrix.needsUpdate = true;
    if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
  }, [items]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, items.length]}>
      <boxGeometry args={[0.2, 0.18, 0.16]} />
      <meshLambertMaterial />
    </instancedMesh>
  );
}

/* ------------------------------------------------------------------ places */

/** The Myra Canyon trestle over the lake, with its tower. */
function Trestle() {
  const [wx, wz] = PLACES.bridgeWest;
  const [ex, ez] = PLACES.bridgeEast;
  const len = Math.hypot(ex - wx, ez - wz);
  const angle = -Math.atan2(ez - wz, ex - wx);
  const legs = 7;
  return (
    <group position={[(wx + ex) / 2, 0, (wz + ez) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[len, 0.16, 0.46]} />
        <meshLambertMaterial color={COLORS.bridge} />
      </mesh>
      {[-0.22, 0.22].map((z) => (
        <mesh key={z} position={[0, 0.72, z]}>
          <boxGeometry args={[len, 0.05, 0.04]} />
          <meshLambertMaterial color="#e8e6ff" />
        </mesh>
      ))}
      {Array.from({ length: legs }, (_, i) => (
        <mesh key={i} position={[(i / (legs - 1) - 0.5) * len * 0.94, 0.24, 0]}>
          <boxGeometry args={[0.1, 0.48, 0.36]} />
          <meshLambertMaterial color={COLORS.bridgeDark} />
        </mesh>
      ))}
      {/* The tower near the west end. */}
      {[-0.2, 0.2].map((z) => (
        <mesh key={z} position={[-len * 0.18, 0.95, z]}>
          <boxGeometry args={[0.12, 1.0, 0.1]} />
          <meshLambertMaterial color={COLORS.bridge} />
        </mesh>
      ))}
      <mesh position={[-len * 0.18, 1.46, 0]}>
        <boxGeometry args={[0.18, 0.12, 0.56]} />
        <meshLambertMaterial color={COLORS.bridge} />
      </mesh>
    </group>
  );
}

/** The pink hack tent: a four-sided pyramid. */
function Tent() {
  const [tx, tz] = PLACES.tent;
  return (
    <group position={[tx, terrainHeight(tx, tz), tz]} rotation={[0, Math.PI / 4 + 0.25, 0]}>
      <mesh position={[0, 0.7, 0]}>
        <coneGeometry args={[1.3, 1.4, 4]} />
        <meshLambertMaterial color={COLORS.tent} flatShading />
      </mesh>
    </group>
  );
}

function Campfire({ still }: { still: boolean }) {
  const [cx, cz] = PLACES.campfire;
  const flame = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (still || !flame.current) return;
    const t = sceneTime(clock.elapsedTime);
    flame.current.scale.y = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
  });
  return (
    <group position={[cx, terrainHeight(cx, cz), cz]}>
      <mesh ref={flame} position={[0, 0.22, 0]}>
        <coneGeometry args={[0.2, 0.46, 6]} />
        <meshBasicMaterial color={COLORS.flame} toneMapped={false} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.3, 0.06, Math.sin(a) * 0.3]} rotation={[0, -a, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.34, 6]} />
            <meshLambertMaterial color={COLORS.log} />
          </mesh>
        );
      })}
    </group>
  );
}

/** The glowing logo on its ledge: the brightest thing on the island, with a soft halo behind it. */
function LogoLandmark({ still }: { still: boolean }) {
  const [lx, lz] = PLACES.landmark;
  const height = 2.4;
  const halo = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,0.9)');
    g.addColorStop(0.3, 'rgba(255,255,255,0.35)');
    g.addColorStop(0.65, 'rgba(255,255,255,0.08)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  const base = terrainHeight(lx, lz);
  return (
    <group position={[lx, base, lz]}>
      {/* A pale ledge under the logo, cut into the slope. */}
      <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI / 6, 0]}>
        <cylinderGeometry args={[0.9, 1.0, 0.3, 6]} />
        <meshLambertMaterial color="#bdb6f2" flatShading />
      </mesh>
      <group position={[0, 0.1, 0]} scale={height / 1.6}>
        <Landmark height={1.6} animate={!still} glow={1.9} bare />
      </group>
      <mesh position={[0, height * 0.6, -0.6]}>
        <planeGeometry args={[height * 2.4, height * 2.4]} />
        <meshBasicMaterial map={halo} color="#b5ecff" transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </mesh>
    </group>
  );
}

function IslandQuail({ tier, still, wave }: { tier: Tier; still: boolean; wave: boolean }) {
  const [qx, qz] = PLACES.quail;
  return (
    <group position={[qx, 0, qz]} rotation={[0, 0.2, 0]} scale={1.5 / 1.25}>
      <Quail laptop={!wave} wave={wave} outlines={tier === 'high'} still={still} />
    </group>
  );
}

/* ------------------------------------------------------------------ the island */

export interface ValleyIslandProps {
  tier: Tier;
  still: boolean;
  wave: boolean;
}

export function ValleyIsland({ tier, still, wave }: ValleyIslandProps) {
  return (
    <group>
      <Shore />
      <Ground />
      <InnerLake />
      <Pines />
      <Orchard />
      <Vineyard x0={1.3} z0={1.7} rows={6} per={11} dx={0.42} dz={0.36} seed={3} />
      <Vineyard x0={-6.3} z0={-0.6} rows={5} per={4} dx={0.42} dz={0.36} seed={4} />
      <Trestle />
      <Tent />
      <Campfire still={still} />
      <LogoLandmark still={still} />
      <IslandQuail tier={tier} still={still} wave={wave} />
    </group>
  );
}

export default ValleyIsland;
