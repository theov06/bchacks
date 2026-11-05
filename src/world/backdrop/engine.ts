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
  /**
   * The part of the scene's art (viewBox units, y down) this layer covers, for layers fitted
   * to an SVG (LayerOptions.svg). Lets a scene place objects in the art's own coordinates.
   */
  art: { left: number; top: number; width: number; height: number };
  /** Device pixels per CSS pixel this layer renders at (for point sizes). */
  res: number;
}

export interface LayerOptions {
  /** Fit the layer over this SVG's visible area (as cropped by its preserveAspectRatio). */
  svg?: SVGSVGElement;
  /**
   * With `svg`: only cover this band of the art (viewBox units, y down), where the scene's
   * objects actually move. Fewer pixels to draw and copy every frame.
   */
  region?: { x0: number; y0: number; x1: number; y1: number };
  /** Render resolution relative to the device pixel ratio (soft scenes can go lower). */
  resolution?: number;
  /** Called once, right after the layer's first frame is drawn. */
  onFirstFrame?: () => void;
  /** Keep this layer when a slow device sheds the others (it has no still fallback shown). */
  keep?: boolean;
  onStop?: () => void;
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
  art: LayerContext['art'];
  opts: LayerOptions;
  drawn: boolean;
}

const SLOW_MS = 45; // average frame time that counts as "can't keep up"
/**
 * How fast every backdrop animation runs (1 = the speeds written in each scene file).
 * One knob for the whole page: drifting, flapping, pedalling, swimming, twinkling.
 */
export const ANIMATION_SPEED = 2.5;

export class BackdropEngine {
  readonly renderer: THREE.WebGLRenderer;
  private layers: Layer[] = [];
  private raf = 0;
  private last = 0;
  private clock = 0;
  /** Eased pointer the scenes read; it glides after the real one, so parallax never twitches. */
  private pointer = new THREE.Vector2();
  private pointerTarget = new THREE.Vector2();
  private dpr: number;
  private io: IntersectionObserver;
  private ro: ResizeObserver;
  /** Seconds of slow frames lately (decays while frames are fine). */
  private slowTime = 0;
  /**
   * Seconds the watchdog looks away: a layer coming on screen or drawing its first frame
   * causes a short, expected hiccup (e.g. a jump down the page), not a slow device.
   */
  private grace = 0;
  private stopped = false;

