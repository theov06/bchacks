/**
 * Tiny Okanagan: the hero island at final quality (art direction §2–3).
 * Layout comes from ../layout.ts (the approved blockout). Toon-shaded night palette,
 * a glowing sky rim on the slab, a stylised lake with the blueprint grid under the
 * water, slope-following vine rows, the 3D landmark and the quail.
 *
 * Assembly (first visit): every part has a window in a 0..1 timeline and rises out
 * of the blueprint; `progress` is driven by the parent. At 1 everything is in place.
 */
import { useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  FLOAT_HEIGHT,
  HILLS,
  ISLAND_OUTLINE,
  LAKE_CENTRE,
  LAKE_OUTLINE,
  SLAB_THICKNESS,
  SPOTS,
  groundHeight,
  pinePositions,
  rng,
  type Vec2,
} from '../layout';
import { Landmark } from '../landmark/Landmark';
import { Quail } from '../quail/Quail';
import { Outline } from '../Outline';
import { sceneTime, toonGradient } from '../toon';

export type Tier = 'high' | 'medium';

export const PALETTE = {
  ground: '#6b82cc',
  groundRim: '#7d93d8',
  slabSide: '#2b3c88',
  hill: '#5b72bf',
  pine: '#3f948a',
  pineDark: '#2f7a72',
  trunk: '#3b3150',
  orchard: '#4f9474',
  vine: '#5fa774', // --vine, desaturated
  deck: '#9aa6d6',
  wood: '#5d4d66',
  tent: '#7f9fd0',
  roofs: ['#4f6fae', '#3d5fae', '#5d82b8'],
  lantern: '#FFD27A',
  sky: '#84DBF7',
  ice: '#B5ECFF',
  electric: '#3B82F6',
  navy: '#0F1539',
};

/** Landmark logo height on the island (≈ 1/6 of the island width, as in the concept). */
export const LANDMARK_HEIGHT = 2.2;
/**
 * Quail world height. 1.6× the blockout stand-in (1.17) measured only ~25 px tall in the 390px
 * hero, so it's ~2.4× (1.75) for ~38 px: toy-diorama exaggeration in service of phone readability.
 */
export const QUAIL_HEIGHT = 1.75;

/* ------------------------------------------------------------------ helpers */

function smoothPoints(points: Vec2[], segments: number) {
  const curve = new THREE.CatmullRomCurve3(points.map(([x, z]) => new THREE.Vector3(x, 0, z)), true, 'centripetal');
  return curve.getPoints(segments);
}

/** Face-up flat shape in XZ (normal +y). */
function flatShape(points: Vec2[], segments: number) {
  const pts = smoothPoints(points, segments).map((p) => new THREE.Vector2(p.x, -p.z));
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts));
  g.rotateX(-Math.PI / 2);
  return g;
}

const ease = {
  outCubic: (x: number) => 1 - Math.pow(1 - x, 3),
  outBack: (x: number) => 1 + 2.4 * Math.pow(x - 1, 3) + 1.4 * Math.pow(x - 1, 2),
};

/**
 * One part of the assembly. `win` is its window on the 0..1 timeline; it rises from the
 * blueprint (y offset) and grows from 0 (scale), so the island builds itself up.
 */
function Part({ progress, win, rise = 1.2, pop = false, children }: { progress: { current: number }; win: [number, number]; rise?: number; pop?: boolean; children: ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const k = Math.min(1, Math.max(0, (progress.current - win[0]) / (win[1] - win[0])));
    const e = pop ? ease.outBack(k) : ease.outCubic(k);
    g.visible = k > 0;
    g.position.y = -(1 - ease.outCubic(k)) * rise;
    const s = pop ? Math.max(0.0001, e) : 0.85 + 0.15 * e;
    g.scale.set(pop ? s : 1, s, pop ? s : 1);
  });
  return <group ref={ref}>{children}</group>;
}

function useToon(color: string) {
  return useMemo(() => new THREE.MeshToonMaterial({ color, gradientMap: toonGradient() }), [color]);
}

/* ------------------------------------------------------------------ terrain */

