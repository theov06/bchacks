/**
 * Section backdrops in 3D (v3.1 spec 0.8.6): ONE WebGL renderer for the whole page.
 *
 * Each section that has 3D objects gets a plain 2D <canvas> layer, placed between its
 * illustrated scene (SVG) and its text. Every frame the renderer draws only the layers that
 * are on screen, each into its own viewport, and copies the result into that layer's 2D
 * canvas. So there is one WebGL context however many sections join in, nothing renders
 * off-screen, and the text stays plain HTML above it all.
 *
 * The loop stops when no layer is visible or the tab is hidden, and a frame-time watchdog
 * hands the scene back to the still SVG if the device can't keep up.
 */
import * as THREE from 'three';

export type Tier = 'high' | 'medium';

export interface LayerContext {
  tier: Tier;
  /** CSS pixel size of the layer. */
  width: number;
  height: number;
  /** Pointer position over the window, -1..1 (0,0 when there's no fine pointer). */
  pointer: THREE.Vector2;
  /** How far the section has scrolled through the viewport: 0 = its top at the viewport top. */
  scroll: number;
}

export interface Backdrop {
  scene: THREE.Scene;
  camera: THREE.Camera;
  /** Called when the layer's size changes (also once at the start). */
  resize(ctx: LayerContext): void;
  /** Called every frame while the layer is visible. `t` is seconds since start. */
  update(t: number, dt: number, ctx: LayerContext): void;
}

interface Layer {
  section: HTMLElement;
  /** The box the layer covers (usually the scene's art box). */
  box: HTMLElement;
  canvas: HTMLCanvasElement;
  ctx2d: CanvasRenderingContext2D;
  backdrop: Backdrop;
  visible: boolean;
  w: number;
  h: number;
  onStop?: () => void;
}

const SLOW_MS = 45; // average frame time that counts as "can't keep up"

export class BackdropEngine {
  readonly renderer: THREE.WebGLRenderer;
  private layers: Layer[] = [];
  private raf = 0;
  private last = 0;
  private clock = 0;
  private pointer = new THREE.Vector2();
  private dpr: number;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  private slowFrames = 0;
  private stopped = false;

  constructor(readonly tier: Tier) {
    this.dpr = Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === 'high', powerPreference: 'low-power' });
    this.renderer.setPixelRatio(1); // sizes below are already in device pixels
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const layer = this.layers.find((l) => l.section === e.target);
          if (layer) layer.visible = e.isIntersecting;
        }
        this.kick();
      },
      { rootMargin: '80px 0px' },
    );
    this.ro = new ResizeObserver(() => this.layers.forEach((l) => this.measure(l)));

    if (tier === 'high' && matchMedia('(pointer: fine)').matches) {
      addEventListener('pointermove', (e) => this.pointer.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? this.pause() : this.kick()));
  }

  /** Adds a section's 3D layer. The canvas goes into `box`, right after the scene art. */
  add(section: HTMLElement, box: HTMLElement, backdrop: Backdrop, onStop?: () => void): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.className = 'backdrop-3d';
    canvas.setAttribute('aria-hidden', 'true');
    box.append(canvas);
    const layer: Layer = { section, box, canvas, ctx2d: canvas.getContext('2d')!, backdrop, visible: false, w: 0, h: 0, onStop };
    this.layers.push(layer);
    this.measure(layer);
    this.io.observe(section);
    this.ro.observe(box);
    return canvas;
  }

  private context(l: Layer): LayerContext {
    const r = l.section.getBoundingClientRect();
    return { tier: this.tier, width: l.w, height: l.h, pointer: this.pointer, scroll: -r.top / Math.max(1, innerHeight) };
  }

  private measure(l: Layer) {
    const w = Math.max(1, Math.round(l.box.clientWidth));
    const h = Math.max(1, Math.round(l.box.clientHeight));
    if (w === l.w && h === l.h) return;
    l.w = w;
    l.h = h;
    l.canvas.width = Math.round(w * this.dpr);
    l.canvas.height = Math.round(h * this.dpr);
    l.backdrop.resize(this.context(l));
    // The shared drawing buffer only ever needs to fit the largest layer.
    const maxW = Math.max(...this.layers.map((x) => x.canvas.width));
    const maxH = Math.max(...this.layers.map((x) => x.canvas.height));
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x < maxW || size.y < maxH) this.renderer.setSize(Math.max(size.x, maxW), Math.max(size.y, maxH), false);
    this.kick();
  }

  private kick() {
    if (this.stopped || this.raf || document.hidden || !this.layers.some((l) => l.visible)) return;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private pause() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number) => {
    this.raf = 0;
    const dt = Math.min(0.1, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;

    const start = performance.now();
    const buffer = this.renderer.getSize(new THREE.Vector2());
    for (const l of this.layers) {
      if (!l.visible) continue;
      const w = l.canvas.width;
      const h = l.canvas.height;
      l.backdrop.update(this.clock, dt, this.context(l));
      // Draw into the bottom-left w×h of the shared buffer, then copy that corner out.
      this.renderer.setViewport(0, 0, w, h);
      this.renderer.setScissor(0, 0, w, h);
      this.renderer.setScissorTest(true);
      this.renderer.clear();
      this.renderer.render(l.backdrop.scene, l.backdrop.camera);
      l.ctx2d.clearRect(0, 0, w, h);
      l.ctx2d.drawImage(this.renderer.domElement, 0, buffer.y - h, w, h, 0, 0, w, h);
    }
    this.watchdog(performance.now() - start, dt);
    if (!this.stopped) this.kick();
  };

  /** Several slow frames in a row (after warm-up): stop and give every layer back to its SVG. */
  private watchdog(work: number, dt: number) {
    if (this.clock < 3) return;
    this.slowFrames = work > SLOW_MS || dt * 1000 > SLOW_MS * 2 ? this.slowFrames + 1 : Math.max(0, this.slowFrames - 1);
    if (this.slowFrames > 45) this.stop();
  }

  /** Removes every layer (the SVG scenes are still there underneath) and frees the GPU. */
  stop() {
    this.stopped = true;
    this.pause();
    this.io.disconnect();
    this.ro.disconnect();
    for (const l of this.layers) {
      l.canvas.remove();
      l.onStop?.();
    }
    this.layers = [];
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