  /**
   * @param software the browser draws WebGL on the CPU (GPU acceleration off): render at 1×
   * (never the high-density 1.5–2×), which keeps it sharp and still smooth (30–48 fps measured).
   */
  constructor(
    readonly tier: Tier,
    software = false,
  ) {
    this.dpr = software ? 1 : Math.min(window.devicePixelRatio || 1, tier === 'high' ? 2 : 1.5);
    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: tier === 'high', powerPreference: 'low-power' });
    this.renderer.setPixelRatio(1); // sizes below are already in device pixels
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const layer = this.layers.find((l) => l.section === e.target);
          if (layer) {
            if (e.isIntersecting && !layer.visible) this.grace = Math.max(this.grace, 0.75);
            layer.visible = e.isIntersecting;
          }
        }
        this.kick();
      },
      { rootMargin: '200px 0px' },
    );
    this.ro = new ResizeObserver(() => this.layers.forEach((l) => this.measure(l)));

    if (tier === 'high' && matchMedia('(pointer: fine)').matches) {
      addEventListener('pointermove', (e) => this.pointerTarget.set((e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1), { passive: true });
    }
    document.addEventListener('visibilitychange', () => (document.hidden ? this.pause() : this.kick()));
  }

  /** False once the engine has stopped (slow device); nothing more can be added then. */
  get running(): boolean {
    return !this.stopped;
  }

  /** Adds a section's 3D layer. The canvas goes into `box`, right after the scene art. */
  add(section: HTMLElement, box: HTMLElement, backdrop: Backdrop, opts: LayerOptions | (() => void) = {}): HTMLCanvasElement {
    if (typeof opts === 'function') opts = { onStop: opts };
    const canvas = document.createElement('canvas');
    canvas.className = 'backdrop-3d';
    canvas.setAttribute('aria-hidden', 'true');
    box.append(canvas);
    const layer: Layer = {
      section,
      box,
      canvas,
      ctx2d: canvas.getContext('2d')!,
      backdrop,
      visible: false,
      w: 0,
      h: 0,
      art: { left: 0, top: 0, width: 1, height: 1 },
      opts,
      drawn: false,
    };
    this.layers.push(layer);
    this.measure(layer);
    // Prepare the layer's shaders in the background now, not on its first frame on screen
    // (several sections compiling mid-scroll made frames stall).
    const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 3000 }) : setTimeout(cb, 200));
    idle(() => {
      if (this.stopped) return;
      this.renderer.compileAsync(backdrop.scene, backdrop.camera).catch(() => {});
    });
    this.io.observe(section);
    this.ro.observe(box);
    return canvas;
  }

  private context(l: Layer): LayerContext {
    const r = l.section.getBoundingClientRect();
    return { tier: this.tier, width: l.w, height: l.h, pointer: this.pointer, scroll: -r.top / Math.max(1, innerHeight), art: l.art, res: this.dpr * (l.opts.resolution ?? 1) };
  }

  /**
   * Fits the canvas over the part of the SVG that's actually visible in its box, and works out
   * which part of the art (viewBox units) that is, following the SVG's own slice/meet crop.
   */
  private fitSvg(l: Layer, svg: SVGSVGElement) {
    const box = l.box.getBoundingClientRect();
    const s = svg.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const par = svg.preserveAspectRatio.baseVal;
    const scale = Math.max(s.width / vb.width, s.height / vb.height); // slice
    const ox = (s.width - vb.width * scale) / 2; // xMid
    const oy = par.align >= SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMAX ? s.height - vb.height * scale : par.align >= SVGPreserveAspectRatio.SVG_PRESERVEASPECTRATIO_XMINYMID ? (s.height - vb.height * scale) / 2 : 0;
    // Visible part of the SVG inside the box (the box clips it), narrowed to the region.
    const rg = l.opts.region;
    const toX = (ax: number) => s.left + ox + (ax - vb.x) * scale;
    const toY = (ay: number) => s.top + oy + (ay - vb.y) * scale;
    const x0 = Math.max(s.left, box.left, rg ? toX(rg.x0) : -Infinity);
    const y0 = Math.max(s.top, box.top, rg ? toY(rg.y0) : -Infinity);
    const x1 = Math.min(s.right, box.right, rg ? toX(rg.x1) : Infinity);
    const y1 = Math.min(s.bottom, box.bottom, rg ? toY(rg.y1) : Infinity);
    const w = Math.max(1, x1 - x0);
    const h = Math.max(1, y1 - y0);
    Object.assign(l.canvas.style, { left: `${x0 - box.left}px`, top: `${y0 - box.top}px`, width: `${w}px`, height: `${h}px` });
    l.art = { left: (x0 - s.left - ox) / scale + vb.x, top: (y0 - s.top - oy) / scale + vb.y, width: w / scale, height: h / scale };
    return { w: Math.round(w), h: Math.round(h) };
  }

  private measure(l: Layer, force = false) {
    const { w, h } = l.opts.svg ? this.fitSvg(l, l.opts.svg) : { w: Math.max(1, Math.round(l.box.clientWidth)), h: Math.max(1, Math.round(l.box.clientHeight)) };
    if (w === l.w && h === l.h && !l.opts.svg && !force) return;
    const sizeChanged = w !== l.w || h !== l.h || force;
    l.w = w;
    l.h = h;
    const res = this.dpr * (l.opts.resolution ?? 1);
    if (sizeChanged) {
      l.canvas.width = Math.max(1, Math.round(w * res));
      l.canvas.height = Math.max(1, Math.round(h * res));
    }
    l.backdrop.resize(this.context(l));
    // The shared drawing buffer only ever needs to fit the largest layer.
    const maxW = Math.max(...this.layers.map((x) => x.canvas.width));
    const maxH = Math.max(...this.layers.map((x) => x.canvas.height));
    const size = this.renderer.getSize(new THREE.Vector2());
    if (size.x < maxW || size.y < maxH) this.renderer.setSize(Math.max(size.x, maxW), Math.max(size.y, maxH), false);
    this.kick();
  }

  /**
   * Keeps the loop going. `continuing` = called from the end of a frame: the clock already
   * holds that frame's timestamp, so it must not be reset. (Resetting it to "now", after the
   * frame's work, made the next frame's time step negative on slow, software-rendered
   * browsers, and everything briefly ran backwards.) Only a fresh start resets the clock.
   */
  private kick(continuing = false) {
    if (this.stopped || this.raf || document.hidden || !this.layers.some((l) => l.visible)) return;
    if (!continuing) this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private pause() {
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  private frame = (now: number) => {
    this.raf = 0;
    // rAF timestamps can trail performance.now(): never let time step backwards.
    const realDt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    const dt = realDt * ANIMATION_SPEED;
    this.pointer.lerp(this.pointerTarget, 1 - Math.exp(-realDt * 3)); // ease, ~0.3 s to catch up
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
      if (!l.drawn) {
        l.drawn = true;
        this.grace = Math.max(this.grace, 0.75);
        l.opts.onFirstFrame?.();
      }
    }
    this.watchdog(performance.now() - start, realDt);
    if (!this.stopped) this.kick(true);
  };

  /**
   * About 1.5 s of choppy frames (after warm-up) and the engine steps down, one step at a time:
   * 1. render at a lower resolution; 2. hand every section back to its still SVG, except layers
   * marked `keep` (the Explore island, which has no picture to fall back to); 3. with no kept
   * layer left, stop. A calm still scene beats a stuttering one.
   */
  private watchdog(work: number, dt: number) {
    if (this.clock < 2 * ANIMATION_SPEED) return; // ~2 real seconds of warm-up
    if (this.grace > 0) {
      this.grace -= dt;
      return;
    }
    const slow = work > SLOW_MS || dt * 1000 > SLOW_MS * 1.5;
    this.slowTime = slow ? this.slowTime + dt : Math.max(0, this.slowTime - dt * 0.5);
    if (this.slowTime <= 1.5) return;
    this.slowTime = 0;
    if (this.dpr > 1) {
      console.info('[backdrop] frames ran slow: rendering the 3D at a lower resolution.');
      this.dpr = 1;
      this.layers.forEach((l) => this.measure(l, true));
    } else if (this.layers.some((l) => !l.opts.keep)) {
      console.info('[backdrop] frames still slow: the section scenes go back to their still art; the island keeps going.');
      for (const l of this.layers.filter((x) => !x.opts.keep)) this.remove(l);
      if (!this.layers.length) this.stop();
    } else if (!this.layers.length) {
      this.stop();
    }
  }

  /** Takes one layer out (its section shows its still art again). */
  private remove(l: Layer) {
    this.io.unobserve(l.section);
    this.ro.unobserve(l.box);
    l.canvas.remove();
    l.opts.onStop?.();
    this.layers = this.layers.filter((x) => x !== l);
  }

  /** Removes every layer (the SVG scenes are still there underneath) and frees the GPU. */
  stop() {
    this.stopped = true;
    this.pause();
    this.io.disconnect();
    this.ro.disconnect();
    for (const l of this.layers) {
      l.canvas.remove();
      l.opts.onStop?.();
    }
    this.layers = [];
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}
