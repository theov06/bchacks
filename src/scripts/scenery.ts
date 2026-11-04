/**
 * Animates the hero's twilight scenery (public/okanagan-night.svg).
 * The page ships a plain <img> (works without JS and under reduced motion). After load,
 * if motion is allowed, this swaps in an inline copy so its layers can move:
 *   - parallax on pointer and scroll (transform only, rAF, only while the hero is on screen)
 *   - twinkling stars, a slowly shifting aurora and drifting fireflies (CSS, Hero.module.css)
 * Layer ids are prefixed with "okn-" so they can't collide with page ids.
 */
const PREFIX = 'okn-';
/** Parallax depth per layer: 0 = fixed, 1 = moves most (nearest). */
const DEPTH: Record<string, number> = {
  aurora: 0.12,
  stars: 0.08,
  moon: 0.18,
  clouds: 0.3,
  far: 0.35,
  mid: 0.55,
  lake: 0.7,
  near: 0.9,
  pines: 1,
  details: 1,
};
const POINTER_PX = 14; // max horizontal pointer shift for depth 1 (viewBox units)
const SCROLL_K = 0.12; // scroll parallax for depth 1

function prefixIds(svg: string) {
  return svg
    .replace(/\bid="([^"]+)"/g, `id="${PREFIX}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${PREFIX}$1)`)
    .replace(/href="#([^"]+)"/g, `href="#${PREFIX}$1"`);
}

export function initScenery(): void {
  const box = document.querySelector<HTMLElement>('[data-scenery]');
  const img = box?.querySelector<HTMLImageElement>('[data-scenery-art]');
  if (!box || !img) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const run = async () => {
    let text: string;
    try {
      const res = await fetch(img.currentSrc || img.src);
      if (!res.ok) return;
      text = await res.text();
    } catch {
      return; // the static image stays
    }
    const doc = new DOMParser().parseFromString(prefixIds(text), 'image/svg+xml');
    const svg = doc.documentElement as unknown as SVGSVGElement;
    if (svg.nodeName !== 'svg') return;
    svg.setAttribute('class', img.className);
    svg.setAttribute('aria-hidden', 'true');
    svg.setAttribute('focusable', 'false');
    svg.removeAttribute('role');
    svg.querySelector('title')?.remove();
    svg.dataset.animated = '';
    img.replaceWith(document.importNode(svg, true));

    const live = box.querySelector('svg')!;
    const layers = Object.entries(DEPTH)
      .map(([id, depth]) => ({ el: live.getElementById(PREFIX + id) as SVGGElement | null, depth }))
      .filter((l): l is { el: SVGGElement; depth: number } => !!l.el);

    let px = 0; // pointer -0.5..0.5
    let py = 0;
    let sx = 0; // smoothed
    let sy = 0;
    let raf = 0;
    let onScreen = true;
    const frame = () => {
      raf = 0;
      sx += (px - sx) * 0.08;
      sy += (py - sy) * 0.08;
      const scroll = Math.min(window.scrollY, box.offsetHeight);
      for (const { el, depth } of layers) {
        const x = -sx * POINTER_PX * depth;
        const y = -sy * POINTER_PX * 0.5 * depth + scroll * SCROLL_K * depth;
        el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      }
      if (onScreen && (Math.abs(px - sx) > 0.001 || Math.abs(py - sy) > 0.001)) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && onScreen) raf = requestAnimationFrame(frame);
    };
    if (matchMedia('(pointer: fine)').matches) {
      addEventListener(
        'pointermove',
        (e) => {
          px = e.clientX / innerWidth - 0.5;
          py = e.clientY / innerHeight - 0.5;
          kick();
        },
        { passive: true },
      );
    }
    addEventListener('scroll', kick, { passive: true });
    new IntersectionObserver(([e]) => {
      onScreen = e.isIntersecting;
      // CSS animations (stars, aurora, fireflies) pause off-screen too.
      live.toggleAttribute('data-paused', !onScreen);
      kick();
    }).observe(box);
    kick();
  };

  const idle = (cb: () => void) => ('requestIdleCallback' in window ? requestIdleCallback(cb, { timeout: 2000 }) : setTimeout(cb, 300));
  if (document.readyState === 'complete') idle(run);
  else addEventListener('load', () => idle(run), { once: true });
}
