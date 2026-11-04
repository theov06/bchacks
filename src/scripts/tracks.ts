/**
 * Track rows ([data-track]) toggle open on click, tap, Enter or Space (A6).
 * Hover only highlights: expanding on hover would shove the rows below under the pointer.
 * Panels render open in the HTML so they read without JavaScript; this collapses them.
 */
export function initTracks(): void {
  document.querySelectorAll<HTMLElement>('[data-track]').forEach((row) => {
    const btn = row.querySelector<HTMLButtonElement>('button[aria-controls]');
    if (!btn) return;
    const set = (open: boolean) => {
      btn.setAttribute('aria-expanded', String(open));
      row.toggleAttribute('data-open', open);
    };
    set(false);
    btn.addEventListener('click', () => set(btn.getAttribute('aria-expanded') !== 'true'));
  });
}
