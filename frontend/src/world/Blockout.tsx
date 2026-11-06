/**
 * Grey-shape blockout of the island (art direction step). Plain shapes only:
 * it exists to approve layout, proportions and the hero framing, not the look.
 * Dev-only: mounted from /dev/island.
 */
import { useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Html, OrthographicCamera, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { LOGO_B, LOGO_C, LOGO_VIEWBOX, toPoints } from '../lib/logoGeometry';
import {
  FLOAT_HEIGHT,
  HILLS,
  ISLAND_OUTLINE,
  LAKE_OUTLINE,
  SLAB_THICKNESS,
  SPOTS,
  STOP_LABELS,
  groundHeight,
  pinePositions,
  type Vec2,
  type Vec3,
} from './layout';

// Blockout greys: lighter = closer to the viewer's attention.
const G = {
  bg: '#0F1539',
  grid: '#2c3462',
  ring: '#84DBF7',
  slabSide: '#4a5170',
  ground: '#9aa1b5',
  hill: '#868da3',
  water: '#5f6f93',
  build: '#c9cedb',
  tree: '#717891',
  landmark: '#e6ebff',
  quail: '#d9c7b0',
  fire: '#FFD27A',
};

/** Closed smooth outline → THREE.Shape in (x, -z) so it lies flat after rotating the geometry. */
function smoothShape(points: Vec2[], segments = 160) {
  const curve = new THREE.CatmullRomCurve3(
    points.map(([x, z]) => new THREE.Vector3(x, z, 0)),
    true,
    'centripetal',
  );
  const pts = curve.getPoints(segments).map((p) => new THREE.Vector2(p.x, p.y));
  return new THREE.Shape(pts);
}

/** Shape in the XY plane → lying on XZ with +y up: rotateX(π/2) maps shape y → world z. */
function flat(geo: THREE.BufferGeometry) {
  geo.rotateX(Math.PI / 2);
  return geo;
}

function Slab() {
  const geo = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(smoothShape(ISLAND_OUTLINE), {
      depth: SLAB_THICKNESS,
      bevelEnabled: true,
      bevelThickness: 0.12,
      bevelSize: 0.12,
      bevelSegments: 3,
      curveSegments: 4,
    });
    return flat(g);
  }, []);
  // Two materials: extrude groups are [caps, sides].
  return (
    <mesh geometry={geo} position={[0, -0.12, 0]} castShadow receiveShadow>
      <meshStandardMaterial attach="material-0" color={G.ground} roughness={0.95} />
      <meshStandardMaterial attach="material-1" color={G.slabSide} roughness={0.95} />
    </mesh>
  );
}

function Hills() {
  return (
    <>
      {HILLS.map(({ at, r }, i) => (
        <mesh key={i} position={[at[0], 0, at[1]]} scale={r} castShadow receiveShadow>
          <sphereGeometry args={[1, 40, 18, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={G.hill} roughness={0.9} />
        </mesh>
      ))}
    </>
  );
}

/** Flat face-up shape: build it in (x, -z) and rotate by -π/2 so the normal points to +y. */
function flatUp(points: Vec2[], segments: number) {
  const g = new THREE.ShapeGeometry(smoothShape(points.map(([x, z]) => [x, -z] as Vec2), segments));
  g.rotateX(-Math.PI / 2);
  return g;
}

function Lake() {
  const geo = useMemo(() => flatUp(LAKE_OUTLINE, 90), []);
  return (
    <mesh geometry={geo} position={[0, 0.025, 0]} receiveShadow>
      <meshStandardMaterial color={G.water} roughness={0.35} metalness={0.1} />
    </mesh>
  );
}

function Landmark() {
  const geo = useMemo(() => {
    const { x, y, width, height } = LOGO_VIEWBOX;
    const s = 1 / height; // logo height → 1 unit before scaling
    const shapes = [LOGO_B, LOGO_C].map(
      (poly) => new THREE.Shape(toPoints(poly).map(([px, py]) => new THREE.Vector2((px - x - width / 2) * s, -(py - y) * s))),
    );
    const g = new THREE.ExtrudeGeometry(shapes, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.02, bevelSegments: 2 });
    g.translate(0, 1, -0.08); // stand it on y = 0
    return g;
  }, []);
  const [lx, lz] = SPOTS.landmark;
  const y = groundHeight(lx, lz);
  return (
    <group position={[lx, y, lz]} rotation={[0, 0.14, 0]}>
      {/* Hexagonal plinth */}
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.62, 0.24, 6]} />
        <meshStandardMaterial color={G.build} />
      </mesh>
      <mesh geometry={geo} position={[0, 0.24, 0]} scale={1.7} castShadow>
        <meshStandardMaterial color={G.landmark} emissive={G.landmark} emissiveIntensity={0.35} />
      </mesh>
    </group>
  );
}