function Slab() {
  const geo = useMemo(() => {
    const pts = smoothPoints(ISLAND_OUTLINE, 180).map((p) => new THREE.Vector2(p.x, p.z));
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(pts), {
      depth: SLAB_THICKNESS,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 3,
      curveSegments: 4,
    });
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const top = useToon(PALETTE.ground);
  const side = useToon(PALETTE.slabSide);
  return <mesh geometry={geo} position={[0, -0.12, 0]} material={[top, side]} />;
}

/** Glowing sky rim along the slab's top edge, and a dimmer electric line along its base (the concept's lit edges). */
function Rims() {
  const [topGeo, baseGeo] = useMemo(() => {
    const pts = smoothPoints(ISLAND_OUTLINE, 220).map((p) => p.clone().multiplyScalar(1.012));
    const mk = (y: number, r: number) => {
      const c = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(p.x, y, p.z)), true);
      return new THREE.TubeGeometry(c, 360, r, 5, true);
    };
    return [mk(-0.02, 0.028), mk(-SLAB_THICKNESS - 0.2, 0.02)];
  }, []);
  return (
    <>
      <mesh geometry={topGeo}>
        <meshBasicMaterial color={new THREE.Color(PALETTE.sky).multiplyScalar(1.25)} toneMapped={false} />
      </mesh>
      <mesh geometry={baseGeo}>
        <meshBasicMaterial color={new THREE.Color(PALETTE.electric).multiplyScalar(1.1)} toneMapped={false} />
      </mesh>
    </>
  );
}

function Hills() {
  const mat = useToon(PALETTE.hill);
  return (
    <>
      {HILLS.map(({ at, r }, i) => (
        <mesh key={i} position={[at[0], 0, at[1]]} scale={r} material={mat}>
          <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        </mesh>
      ))}
    </>
  );
}

