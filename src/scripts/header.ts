/**
 * Header behaviour:
 * - data-scrolled after 40px of scroll (sentinel + IntersectionObserver, no scroll listener; M6)
 * - aria-current on the nav link for the section in view (only once its heading passes mid-screen)
 * - phone menu: native modal <dialog> (focus containment and Esc come from the browser)
 * - --notice-h: measured height of the announcement bar (page tops pad below it)
 */
export function initHeader(): void {
  // The announcement bar overlays the page top; publish its real height for page padding.
  const notice = document.querySelector<HTMLElement>('[data-notice]');
  if (notice) {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty('--notice-h', `${notice.offsetHeight}px`);
    }).observe(notice);
  }

  const header = document.querySelector<HTMLElement>('[data-header]');
  if (header) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:40px;left:0;width:1px;height:1px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(([entry]) => {
      header.toggleAttribute('data-scrolled', !entry.isIntersecting);
    }).observe(sentinel);
  }

  // Underline a section's link only once that section is really in view: its heading has
  // scrolled above the middle of the screen and the section still covers the middle. At the
  // top of the page (hero in view) and between nav sections, nothing is underlined.
  const navLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')];
  const targets = navLinks
    .map((a) => (a.pathname === location.pathname ? document.getElementById(a.hash.slice(1)) : null))
    .filter((el): el is HTMLElement => el !== null);
  if (targets.length) {
    let current: string | null | undefined;
    let queued = false;
    const update = () => {
      queued = false;
      const mid = innerHeight / 2;
      let active: string | null = null;
      for (const section of targets) {
        const heading = section.querySelector('h2') ?? section;
        if (heading.getBoundingClientRect().top <= mid && section.getBoundingClientRect().bottom > mid) active = section.id;
      }
      if (active === current) return;
      current = active;
      for (const a of navLinks) {
        if (active && a.hash === `#${active}`) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      }
    };
    const queue = () => {
      if (!queued) {
        queued = true;
        requestAnimationFrame(update);
      }
    };
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue, { passive: true });
    update();
  }

  const menu = document.querySelector<HTMLDialogElement>('[data-menu]');
  const openBtn = document.querySelector<HTMLButtonElement>('[data-menu-open]');
  const closeBtn = document.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!menu || !openBtn || !closeBtn || typeof menu.showModal !== 'function') return;

  openBtn.addEventListener('click', () => {
    menu.showModal();
    openBtn.setAttribute('aria-expanded', 'true');
    document.documentElement.style.overflow = 'hidden';
  });
  closeBtn.addEventListener('click', () => menu.close());
  // Following an in-page link closes the menu; the browser then scrolls to the target.
  menu.querySelectorAll('[data-menu-link]').forEach((a) => a.addEventListener('click', () => menu.close()));
  menu.addEventListener('close', () => {
    openBtn.setAttribute('aria-expanded', 'false');
    document.documentElement.style.overflow = '';
  });
  matchMedia('(min-width: 900px)').addEventListener('change', (m) => {
    if (m.matches && menu.open) menu.close();
  });
}
