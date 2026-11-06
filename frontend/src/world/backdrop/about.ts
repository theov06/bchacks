/**
 * About backdrop (northern lights, art 1440×1500): flowing aurora curtains with depth.
 * Three translucent ribbons at different depths ripple sideways and shimmer with vertical
 * rays, in the art's aurora colours (aqua, mint, pink over violet). They hang in the open sky
 * above the copy and fade out before it: the About text starts at art y≈250, so the light
 * is gone by y≈235. The SVG's own aurora bands stay underneath.
 */
import * as THREE from 'three';
import type { Backdrop, LayerContext } from './engine';
import { artCamera, frameArt } from './kit';

interface Curtain {
  mesh: THREE.Mesh;
  depth: number;
}

const CURTAINS = [
  // top/bottom edge (art y), colours bottom → top, phase, speed, depth (parallax)
  { top: 20, bottom: 200, low: '#7fe0a8', high: '#7656c4', phase: 0, speed: 0.06, depth: 0.35, alpha: 0.32 },
  { top: 0, bottom: 170, low: '#5fd6e8', high: '#7656c4', phase: 2.1, speed: 0.045, depth: 0.6, alpha: 0.28 },
  { top: 40, bottom: 215, low: '#f2a6c2', high: '#5fd6e8', phase: 4.2, speed: 0.08, depth: 1, alpha: 0.2, tier: 'high' },
] as const;

const FADE_END = 235; // nothing past this art y (the copy starts at ≈250)

export function createAboutBackdrop(tier: 'high' | 'medium'): Backdrop {
  const scene = new THREE.Scene();
  const camera = artCamera();
  const curtains: Curtain[] = [];

  for (const c of CURTAINS) {
    if ('tier' in c && c.tier === 'high' && tier !== 'high') continue;
    const h = c.bottom - c.top;
    const geo = new THREE.PlaneGeometry(1700, h, tier === 'high' ? 120 : 60, 1);
    geo.translate(720, -(c.top + h / 2), 0);
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPhase: { value: c.phase },
        uSpeed: { value: c.speed },
        uLow: { value: new THREE.Color(c.low) },
        uHigh: { value: new THREE.Color(c.high) },
        uAlpha: { value: c.alpha },
        uTop: { value: c.top },
        uBottom: { value: c.bottom },
        uFadeEnd: { value: FADE_END },
      },
      transparent: true,
      depthWrite: false,
      // Normal alpha blending: the layer is a transparent canvas over the art, so additive
      // blending would write opaque black wherever the light is faint.
      vertexShader: `
        uniform float uTime, uPhase, uSpeed, uTop, uBottom;
        varying float vV;      // 0 at the curtain's lower edge, 1 at its top
        varying float vX;
        varying float vArtY;
        void main() {
          vec3 p = position;
          float artY = -p.y;
          vV = clamp((uBottom - artY) / (uBottom - uTop), 0.0, 1.0);
          vX = p.x;
          // Folds: the lower edge swings most, like a hanging curtain in a breeze.
          float sway = sin(p.x * 0.006 + uTime * uSpeed * 6.0 + uPhase) * 26.0
                     + sin(p.x * 0.017 - uTime * uSpeed * 9.0 + uPhase * 1.7) * 9.0;
          p.y += sway * (1.0 - vV) * 0.45;
          p.z += sway;
          vArtY = -p.y;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }`,
      fragmentShader: `
        uniform float uTime, uPhase, uAlpha, uFadeEnd;
        uniform vec3 uLow, uHigh;
        varying float vV;
        varying float vX;
        varying float vArtY;
        void main() {
          // Brightest just above the lower edge, fading up into the sky.
          float body = smoothstep(0.0, 0.12, vV) * pow(1.0 - vV, 1.6);
          // Vertical rays that drift and shimmer.
          float rays = 0.55 + 0.45 * sin(vX * 0.09 + sin(vX * 0.013 + uTime * 0.4 + uPhase) * 3.0);
          rays *= 0.75 + 0.25 * sin(vX * 0.031 - uTime * 0.7);
          // Fade out completely before the copy.
          float clear = 1.0 - smoothstep(uFadeEnd - 45.0, uFadeEnd, vArtY);
          vec3 col = mix(uLow, uHigh, smoothstep(0.15, 0.95, vV));
          gl_FragColor = vec4(col, body * rays * uAlpha * clear);
          #include <colorspace_fragment>
        }`,
    });
    const mesh = new THREE.Mesh(geo, mat);
    scene.add(mesh);
    curtains.push({ mesh, depth: c.depth });
  }

  return {
    scene,
    camera,
    resize: (ctx: LayerContext) => frameArt(camera, ctx),
    update(t, _dt, ctx) {
      for (const c of curtains) {
        (c.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = t;
        c.mesh.position.x = ctx.pointer.x * 18 * c.depth;
        c.mesh.position.y = Math.min(1, Math.max(-1, ctx.scroll)) * 20 * c.depth;
      }
    },
  };
}
