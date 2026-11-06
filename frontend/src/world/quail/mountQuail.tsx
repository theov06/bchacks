/** Dev-only entry: mounts the quail studio into #world. Never imported by site pages. */
import { createRoot } from 'react-dom/client';
import { QuailStudio, type QuailView } from './QuailStudio';

export function mountQuail(el: HTMLElement) {
  createRoot(el).render(<QuailStudio view={(el.dataset.view as QuailView) || 'three-quarter'} />);
}
