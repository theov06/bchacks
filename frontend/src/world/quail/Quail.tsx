/**
 * The BCHacks mascot: a California quail (art direction §5), built from simple
 * primitives, toon-shaded with soft navy outlines. About 1.25 units tall
 * including the topknot; the island scales it down.
 *
 * Idle: bob with a little squash, blink every few seconds, topknot bounce that
 * lags the bob, slow look-arounds, typing bursts on the laptop. `wave` raises a wing.
 */
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { LOGO_B, LOGO_C, LOGO_VIEWBOX, toPoints } from '../../lib/logoGeometry';
import { Outline } from '../Outline';
import { sceneTime, toonGradient } from '../toon';

// Night-palette plumage: muted so the bird sits in the scene, with enough contrast
// between face, topknot and body to read at ~30px on phones.
export const QUAIL_COLOURS = {
  back: '#86684f', // warm brown back and flanks
  chest: '#5d6f9c', // slate-blue chest
  belly: '#c2ad8a', // cream belly (kept warm and below white so moonlight doesn't turn it mint)
  scale: '#b08a68', // chestnut belly scales (soft)
  crown: '#5a4334', // dark chestnut crown
  forehead: '#cdb487', // buff forehead and face
  face: '#121830', // black face mask
  stripe: '#f4f1e8', // white face stripes
  topknot: '#0f1426',
  beak: '#2b3150',
  leg: '#8f6d58',
  wingDark: '#5f4b3e',
  streak: '#efe7d6',
} as const;

const HEAD_R = 0.25;
const HEAD_AT = new THREE.Vector3(0, 0.86, 0.13);

/** Point on a sphere: theta from the top (0) down, phi around Y with phi = π/2 facing +z (front). */
function onSphere(r: number, theta: number, phi: number) {
  return new THREE.Vector3(-r * Math.cos(phi) * Math.sin(theta), r * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta));
}

/** Egg-shaped body: a lathe, widest just below the middle, with vertex-colour plumage zones. */
function useBodyGeometry() {
  return useMemo(() => {
    const pts: THREE.Vector2[] = [];
    const n = 28;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const r = 0.36 * Math.pow(Math.sin(Math.PI * t), 0.72) * (1 + 0.16 * (0.42 - t));
      pts.push(new THREE.Vector2(Math.max(r, 0.0001), 0.1 + 0.66 * t));
    }
    const g = new THREE.LatheGeometry(pts, 48);
    g.scale(0.96, 1, 1.12);
    const pos = g.attributes.position;
    const colours = new Float32Array(pos.count * 3);
    const back = new THREE.Color(QUAIL_COLOURS.back);
    const chest = new THREE.Color(QUAIL_COLOURS.chest);
    const belly = new THREE.Color(QUAIL_COLOURS.belly);
    const c = new THREE.Color();
    const smooth = (a: number, b: number, x: number) => {
      const k = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return k * k * (3 - 2 * k);
    };
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const z = pos.getZ(i);
      const front = smooth(-0.05, 0.16, z); // 0 at the back, 1 at the front
      const low = 1 - smooth(0.36, 0.5, y); // 1 on the belly, 0 on the chest
      c.copy(back).lerp(chest, front);
      c.lerp(belly, front * low * 0.92);
      colours.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colours, 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

/** Chevron "scales" on the belly, placed on the body surface. */
function BellyScales({ mat }: { mat: THREE.Material }) {
  const spots = useMemo(() => {
    const out: { p: THREE.Vector3; q: THREE.Quaternion }[] = [];
    const rows = [
      { y: 0.36, a: [-0.32, 0, 0.32] },
      { y: 0.27, a: [-0.48, -0.16, 0.16, 0.48] },
      { y: 0.19, a: [-0.3, 0, 0.3] },
    ];
    for (const { y, a } of rows) {
      const t = (y - 0.1) / 0.66;
      const r = 0.36 * Math.pow(Math.sin(Math.PI * t), 0.72) * (1 + 0.16 * (0.42 - t));
      for (const ang of a) {
        const nrm = new THREE.Vector3(Math.sin(ang) * 0.96, 0, Math.cos(ang) * 1.12).normalize();
        const p = new THREE.Vector3(Math.sin(ang) * r * 0.96, y, Math.cos(ang) * r * 1.12).addScaledVector(nrm, 0.004);
        out.push({ p, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm) });
      }
    }
    return out;
  }, []);
  return (
    <>
      {spots.map(({ p, q }, i) => (
        <group key={i} position={p} quaternion={q}>
          {/* A small "v": two flattened capsules */}
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * 0.016, 0.005, 0]} rotation={[0, 0, s * 0.8]} material={mat}>
              <capsuleGeometry args={[0.006, 0.022, 3, 6]} />
            </mesh>
          ))}
        </group>
      ))}
    </>
  );
}

