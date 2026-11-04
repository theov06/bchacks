/**
 * Stat numbers count up once when they enter the viewport (M4). Skipped under
 * reduced motion; the final value is already in the HTML either way.
 */
export function initStats(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const nums = [...document.querySelectorAll<HTMLElement>('[data-count]')];
  if (!nums.length) return;

  const fmt = (n: number) => n.toLocaleString('en-CA');
  const run = (el: HTMLElement) => {
    const target = Number(el.dataset.count);
    if (!target) return;
    const { prefix = '', suffix = '' } = el.dataset;
    const start = performance.now();
    const duration = 1100;
    const tick = (t: number) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 4);
      el.textContent = `${prefix}${fmt(Math.round(target * eased))}${suffix}`;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        run(entry.target as HTMLElement);
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.6 },
  );
  nums.forEach((n) => io.observe(n));
}