function Pines() {
  const pts = useMemo(() => pinePositions(), []);
  const ref = useRef<THREE.InstancedMesh>(null);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const q = new THREE.Quaternion();
    pts.forEach(([x, y, z], i) => {
      const s = 0.5 + ((i * 37) % 10) / 30;
      m.compose(new THREE.Vector3(x, y + 0.45 * s - 0.05, z), q, new THREE.Vector3(s, s, s));
      ref.current!.setMatrixAt(i, m);
    });
    ref.current!.instanceMatrix.needsUpdate = true;
  }, [pts]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, pts.length]} castShadow>
      <coneGeometry args={[0.28, 0.9, 7]} />
      <meshStandardMaterial color={G.tree} flatShading />
    </instancedMesh>
  );
}

/** Vine rows: thin boxes in a block, rotated to follow the slope direction. */
function Vineyard({ at, rows, length, angle }: { at: Vec2; rows: number; length: number; angle: number }) {
  return (
    <group position={[at[0], 0, at[1]]} rotation={[0, angle, 0]}>
      {Array.from({ length: rows }, (_, i) => {
        const z = (i - (rows - 1) / 2) * 0.32;
        return (
          <mesh key={i} position={[0, 0.07, z]} castShadow receiveShadow>
            <boxGeometry args={[length, 0.14, 0.1]} />
            <meshStandardMaterial color={G.tree} />
          </mesh>
        );
      })}
    </group>
  );
}

function Orchard() {
  const [ox, oz] = SPOTS.orchard;
  return (
    <group position={[ox, 0, oz]}>
      {Array.from({ length: 9 }, (_, i) => {
        const x = (i % 3) * 0.55 - 0.55;
        const z = Math.floor(i / 3) * 0.55 - 0.55;
        return (
          <group key={i} position={[x, groundHeight(ox + x, oz + z), z]}>
            <mesh position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.24, 6]} />
              <meshStandardMaterial color={G.slabSide} />
            </mesh>
            <mesh position={[0, 0.36, 0]} castShadow>
              <sphereGeometry args={[0.22, 12, 8]} />
              <meshStandardMaterial color={G.tree} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Bridge() {
  const [wx, wz] = SPOTS.bridgeWest;
  const [ex, ez] = SPOTS.bridgeEast;
  const len = Math.hypot(ex - wx, ez - wz);
  const angle = -Math.atan2(ez - wz, ex - wx);
  return (
    <group position={[(wx + ex) / 2, 0, (wz + ez) / 2]} rotation={[0, angle, 0]}>
      <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
        <boxGeometry args={[len, 0.1, 0.34]} />
        <meshStandardMaterial color={G.build} />
      </mesh>
      {/* Lift span: two towers and a beam, near the west end like the real bridge */}
      {[-0.18, 0.18].map((dz) => (
        <mesh key={dz} position={[-len * 0.18, 0.6, dz]} castShadow>
          <boxGeometry args={[0.1, 0.9, 0.08]} />
          <meshStandardMaterial color={G.build} />
        </mesh>
      ))}
      <mesh position={[-len * 0.18, 1.05, 0]} castShadow>
        <boxGeometry args={[0.16, 0.08, 0.5]} />
        <meshStandardMaterial color={G.build} />
      </mesh>
      {/* Pontoon supports */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[(i - 3) * (len / 7), 0.07, 0]}>
          <boxGeometry args={[0.12, 0.08, 0.4]} />
          <meshStandardMaterial color={G.slabSide} />
        </mesh>
      ))}
    </group>
  );
}

function HackTent() {
  const [tx, tz] = SPOTS.tent;
  const [sx, sz] = SPOTS.screen;
  return (
    <>
      <mesh position={[tx, 0, tz]} castShadow receiveShadow>
        <sphereGeometry args={[1.0, 8, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={G.build} flatShading />
      </mesh>
      <group position={[sx, 0, sz]} rotation={[0, -0.5, 0]}>
        <mesh position={[0, 0.85, 0]} castShadow>
          <boxGeometry args={[1.2, 0.68, 0.06]} />
          <meshStandardMaterial color={G.landmark} emissive={G.landmark} emissiveIntensity={0.15} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, 0.26, 0]}>
            <boxGeometry args={[0.05, 0.52, 0.05]} />
            <meshStandardMaterial color={G.slabSide} />
          </mesh>
        ))}
      </group>
    </>
  );
}

