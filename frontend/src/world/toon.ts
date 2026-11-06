/**
 * Shared toon (cel) shading for Tiny Okanagan (art direction §2): three bands,
 * shadow / mid / lit. Shadows stay navy because the scene lights are blue.
 */
import * as THREE from 'three';

let gradient: THREE.DataTexture | null = null;

/** 3-step gradient map for MeshToonMaterial. Created once and shared. */
export function toonGradient(): THREE.DataTexture {
  if (gradient) return gradient;
  const steps = new Uint8Array([70, 150, 255]);
  gradient = new THREE.DataTexture(steps, steps.length, 1, THREE.RedFormat);
  gradient.minFilter = THREE.NearestFilter;
  gradient.magFilter = THREE.NearestFilter;
  gradient.generateMipmaps = false;
  gradient.needsUpdate = true;
  return gradient;
}

/** Outline colour for hero objects: a dark navy, never black. */
export const OUTLINE = '#0a0f2a';

/**
 * Scene time in seconds. `?t=3.2` in the URL freezes it, so screenshots can
 * capture exact animation frames.
 */
const frozen = typeof location !== 'undefined' ? new URLSearchParams(location.search).get('t') : null;
export const FROZEN_TIME: number | null = frozen === null ? null : Number(frozen);
export const sceneTime = (elapsed: number) => (FROZEN_TIME ?? elapsed);
