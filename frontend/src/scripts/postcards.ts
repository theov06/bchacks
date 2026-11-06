/**
 * Phone Explore postcards (About.tsx, [data-postcards]): lights the dot of the card in view.
 * The cards scroll and snap with CSS alone; this only keeps the dots in step.
 */
export function initPostcards(): void {
  const nav = document.querySelector<HTMLElement>('[data-postcards]');
  const track = nav?.querySelector<HTMLElement>('ol');
  if (!nav || !track) return;
  const cards = [...track.children] as HTMLElement[];
  const dots = [...nav.querySelectorAll<HTMLElement>('[data-dot]')];
  if (!cards.length || cards.length !== dots.length) return;

  const show = (i: number) => dots.forEach((d, j) => (j === i ? d.setAttribute('data-active', 'true') : d.removeAttribute('data-active')));

  // The card most in view wins; the observer only runs while the row is on a phone layout.
  const seen = new Map<Element, number>();
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => seen.set(e.target, e.intersectionRatio));
      let best = 0;
      cards.forEach((c, i) => {
        if ((seen.get(c) ?? 0) > (seen.get(cards[best]) ?? 0)) best = i;
      });
      show(best);
    },
    { root: track, threshold: [0.25, 0.5, 0.75, 1] },
  );
  cards.forEach((c) => io.observe(c));
}