function Waterfront() {
  const [dx, dz] = SPOTS.dock;
  const [hx, hz] = SPOTS.houseboat;
  return (
    <>
      {/* Dock reaching into the lake */}
      <mesh position={[dx, 0.08, dz - 0.5]} castShadow receiveShadow>
        <boxGeometry args={[0.36, 0.06, 1.3]} />
        <meshStandardMaterial color={G.build} />
      </mesh>
      {/* Houseboat */}
      <group position={[hx, 0, hz]} rotation={[0, 0.3, 0]}>
        <mesh position={[0, 0.1, 0]} castShadow>
          <boxGeometry args={[1.0, 0.16, 0.45]} />
          <meshStandardMaterial color={G.build} />
        </mesh>
        <mesh position={[-0.1, 0.3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.26, 0.36]} />
          <meshStandardMaterial color={G.landmark} />
        </mesh>
      </group>
      {/* Paddleboard */}
      <mesh position={[dx + 0.5, 0.05, dz - 0.9]} rotation={[0, 0.6, 0]}>
        <capsuleGeometry args={[0.05, 0.5, 4, 8]} />
        <meshStandardMaterial color={G.landmark} />
      </mesh>
    </>
  );
}

function Market() {
  const [mx, mz] = SPOTS.market;
  return (
    <group position={[mx, 0, mz]}>
      {[-0.75, 0, 0.75].map((x, i) => (
        <group key={x} position={[x, 0, i === 1 ? -0.15 : 0.05]}>
          <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.55, 0.4, 0.4]} />
            <meshStandardMaterial color={G.build} />
          </mesh>
          <mesh position={[0, 0.52, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.46, 0.26, 4]} />
            <meshStandardMaterial color={G.landmark} flatShading />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Campfire() {
  const [cx, cz] = SPOTS.campfire;
  return (
    <group position={[cx, 0, cz]}>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.14, 0.32, 6]} />
        <meshStandardMaterial color={G.fire} emissive={G.fire} emissiveIntensity={0.8} />
      </mesh>
      {Array.from({ length: 4 }, (_, i) => {
        const a = (i / 4) * Math.PI * 2 + 0.4;
        return (
          <mesh key={i} position={[Math.cos(a) * 0.55, 0.06, Math.sin(a) * 0.55]} rotation={[0, -a, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 0.36, 8]} />
            <meshStandardMaterial color={G.slabSide} />
          </mesh>
        );
      })}
    </group>
  );
}

/** Quail stand-in: body + head. The real mascot is step 2. */
function QuailStandIn() {
  const [qx, qz] = SPOTS.quail;
  return (
    <group position={[qx, 0, qz]} rotation={[0, -0.4, 0]}>
      <mesh position={[0, 0.22, 0]} scale={[1, 0.9, 1.1]} castShadow>
        <sphereGeometry args={[0.22, 16, 12]} />
        <meshStandardMaterial color={G.quail} />
      </mesh>
      <mesh position={[0, 0.48, 0.08]} castShadow>
        <sphereGeometry args={[0.13, 16, 12]} />
        <meshStandardMaterial color={G.quail} />
      </mesh>
      <mesh position={[0, 0.66, 0.12]} rotation={[0.5, 0, 0]}>
        <coneGeometry args={[0.04, 0.14, 6]} />
        <meshStandardMaterial color={G.slabSide} />
      </mesh>
    </group>
  );
}

/** The blueprint continues under the island: grid, construction circles, soft contact shadow. */
function Blueprint() {
  const y = -(SLAB_THICKNESS + FLOAT_HEIGHT);
  return (
    <group position={[0, y, 0]}>
      <gridHelper args={[60, 60, G.grid, G.grid]} />
      {[9.4, 11.6].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[r, r + 0.04, 128]} />
          <meshBasicMaterial color={G.ring} transparent opacity={0.28} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[7.5, 64]} />
        <meshBasicMaterial color="#000" transparent opacity={0.28} />
      </mesh>
    </group>
  );
}

