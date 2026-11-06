/**
 * Past photos (#gallery, v3.1 spec 0.8.2).
 * - A photo link opens the lightbox (<dialog data-lightbox>) instead of the bare image file.
 * - Lightbox: ←/→ keys, the on-screen buttons and swipe move between photos; Esc and the
 *   close button close it; Tab stays inside; focus returns to the photo that was opened.
 * - The lights and photos stop swaying while the section is off-screen (data-paused).
 * Without JavaScript each photo is a plain link to its full-size file.
 */
export function initGallery(): void {
  const section = document.querySelector<HTMLElement>('[data-gallery]');
  if (!section) return;

  new IntersectionObserver(([entry]) => section.toggleAttribute('data-paused', !entry.isIntersecting), {
    rootMargin: '100px 0px',
  }).observe(section);

  const dialog = section.querySelector<HTMLDialogElement>('[data-lightbox]');
  const links = [...section.querySelectorAll<HTMLAnchorElement>('[data-gallery-open]')];
  if (!dialog || !links.length || typeof dialog.showModal !== 'function') return;

  const img = dialog.querySelector<HTMLImageElement>('[data-lb-img]')!;
  const avif = dialog.querySelector<HTMLSourceElement>('[data-lb-avif]')!;
  const caption = dialog.querySelector<HTMLElement>('[data-lb-caption]')!;
  const count = dialog.querySelector<HTMLElement>('[data-lb-count]')!;
  let current = 0;
  let opener: HTMLElement | null = null;

  const show = (i: number) => {
    current = (i + links.length) % links.length;
    const link = links[current];
    const thumb = link.querySelector('img');
    const figure = link.closest('figure');
    avif.srcset = link.dataset.avif ?? '';
    img.srcset = link.dataset.webp ?? '';
    img.src = link.dataset.full ?? link.href;
    img.alt = thumb?.alt ?? '';
    // Reserve the photo's shape so the frame doesn't jump while it loads.
    img.style.aspectRatio = link.dataset.ratio ?? '';
    caption.textContent = figure?.querySelector('figcaption')?.textContent ?? '';
    count.textContent = `${current + 1} / ${links.length}`;
  };

  links.forEach((link, i) =>
    link.addEventListener('click', (e) => {
      e.preventDefault();
      opener = link;
      show(i);
      dialog.showModal();
      dialog.querySelector<HTMLElement>('[data-lb-next]')?.focus();
    }),
  );

  dialog.querySelector('[data-lb-prev]')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('[data-lb-next]')?.addEventListener('click', () => show(current + 1));
  dialog.querySelector('[data-lb-close]')?.addEventListener('click', () => dialog.close());

  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      show(current - 1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      show(current + 1);
    } else if (e.key === 'Tab') {
      const focusable = [...dialog.querySelectorAll<HTMLElement>('button')];
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  // Click on the backdrop (outside the frame) closes; both ends of the click must be outside.
  let downOutside = false;
  dialog.addEventListener('pointerdown', (e) => (downOutside = e.target === dialog));
  dialog.addEventListener('click', (e) => {
    if (downOutside && e.target === dialog) dialog.close();
  });

  // Swipe left / right on the photo. Vertical drags still scroll (touch-action: pan-y).
  let startX = 0;
  let startY = 0;
  img.addEventListener('pointerdown', (e) => {
    startX = e.clientX;
    startY = e.clientY;
  });
  img.addEventListener('pointerup', (e) => {
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) show(current + (dx < 0 ? 1 : -1));
  });

  dialog.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    opener = null;
  });
}