/** A thin white stripe following the head surface between two (theta, phi) points. */
function SurfaceStripe({ from, to, mid, radius = 0.014, mat }: { from: [number, number]; to: [number, number]; mid: [number, number]; radius?: number; mat: THREE.Material }) {
  const geo = useMemo(() => {
    const r = HEAD_R * 1.012;
    const curve = new THREE.CatmullRomCurve3([onSphere(r, ...from), onSphere(r, ...mid), onSphere(r, ...to)]);
    return new THREE.TubeGeometry(curve, 24, radius, 6, false);
  }, [from, to, mid, radius]);
  return <mesh geometry={geo} material={mat} />;
}

/** Laptop screen texture: a tiny code editor in the site palette. */
function useCodeTexture() {
  return useMemo(() => {
    const cv = document.createElement('canvas');
    cv.width = 256;
    cv.height = 168;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#0f1539';
    ctx.fillRect(0, 0, 256, 168);
    ctx.fillStyle = '#262c55';
    ctx.fillRect(0, 0, 256, 16);
    const colours = ['#84DBF7', '#B5ECFF', '#3B82F6', '#9AA6D6', '#FFD27A'];
    let y = 28;
    let seed = 3;
    const rand = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    while (y < 160) {
      let x = 12 + Math.floor(rand() * 3) * 14;
      const parts = 1 + Math.floor(rand() * 3);
      for (let i = 0; i < parts; i++) {
        const w = 18 + rand() * 60;
        ctx.fillStyle = colours[Math.floor(rand() * colours.length)];
        ctx.fillRect(x, y, w, 6);
        x += w + 8;
      }
      y += 13;
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
}

/** Tiny laptop in front of the quail: screen faces the bird, a logo sticker glows on the lid. */
function Laptop({ grad }: { grad: THREE.Texture }) {
  const code = useCodeTexture();
  const sticker = useMemo(() => {
    const { x, y, width, height } = LOGO_VIEWBOX;
    const s = 0.07 / height;
    const shapes = [LOGO_B, LOGO_C].map((poly) => new THREE.Shape(toPoints(poly).map(([px, py]) => new THREE.Vector2(-(px - x - width / 2) * s, -(py - y - height / 2) * s))));
    return new THREE.ShapeGeometry(shapes);
  }, []);
  return (
    <group position={[0, 0, 0.44]} scale={0.8}>
      {/* Base */}
      <mesh position={[0, 0.012, 0]}>
        <boxGeometry args={[0.34, 0.022, 0.22]} />
        <meshToonMaterial color="#6f7896" gradientMap={grad} />
        <Outline px={1.5} />
      </mesh>
      {/* Lid, hinged at the back edge (toward the bird), opened ~110° */}
      <group position={[0, 0.022, -0.11]} rotation={[0.35, 0, 0]}>
        <mesh position={[0, 0.115, 0]}>
          <boxGeometry args={[0.34, 0.23, 0.014]} />
          <meshToonMaterial color="#6f7896" gradientMap={grad} />
          <Outline px={1.5} />
        </mesh>
        {/* Screen faces the quail (-z) */}
        <mesh position={[0, 0.115, -0.008]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.31, 0.2]} />
          <meshBasicMaterial map={code} toneMapped={false} />
        </mesh>
        {/* Logo sticker on the back of the lid (faces the viewer) */}
        <mesh geometry={sticker} position={[0, 0.115, 0.0075]} rotation={[0, Math.PI, Math.PI]}>
          <meshBasicMaterial color="#B5ECFF" toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      </group>
      {/* Screen glow on the ground and the bird */}
      <pointLight position={[0, 0.14, -0.2]} color="#84DBF7" intensity={0.08} distance={0.5} decay={2} />
    </group>
  );
}

export interface QuailProps {
  /** Show the laptop and type on it. */
  laptop?: boolean;
  /** Raise the right wing and wave. */
  wave?: boolean;
  /** Outlines are a high-tier detail (art direction §6). */
  outlines?: boolean;
  /** Freeze all motion (reduced motion / still renders). */
  still?: boolean;
}

export function Quail({ laptop = true, wave = false, outlines = true, still = false }: QuailProps) {
  const grad = toonGradient();
  const body = useBodyGeometry();
  const root = useRef<THREE.Group>(null);
  const torso = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const knot = useRef<THREE.Group>(null);
  const eyes = useRef<THREE.Group[]>([]);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);

  const m = useMemo(() => {
    const t = (color: string) => new THREE.MeshToonMaterial({ color, gradientMap: grad });
    return {
      body: new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: grad }),
      scale: t(QUAIL_COLOURS.scale),
      crown: t(QUAIL_COLOURS.crown),
      forehead: t(QUAIL_COLOURS.forehead),
      face: t(QUAIL_COLOURS.face),
      stripe: new THREE.MeshBasicMaterial({ color: QUAIL_COLOURS.stripe }),
      topknot: t(QUAIL_COLOURS.topknot),
      beak: t(QUAIL_COLOURS.beak),
      leg: t(QUAIL_COLOURS.leg),
      wing: t(QUAIL_COLOURS.back),
      wingDark: t(QUAIL_COLOURS.wingDark),
      streak: new THREE.MeshBasicMaterial({ color: QUAIL_COLOURS.streak }),
      sclera: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
      pupil: new THREE.MeshBasicMaterial({ color: '#0b0f22' }),
      shine: new THREE.MeshBasicMaterial({ color: '#ffffff' }),
    };
  }, [grad]);

  // Topknot: a stalk that rises from the forehead and curls forward into a teardrop plume.
  const stalk = useMemo(() => {
    const base = onSphere(HEAD_R * 0.92, 0.42, Math.PI / 2);
    const curve = new THREE.CatmullRomCurve3([
      base,
      base.clone().add(new THREE.Vector3(0, 0.1, 0.01)),
      base.clone().add(new THREE.Vector3(0, 0.19, 0.06)),
      base.clone().add(new THREE.Vector3(0, 0.22, 0.13)),
    ]);
    return { geo: new THREE.TubeGeometry(curve, 20, 0.017, 6, false), tip: curve.getPoint(1), base };
  }, []);

  // Face mask: a black cap on the lower front of the head, with a white border band behind it.
  // Face patches are flattened ellipsoids pressed into the head, so their edges come out round.
  // Black bib under the beak, framed by a thin white line (the California quail's signature face).
  const patch = (theta: number, depth: number) => {
    const p = onSphere(HEAD_R * depth, theta, Math.PI / 2);
    return { p, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), p.clone().normalize()) };
  };
  const bib = useMemo(() => patch(2.1, 0.86), []);
  const brow = useMemo(() => patch(0.7, 0.86), []);
  // Light face patch around the eyes and beak: gives the eyes and beak contrast, and reads at phone size.
  const faceDisc = useMemo(() => patch(1.36, 0.87), []);

  // Eyes: placed on the head surface, facing outward.
  const eyeSpots = useMemo(
    () =>
      [-1, 1].map((s) => {
        const p = onSphere(HEAD_R * 0.97, 1.14, Math.PI / 2 + s * 0.36);
        const n = p.clone().normalize();
        return { p, q: new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), n) };
      }),
    [],
  );

  useFrame(({ clock }) => {
    if (!root.current || !torso.current || !head.current || !knot.current) return;
    const t = still ? 0.35 : sceneTime(clock.elapsedTime);
    // Bob: 0.8 s cycle with a little squash and stretch.
    const s = 0.5 - 0.5 * Math.cos((t * Math.PI * 2) / 0.8);
    torso.current.position.y = s * 0.018;
    torso.current.scale.set(1 + s * 0.014, 1 - s * 0.028, 1 + s * 0.014);
    // Typing bursts: 1.5 s out of every 6 s, the head dips and the wings tap.
    const typing = laptop && !wave && t % 6 > 3.6 && t % 6 < 5.1;
    // Slow look-around, paused while typing.
    const look = typing ? 0 : Math.sin(t * 0.55) * 0.32 + Math.sin(t * 1.3) * 0.06;
    head.current.rotation.set(typing ? 0.22 : Math.sin(t * 0.9) * 0.04, look, Math.sin(t * 0.7) * 0.05);
    // Topknot lags the bob by ~0.12 s.
    knot.current.rotation.x = Math.sin(((t - 0.12) * Math.PI * 2) / 0.8) * 0.16 - 0.04;
    // Blink every 4.2 s for 0.13 s.
    const blink = t % 4.2 > 3.0 && t % 4.2 < 3.13 ? 0.12 : 1;
    eyes.current.forEach((e) => e && (e.scale.y = blink));
    // Wings
    const tap = typing ? Math.sin(t * 52) * 0.06 : 0;
    // Small forward taps: larger swings show the wing's inner edge against the body.
    if (wingL.current) wingL.current.rotation.set(typing ? -0.16 + tap : 0, 0, 0);
    if (wingR.current) {
      if (wave) {
        // Up and out to the bird's right (+x), waggling.
        wingR.current.rotation.set(-0.35, 0, 2.2 + Math.sin(t * 9) * 0.3);
      } else {
        wingR.current.rotation.set(typing ? -0.16 - tap : 0, 0, 0);
      }
    }
  });

  // Screen-space outlines: a constant pixel width, so scaled parts and small renders keep the same line.
  const out = (px = 2.5) => (outlines ? <Outline px={px} /> : null);

  return (
    <group ref={root}>
      {/* Legs and feet */}
      {[-1, 1].map((sx) => (
        <group key={sx} position={[sx * 0.1, 0, 0.03]}>
          <mesh position={[0, 0.07, 0]} material={m.leg}>
            <cylinderGeometry args={[0.018, 0.022, 0.14, 6]} />
          </mesh>
          {[-0.5, 0, 0.5].map((a) => (
            <mesh key={a} position={[Math.sin(a) * 0.04, 0.008, Math.cos(a) * 0.04]} rotation={[Math.PI / 2, 0, -a]} material={m.leg}>
              <capsuleGeometry args={[0.011, 0.05, 2, 5]} />
            </mesh>
          ))}
        </group>
      ))}

      <group ref={torso}>
        <mesh geometry={body} material={m.body}>
          {out()}
        </mesh>
        <BellyScales mat={m.scale} />
        {/* The bib continues onto the upper chest so it reads as a throat patch, not a mouth. */}
        <mesh position={[0, 0.67, 0.225]} rotation={[-0.5, 0, 0]} scale={[0.1, 0.075, 0.045]} material={m.face}>
          <sphereGeometry args={[1, 24, 16]} />
        </mesh>

        {/* Tail: a short dark fan pointing back and up */}
        <mesh position={[0, 0.5, -0.36]} rotation={[-1.1, 0, 0]} scale={[1.3, 1, 0.45]} material={m.wingDark}>
          <coneGeometry args={[0.09, 0.22, 8]} />
          {out()}
        </mesh>

        {/* Wings, hinged at the shoulder, with white flank streaks */}
        {[
          { ref: wingL, s: -1 },
          { ref: wingR, s: 1 },
        ].map(({ ref, s }) => (
          <group key={s} ref={ref} position={[s * 0.25, 0.6, 0.0]}>
            <mesh position={[s * 0.015, -0.17, -0.07]} rotation={[0.32, 0, s * 0.16]} scale={[0.07, 0.2, 0.27]} material={m.wing}>
              <sphereGeometry args={[1, 20, 14]} />
              {out()}
            </mesh>
            {[0, 1, 2].map((i) => (
              <mesh key={i} position={[s * 0.088, -0.2 - i * 0.05, -0.03 - i * 0.035]} rotation={[0.9, s * 0.25, 0]} material={m.streak}>
                <capsuleGeometry args={[0.007, 0.1, 2, 5]} />
              </mesh>
            ))}
          </group>
        ))}

        {/* Head */}
        <group ref={head} position={HEAD_AT}>
          <mesh material={m.crown}>
            <sphereGeometry args={[HEAD_R, 40, 24]} />
            {out()}
          </mesh>
          {/* Black throat bib: runs from under the beak down into the chest (continued on the torso). */}
          <group position={faceDisc.p} quaternion={faceDisc.q}>
            <mesh material={m.forehead} scale={[0.17, 0.14, 0.043]}>
              <sphereGeometry args={[1, 32, 20]} />
            </mesh>
          </group>
          <group position={bib.p} quaternion={bib.q}>
            <mesh material={m.face} scale={[0.12, 0.1, 0.046]}>
              <sphereGeometry args={[1, 32, 20]} />
            </mesh>
          </group>
          {/* White lines from behind each eye down the sides of the bib, open at the bottom. */}
          {[-1, 1].map((s) => (
            <SurfaceStripe key={`bib${s}`} from={[1.62, Math.PI / 2 + s * 0.7]} mid={[1.86, Math.PI / 2 + s * 0.6]} to={[2.2, Math.PI / 2 + s * 0.46]} radius={0.01} mat={m.stripe} />
          ))}
          <group position={brow.p} quaternion={brow.q}>
            <mesh material={m.forehead} scale={[0.085, 0.065, 0.044]}>
              <sphereGeometry args={[1, 24, 16]} />
            </mesh>
          </group>
          {/* White eyebrow stripes running back from the forehead */}
          {[-1, 1].map((s) => (
            <SurfaceStripe key={s} from={[0.9, Math.PI / 2 + s * 0.2]} mid={[0.86, Math.PI / 2 + s * 0.72]} to={[0.98, Math.PI / 2 + s * 1.3]} radius={0.011} mat={m.stripe} />
          ))}

          {/* Eyes */}
          {eyeSpots.map(({ p, q }, i) => (
            <group key={i} position={p} quaternion={q} ref={(el) => el && (eyes.current[i] = el)}>
              <mesh material={m.sclera} scale={[1, 1, 0.55]}>
                <sphereGeometry args={[0.062, 20, 14]} />
              </mesh>
              <mesh position={[0, 0, 0.026]} material={m.pupil} scale={[1, 1, 0.5]}>
                <sphereGeometry args={[0.047, 20, 14]} />
              </mesh>
              <mesh position={[0.017, 0.02, 0.052]} material={m.shine}>
                <sphereGeometry args={[0.013, 10, 8]} />
              </mesh>
            </group>
          ))}

          {/* Beak: short, dark, slightly down */}
          <mesh position={onSphere(HEAD_R * 1.02, 1.5, Math.PI / 2)} rotation={[2.35, 0, 0]} material={m.beak}>
            <coneGeometry args={[0.045, 0.11, 8]} />
            {out()}
          </mesh>

          {/* Topknot */}
          <group ref={knot} position={stalk.base}>
            <group position={stalk.base.clone().negate()}>
              <mesh geometry={stalk.geo} material={m.topknot} />
              <mesh position={stalk.tip} rotation={[1.1, 0, 0]} scale={[0.055, 0.085, 0.04]} material={m.topknot}>
                <sphereGeometry args={[1, 16, 12]} />
                {out()}
              </mesh>
            </group>
          </group>
        </group>
      </group>

      {laptop && <Laptop grad={grad} />}
    </group>
  );
}

export default Quail;