function Labels() {
  return (
    <>
      {STOP_LABELS.map(({ section, spot, label }) => (
        <Html key={section} position={[spot[0], groundHeight(spot[0], spot[1]) + 0.9, spot[1]]} center zIndexRange={[10, 0]}>
          <div className="lbl">
            <b>{section}</b>
            <span>{label}</span>
          </div>
        </Html>
      ))}
    </>
  );
}

/**
 * Fit the island's width into ~80% of the view at any aspect ratio (hero framing, art direction §4).
 * Tall (phone) views use a wider lens instead of backing far away, and the fog follows the distance.
 */
function HeroCamera() {
  const ref = useRef<THREE.PerspectiveCamera>(null);
  const { size, scene } = useThree();
  useLayoutEffect(() => {
    const cam = ref.current!;
    const aspect = size.width / size.height;
    cam.fov = aspect < 1 ? THREE.MathUtils.lerp(48, 30, Math.max(0, (aspect - 0.45) / 0.55)) : 30;
    const vfov = THREE.MathUtils.degToRad(cam.fov);
    const hfov = 2 * Math.atan(Math.tan(vfov / 2) * aspect);
    const halfWidth = 7.6 / 0.8;
    const byWidth = halfWidth / Math.tan(hfov / 2);
    const byHeight = 7.4 / Math.tan(vfov / 2);
    const dist = Math.max(byWidth, byHeight);
    const pitch = THREE.MathUtils.degToRad(30);
    const yaw = THREE.MathUtils.degToRad(-8);
    cam.position.set(Math.sin(yaw) * Math.cos(pitch) * dist, Math.sin(pitch) * dist, Math.cos(yaw) * Math.cos(pitch) * dist);
    cam.far = dist * 4;
    cam.lookAt(0, -0.2, 0);
    cam.updateProjectionMatrix();
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.near = dist * 1.05;
      scene.fog.far = dist * 2.1;
    }
  }, [size, scene]);
  return <PerspectiveCamera ref={ref} makeDefault fov={30} near={0.1} far={400} />;
}

function PlanCamera() {
  const { size } = useThree();
  const zoom = Math.min(size.width / 16.5, size.height / 11.5);
  return <OrthographicCamera makeDefault position={[0, 40, 0.001]} zoom={zoom} near={0.1} far={200} onUpdate={(c) => c.lookAt(0, 0, 0)} />;
}

/** Marks <html data-ready> once a few frames are drawn, for the screenshot script. */
function ReadyFlag() {
  const n = useRef(0);
  useFrame(() => {
    if (++n.current === 12) document.documentElement.dataset.ready = 'true';
  });
  return null;
}

export function BlockoutScene({ view = 'hero', labels = true }: { view?: 'hero' | 'plan'; labels?: boolean }) {
  return (
    <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
      <color attach="background" args={[G.bg]} />
      <fog attach="fog" args={[G.bg, 30, 60]} />
      {view === 'plan' ? <PlanCamera /> : <HeroCamera />}
      <hemisphereLight args={['#b9c6ff', '#1a2050', 0.9]} />
      <directionalLight
        position={[-6, 12, -4]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <Blueprint />
      <Slab />
      <Hills />
      <Lake />
      <Bridge />
      <Landmark />
      <Pines />
      <Vineyard at={SPOTS.vineyardWest} rows={7} length={1.7} angle={0.5} />
      <Vineyard at={SPOTS.vineyardSouth} rows={6} length={1.7} angle={-0.25} />
      <Orchard />
      <HackTent />
      <Waterfront />
      <Market />
      <Campfire />
      <QuailStandIn />
      {labels && <Labels />}
      <ReadyFlag />
    </Canvas>
  );
}

export default BlockoutScene;
export type { Vec3 };
