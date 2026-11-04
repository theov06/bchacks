/** Dev-only entry: mounts the grey blockout into #world. Never imported by site pages. */
import { createRoot } from 'react-dom/client';
import { BlockoutScene } from './Blockout';

export function mountBlockout(el: HTMLElement) {
  const view = el.dataset.view === 'plan' ? 'plan' : 'hero';
  const q = new URLSearchParams(location.search);
  const labels = q.get('labels') !== '0' && !q.has('stage');
  createRoot(el).render(<BlockoutScene view={view} labels={labels} />);
}
