/** Dev-only entry: mounts the landmark studio into #world. Never imported by site pages. */
import { createRoot } from 'react-dom/client';
import { LandmarkStudio, type LandmarkView } from './LandmarkStudio';

export function mountLandmark(el: HTMLElement) {
  createRoot(el).render(<LandmarkStudio view={(el.dataset.view as LandmarkView) || 'three-quarter'} />);
}