/** Stylised night water: depth gradient, slow wave bands, the blueprint grid under the surface and the landmark's reflection. */
function Lake() {
  const geo = useMemo(() => flatShape(LAKE_OUTLINE, 120), []);
  const shore = useMemo(() => flatShape(LAKE_OUTLINE.map(([x, z]) => [LAKE_CENTRE[0] + (x - LAKE_CENTRE[0]) * 1.06, LAKE_CENTRE[1] + (z - LAKE_CENTRE[1]) * 1.08] as Vec2), 120), []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: {
          uTime: { value: 0 },
          uCentre: { value: new THREE.Vector2(...LAKE_CENTRE) },
          uDeep: { value: new THREE.Color('#22398a') },
          uMid: { value: new THREE.Color('#3f6fd6') },
          uLight: { value: new THREE.Color(PALETTE.sky) },
          uGlowX: { value: SPOTS.landmark[0] },
        },
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          void main() {
            vec4 w = modelMatrix * vec4(position, 1.0);
            vXZ = w.xz;
            gl_Position = projectionMatrix * viewMatrix * w;
          }
        `,
        fragmentShader: /* glsl */ `
          uniform float uTime; uniform vec2 uCentre;
          uniform vec3 uDeep; uniform vec3 uMid; uniform vec3 uLight; uniform float uGlowX;
          varying vec2 vXZ;
          void main() {
            vec2 d = (vXZ - uCentre) / vec2(4.2, 2.2);
            float r = clamp(length(d), 0.0, 1.0);
            vec3 col = mix(uMid, uDeep, smoothstep(0.0, 1.0, r));
            // Blueprint grid under the water
            vec2 g = abs(fract(vXZ * 1.0) - 0.5);
            float grid = 1.0 - smoothstep(0.0, 0.035, min(g.x, g.y));
            col += uLight * grid * 0.07;
            // Slow wave bands
            float w = sin(vXZ.x * 3.1 + uTime * 0.9) * sin(vXZ.y * 2.3 - uTime * 0.6);
            col += uLight * smoothstep(0.82, 1.0, w) * 0.16;
            // Reflection streak of the landmark's light
            float streak = exp(-pow((vXZ.x - uGlowX) * 2.2, 2.0)) * smoothstep(1.4, -1.6, vXZ.y);
            col += uLight * streak * (0.22 + 0.05 * sin(uTime * 2.0 + vXZ.y * 6.0));
            // Shore edge
            col += uLight * smoothstep(0.86, 1.0, r) * 0.1;
            gl_FragColor = vec4(col, 0.96);
          }
        `,
      }),
    [],
  );
  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = sceneTime(clock.elapsedTime);
  });
  const sand = useToon('#7d8dc8');
  return (
    <>
      <mesh geometry={shore} position={[0, 0.012, 0]} material={sand} />
      <mesh geometry={geo} position={[0, 0.03, 0]} material={mat} />
    </>
  );
}

/* ------------------------------------------------------------------ vegetation */

/** Pines: trunk + two stacked cones, instanced. */
function Pines() {
  const pts = useMemo(() => pinePositions(), []);
  const trunk = useRef<THREE.InstancedMesh>(null);
  const low = useRef<THREE.InstancedMesh>(null);
  const high = useRef<THREE.InstancedMesh>(null);
  const mTrunk = useToon(PALETTE.trunk);
  const mLow = useToon(PALETTE.pineDark);
  const mHigh = useToon(PALETTE.pine);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    const v = new THREE.Vector3();
    const sc = new THREE.Vector3();
    pts.forEach(([x, y, z], i) => {
      const s = 0.72 + ((i * 37) % 10) / 24;
      m.compose(v.set(x, y + 0.08 * s, z), q, sc.set(s, s, s));
      trunk.current!.setMatrixAt(i, m);
      m.compose(v.set(x, y + 0.36 * s, z), q, sc.set(s, s, s));
      low.current!.setMatrixAt(i, m);
      m.compose(v.set(x, y + 0.66 * s, z), q, sc.set(s * 0.72, s * 0.8, s * 0.72));
      high.current!.setMatrixAt(i, m);
    });
    [trunk, low, high].forEach((r) => (r.current!.instanceMatrix.needsUpdate = true));
  }, [pts]);
  return (
    <>
      <instancedMesh ref={trunk} args={[undefined, mTrunk, pts.length]}>
        <cylinderGeometry args={[0.04, 0.05, 0.18, 6]} />
      </instancedMesh>
      <instancedMesh ref={low} args={[undefined, mLow, pts.length]}>
        <coneGeometry args={[0.27, 0.5, 7]} />
      </instancedMesh>
      <instancedMesh ref={high} args={[undefined, mHigh, pts.length]}>
        <coneGeometry args={[0.24, 0.46, 7]} />
      </instancedMesh>
    </>
  );
}

/**
 * Vine rows that follow the slope: each row is a line of small rounded vine blocks,
 * each sitting on the ground at its own point (no long boxes at one height, so no "stairs").
 */
function Vineyard({ at, rows, length, angle, seed }: { at: Vec2; rows: number; length: number; angle: number; seed: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  const mat = useToon(PALETTE.vine);
  const items = useMemo(() => {
    const rand = rng(seed);
    const out: { p: THREE.Vector3; s: number }[] = [];
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const per = Math.round(length / 0.16);
    for (let r = 0; r < rows; r++) {
      const off = (r - (rows - 1) / 2) * 0.3;
      for (let i = 0; i < per; i++) {
        const u = (i / (per - 1) - 0.5) * length;
        const x = at[0] + u * cos - off * sin;
        const z = at[1] + u * sin + off * cos;
        out.push({ p: new THREE.Vector3(x, groundHeight(x, z), z), s: 0.85 + rand() * 0.3 });
      }
    }
    return out;
  }, [at, rows, length, angle, seed]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), -angle);
    items.forEach(({ p, s }, i) => {
      m.compose(new THREE.Vector3(p.x, p.y + 0.07 * s, p.z), q, new THREE.Vector3(s, s, s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [items, angle]);
  return (
    <instancedMesh ref={ref} args={[undefined, mat, items.length]}>
      <capsuleGeometry args={[0.065, 0.06, 3, 6]} />
    </instancedMesh>
  );
}

function Orchard() {
  const [ox, oz] = SPOTS.orchard;
  const crown = useToon(PALETTE.orchard);
  const trunk = useToon(PALETTE.trunk);
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => {
        const x = ox + (i % 3) * 0.55 - 0.55;
        const z = oz + Math.floor(i / 3) * 0.55 - 0.55;
        return (
          <group key={i} position={[x, groundHeight(x, z), z]}>
            <mesh position={[0, 0.1, 0]} material={trunk}>
              <cylinderGeometry args={[0.035, 0.045, 0.2, 6]} />
            </mesh>
            <mesh position={[0, 0.32, 0]} material={crown}>
              <sphereGeometry args={[0.2, 12, 9]} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/* ------------------------------------------------------------------ structures */

function Bridge({ tier }: { tier: Tier }) {
  const [wx, wz] = SPOTS.bridgeWest;
  const [ex, ez] = SPOTS.bridgeEast;
  const len = Math.hypot(ex - wx, ez - wz);
  const angle = -Math.atan2(ez - wz, ex - wx);
  const deck = useToon(PALETTE.deck);
  const dark = useToon(PALETTE.slabSide);
  const lampMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.lantern).multiplyScalar(1.3), toneMapped: false }), []);
  const trailMat = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.sky).multiplyScalar(1.15), toneMapped: false }), []);
  const lamps = 8;
  return (
    <group position={[(wx + ex) / 2, 0, (wz + ez) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.17, 0]} material={deck}>
        <boxGeometry args={[len, 0.1, 0.36]} />
        {tier === 'high' && <Outline px={1.5} />}
      </mesh>
      {/* Light trails along both edges */}
      {[-0.19, 0.19].map((z) => (
        <mesh key={z} position={[0, 0.23, z]} material={trailMat}>
          <boxGeometry args={[len, 0.018, 0.018]} />
        </mesh>
      ))}
      {/* Lift span */}
      {[-0.18, 0.18].map((dz) => (
        <mesh key={dz} position={[-len * 0.18, 0.62, dz]} material={deck}>
          <boxGeometry args={[0.1, 0.9, 0.08]} />
        </mesh>
      ))}
      <mesh position={[-len * 0.18, 1.07, 0]} material={deck}>
        <boxGeometry args={[0.16, 0.08, 0.5]} />
      </mesh>
      {/* Lamp posts */}
      {Array.from({ length: lamps }, (_, i) => {
        const x = (i / (lamps - 1) - 0.5) * len * 0.92;
        return (
          <group key={i} position={[x, 0.22, i % 2 ? 0.19 : -0.19]}>
            <mesh position={[0, 0.1, 0]} material={dark}>
              <cylinderGeometry args={[0.012, 0.012, 0.2, 4]} />
            </mesh>
            <mesh position={[0, 0.21, 0]} material={lampMat}>
              <sphereGeometry args={[0.035, 8, 6]} />
            </mesh>
          </group>
        );
      })}
      {/* Pontoons */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[(i - 3) * (len / 7), 0.08, 0]} material={dark}>
          <boxGeometry args={[0.12, 0.08, 0.42]} />
        </mesh>
      ))}
    </group>
  );
}

/** The hack tent: a pale dome glowing warm from inside, string lights, and the big screen showing the logo. */
function HackTent({ tier }: { tier: Tier }) {
  const [tx, tz] = SPOTS.tent;
  const [sx, sz] = SPOTS.screen;
  const tent = useMemo(
    () => new THREE.MeshToonMaterial({ color: PALETTE.tent, gradientMap: toonGradient(), emissive: new THREE.Color(PALETTE.lantern), emissiveIntensity: 0.05 }),
    [],
  );
  const dark = useToon(PALETTE.slabSide);
  const bulbs = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.lantern).multiplyScalar(1.4), toneMapped: false }), []);
  const screenTex = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 256;
    c.height = 144;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = '#0f1539';
    ctx.fillRect(0, 0, 256, 144);
    ctx.strokeStyle = '#262c55';
    for (let x = 0; x <= 256; x += 16) ctx.strokeRect(x, -1, 0, 146);
    for (let y = 0; y <= 144; y += 16) ctx.strokeRect(-1, y, 258, 0);
    const g = ctx.createLinearGradient(0, 30, 0, 114);
    g.addColorStop(0, '#B5ECFF');
    g.addColorStop(0.45, '#84DBF7');
    g.addColorStop(1, '#3B82F6');
    ctx.fillStyle = g;
    ctx.font = '800 34px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('BCHacks', 128, 84);
    ctx.font = '500 13px ui-monospace, Consolas, monospace';
    ctx.fillStyle = '#84DBF7';
    ctx.fillText('NOV 27–29 · KELOWNA', 128, 108);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <>
      <mesh position={[tx, 0, tz]} material={tent}>
        <sphereGeometry args={[0.95, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        {tier === 'high' && <Outline px={1.5} />}
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2;
        return (
          <mesh key={i} position={[tx + Math.cos(a) * 1.0, 0.07 + (i % 2) * 0.04, tz + Math.sin(a) * 1.0]} material={bulbs}>
            <sphereGeometry args={[0.03, 6, 5]} />
          </mesh>
        );
      })}
      <pointLight position={[tx, 0.5, tz + 0.2]} color={PALETTE.lantern} intensity={1.6} distance={2.6} decay={2} />
      <group position={[sx, 0, sz]} rotation={[0, -0.35, 0]}>
        <mesh position={[0, 0.88, 0]}>
          <planeGeometry args={[1.25, 0.7]} />
          <meshBasicMaterial map={screenTex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.88, -0.02]} material={dark}>
          <boxGeometry args={[1.32, 0.77, 0.03]} />
        </mesh>
        {[-0.55, 0.55].map((x) => (
          <mesh key={x} position={[x, 0.27, -0.02]} material={dark}>
            <boxGeometry args={[0.05, 0.54, 0.05]} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Waterfront() {
  const [dx, dz] = SPOTS.dock;
  const [hx, hz] = SPOTS.houseboat;
  const wood = useToon(PALETTE.wood);
  const hull = useToon('#c7cfe6');
  const cabin = useToon('#8fa0cf');
  const board = useToon(PALETTE.sky);
  const window_ = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.lantern).multiplyScalar(1.2), toneMapped: false }), []);
  return (
    <>
      <mesh position={[dx, 0.08, dz - 0.55]} material={wood}>
        <boxGeometry args={[0.36, 0.06, 1.3]} />
      </mesh>
      <group position={[hx, 0, hz]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.1, 0]} material={hull}>
          <boxGeometry args={[1.0, 0.16, 0.45]} />
        </mesh>
        <mesh position={[-0.1, 0.3, 0]} material={cabin}>
          <boxGeometry args={[0.55, 0.26, 0.36]} />
        </mesh>
        {[-0.25, -0.05, 0.12].map((x) => (
          <mesh key={x} position={[x, 0.31, 0.185]} material={window_}>
            <planeGeometry args={[0.1, 0.08]} />
          </mesh>
        ))}
      </group>
      <mesh position={[dx + 0.55, 0.05, dz - 1.0]} rotation={[Math.PI / 2, 0, 0.6]} material={board}>
        <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
      </mesh>
    </>
  );
}

function Market() {
  const [mx, mz] = SPOTS.market;
  const stall = useToon('#59659c');
  const roofs = useMemo(() => PALETTE.roofs.map((c) => new THREE.MeshToonMaterial({ color: c, gradientMap: toonGradient() })), []);
  const bulbs = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.lantern).multiplyScalar(1.4), toneMapped: false }), []);
  return (
    <group position={[mx, 0, mz]}>
      {[-0.75, 0, 0.75].map((x, i) => (
        <group key={x} position={[x, 0, i === 1 ? -0.15 : 0.05]}>
          <mesh position={[0, 0.2, 0]} material={stall}>
            <boxGeometry args={[0.55, 0.4, 0.4]} />
          </mesh>
          <mesh position={[0, 0.52, 0]} rotation={[0, Math.PI / 4, 0]} material={roofs[i]}>
            <coneGeometry args={[0.46, 0.26, 4]} />
          </mesh>
          {[-0.18, 0, 0.18].map((bx) => (
            <mesh key={bx} position={[bx, 0.4, 0.22]} material={bulbs}>
              <sphereGeometry args={[0.025, 6, 5]} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

function Campfire({ still }: { still: boolean }) {
  const [cx, cz] = SPOTS.campfire;
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  const log = useToon(PALETTE.wood);
  const fire = useMemo(() => new THREE.MeshBasicMaterial({ color: new THREE.Color(PALETTE.lantern).multiplyScalar(1.5), toneMapped: false }), []);
  useFrame(({ clock }) => {
    if (still) return;
    const t = sceneTime(clock.elapsedTime);
    const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
    flame.current?.scale.set(1, f, 1);
    if (light.current) light.current.intensity = 1.4 * f;
  });
  return (
    <group position={[cx, 0, cz]}>
      <mesh ref={flame} position={[0, 0.16, 0]} material={fire}>
        <coneGeometry args={[0.13, 0.32, 6]} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.5, 0.06, Math.sin(a) * 0.5]} rotation={[0, -a, Math.PI / 2]} material={log}>
            <cylinderGeometry args={[0.06, 0.06, 0.36, 8]} />
          </mesh>
        );
      })}
      <pointLight ref={light} position={[0, 0.35, 0]} color={PALETTE.lantern} intensity={1.4} distance={2.4} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ sky + blueprint */

/** Blueprint under the island: a fading perspective grid patch and two slowly turning construction rings with ticks. */
function Blueprint({ still }: { still: boolean }) {
  const y = -(SLAB_THICKNESS + FLOAT_HEIGHT);
  const rings = useRef<THREE.Group>(null);
  const gridMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: { uColor: { value: new THREE.Color('#b5ecff') } },
        vertexShader: /* glsl */ `
          varying vec2 vXZ;
          void main() { vec4 w = modelMatrix * vec4(position, 1.0); vXZ = w.xz; gl_Position = projectionMatrix * viewMatrix * w; }
        `,
        fragmentShader: /* glsl */ `
          uniform vec3 uColor; varying vec2 vXZ;
          void main() {
            vec2 g = abs(fract(vXZ) - 0.5);
            float line = 1.0 - smoothstep(0.0, 0.02, 0.5 - max(g.x, g.y));
            float fade = 1.0 - smoothstep(4.5, 10.5, length(vXZ));
            gl_FragColor = vec4(uColor, line * fade * 0.16);
          }
        `,
      }),
    [],
  );
  useFrame(({ clock }) => {
    if (!still && rings.current) rings.current.rotation.y = sceneTime(clock.elapsedTime) * 0.03;
  });
  return (
    <group position={[0, y, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} material={gridMat}>
        <planeGeometry args={[34, 34]} />
      </mesh>
      {/* Soft contact shadow of the floating slab */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[7.4, 64]} />
        <meshBasicMaterial color="#0b1440" transparent opacity={0.2} depthWrite={false} />
      </mesh>
      <group ref={rings}>
        {[9.4, 11.6].map((r, i) => (
          <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[r, r + 0.035, 160]} />
            <meshBasicMaterial color={PALETTE.sky} transparent opacity={i ? 0.22 : 0.35} depthWrite={false} />
          </mesh>
        ))}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const long = i % 6 === 0;
          return (
            <mesh key={i} position={[Math.cos(a) * 11.6, 0.02, Math.sin(a) * 11.6]} rotation={[-Math.PI / 2, 0, -a]}>
              <planeGeometry args={[long ? 0.7 : 0.35, 0.04]} />
              <meshBasicMaterial color={PALETTE.sky} transparent opacity={0.4} depthWrite={false} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

/** Stars in a dome behind the island, plus a few fireflies over the vineyard and campfire. */
function Sky({ still }: { still: boolean }) {
  const stars = useMemo(() => {
    const rand = rng(11);
    const n = 160;
    const pos = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const a = rand() * Math.PI * 2;
      const el = 0.12 + rand() * 0.9;
      const r = 26 + rand() * 6;
      pos.set([Math.cos(a) * Math.cos(el) * r, 2 + Math.sin(el) * r * 0.55, -Math.abs(Math.sin(a) * Math.cos(el) * r) - 4], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  }, []);
  const flies = useRef<THREE.Points>(null);
  const base = useMemo(() => {
    const rand = rng(5);
    const spots = [SPOTS.vineyardWest, SPOTS.campfire, SPOTS.vineyardSouth];
    return Array.from({ length: 24 }, (_, i) => {
      const [x, z] = spots[i % spots.length];
      return new THREE.Vector3(x + (rand() - 0.5) * 2, 0.4 + rand() * 0.8, z + (rand() - 0.5) * 1.6);
    });
  }, []);
  const flyGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(base.flatMap((v) => [v.x, v.y, v.z])), 3));
    return g;
  }, [base]);
  useFrame(({ clock }) => {
    if (still || !flies.current) return;
    const t = sceneTime(clock.elapsedTime);
    const attr = flies.current.geometry.attributes.position as THREE.BufferAttribute;
    base.forEach((v, i) => attr.setXYZ(i, v.x + Math.sin(t * 0.5 + i) * 0.25, v.y + Math.sin(t * 0.8 + i * 1.7) * 0.15, v.z + Math.cos(t * 0.4 + i) * 0.25));
    attr.needsUpdate = true;
  });
  return (
    <>
      <points geometry={stars}>
        <pointsMaterial color={PALETTE.ice} size={0.12} sizeAttenuation transparent opacity={0.75} depthWrite={false} />
      </points>
      <points ref={flies} geometry={flyGeo}>
        <pointsMaterial color={new THREE.Color(PALETTE.lantern).multiplyScalar(1.4)} size={0.09} sizeAttenuation transparent opacity={0.9} depthWrite={false} toneMapped={false} />
      </points>
    </>
  );
}

/* ------------------------------------------------------------------ hero characters */

function LandmarkOnKnoll({ still }: { still: boolean }) {
  const [lx, lz] = SPOTS.landmark;
  const s = LANDMARK_HEIGHT / 1.6; // Landmark's pedestal is proportioned for a 1.6-unit logo
  return (
    <group position={[lx, groundHeight(lx, lz) - 0.04, lz]} rotation={[0, 0.14, 0]} scale={s}>
      <Landmark height={1.6} animate={!still} />
    </group>
  );
}

/**
 * The quail at the front of the island, facing the camera. A sky rim light behind it and a
 * warm glow from its laptop on its face lift it off the dark terrain (art direction §5).
 */
function HeroQuail({ tier, still, wave }: { tier: Tier; still: boolean; wave: boolean }) {
  const [qx, qz] = SPOTS.quail;
  const s = QUAIL_HEIGHT / 1.25;
  return (
    <group position={[qx, 0, qz]} rotation={[0, -0.18, 0]}>
      <group scale={s}>
        <Quail laptop={!wave} wave={wave} outlines={tier === 'high'} still={still} />
      </group>
      {/* Rim light from behind and above: outlines the bird's silhouette in sky blue. */}
      <pointLight position={[0.15, 1.5, -0.9]} color={PALETTE.sky} intensity={3.2} distance={2.6} decay={2} />
      {/* Warm laptop glow on the face. */}
      <pointLight position={[0, 0.55, 0.55]} color={PALETTE.lantern} intensity={1.1} distance={1.3} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ the island */

export interface IslandProps {
  tier: Tier;
  still: boolean;
  /** Assembly timeline 0..1 (1 = finished). */
  progress: { current: number };
  wave: boolean;
}

export function Island({ tier, still, progress, wave }: IslandProps) {
  return (
    <group>
      <Blueprint still={still} />
      <Sky still={still} />
      <Part progress={progress} win={[0, 0.4]} rise={1.6}>
        <Slab />
        <Rims />
        <Lake />
      </Part>
      <Part progress={progress} win={[0.12, 0.52]} pop>
        <Hills />
      </Part>
      <Part progress={progress} win={[0.3, 0.7]} pop>
        <Pines />
        <Orchard />
        <Vineyard at={SPOTS.vineyardWest} rows={6} length={1.6} angle={0.5} seed={3} />
        <Vineyard at={SPOTS.vineyardSouth} rows={6} length={1.7} angle={-0.25} seed={4} />
      </Part>
      <Part progress={progress} win={[0.38, 0.8]} rise={0.8}>
        <Bridge tier={tier} />
        <HackTent tier={tier} />
        <Waterfront />
        <Market />
        <Campfire still={still} />
      </Part>
      <Part progress={progress} win={[0.5, 0.92]} rise={2.2}>
        <LandmarkOnKnoll still={still} />
      </Part>
      <Part progress={progress} win={[0.66, 1]} pop>
        <HeroQuail tier={tier} still={still} wave={wave} />
      </Part>
    </group>
  );
}

export default Island;
