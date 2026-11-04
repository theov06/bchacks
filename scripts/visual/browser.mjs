/**
 * Shared browser for every visual check: Playwright's bundled Chromium with
 * WebGL forced on through SwiftShader (headless Chromium often disables it).
 * Set PW_CHANNEL=msedge (or chrome) to use an installed browser instead.
 */
import { chromium } from 'playwright';

export const GL_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
export const BASE_URL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 4321}`;

export function launch() {
  return chromium.launch({ args: GL_ARGS, ...(process.env.PW_CHANNEL ? { channel: process.env.PW_CHANNEL } : {}) });
}
