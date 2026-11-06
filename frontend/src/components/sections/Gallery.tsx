import { gallery, galleryIntro, type GalleryPhoto } from '../../../content/gallery';
import { cx, type StyleVars } from '../../lib/ui';
import { Icon } from '../ui/Icon';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './Gallery.module.css';

/** Wire shape: a quadratic sag. Ends sit WIRE_TOP px down; the middle hangs SAG px lower. */
const WIRE_TOP = 6;
const SAG = 56;
const wireY = (t: number) => WIRE_TOP + 4 * SAG * t * (1 - t);

/** Fixed, varied tilts (−4° to 4°) so the build is stable and neighbours never match. */
const TILTS = [-3, 2.5, -1.5, 3.5, -2.5, 1.5, -3.5, 2, -1, 3];
const BULBS = 13;

const srcset = (p: GalleryPhoto, ext: 'avif' | 'webp') => p.widths.map((w) => `/images/past/${p.src}-${w}.${ext} ${w}w`).join(', ');
const largest = (p: GalleryPhoto) => `/images/past/${p.src}-${Math.max(...p.widths)}.webp`;
const captionText = (p: GalleryPhoto) => (p.year ? `${p.year} · ${p.caption}` : p.caption);

/** Splits the photos into strings: two on desktop (at most five each), one if there are only a few. */
function strings(photos: GalleryPhoto[]): GalleryPhoto[][] {
  const count = photos.length < 4 ? 1 : Math.max(2, Math.ceil(photos.length / 5));
  const per = Math.ceil(photos.length / count);
  return Array.from({ length: count }, (_, i) => photos.slice(i * per, (i + 1) * per)).filter((s) => s.length);
}

function Polaroid({ photo, index }: { photo: GalleryPhoto; index: number }) {
  if (!photo.src) {
    return (
      <figure className={styles.polaroid}>
        <div className={styles.soon}>
          <Icon name="camera" size={32} />
          <span>Photo coming soon</span>
        </div>
        <figcaption className={styles.caption}>{captionText(photo)}</figcaption>
      </figure>
    );
  }
  return (
    <figure className={styles.polaroid}>
      {/* A real link to the full photo, so it opens without JavaScript; with it, the lightbox opens instead. */}
      <a
        className={styles.photo}
        href={largest(photo)}
        data-gallery-open={index}
        data-avif={srcset(photo, 'avif')}
        data-webp={srcset(photo, 'webp')}
        data-full={largest(photo)}
        data-ratio={photo.width / photo.height}
      >
        <picture>
          <source type="image/avif" srcSet={srcset(photo, 'avif')} sizes="(max-width: 759px) 220px, 300px" />
          <img
            src={`/images/past/${photo.src}-480.webp`}
            srcSet={srcset(photo, 'webp')}
            sizes="(max-width: 759px) 220px, 300px"
            alt={photo.alt}
            width={photo.width}
            height={photo.height}
            loading="lazy"
            decoding="async"
            style={photo.focus ? { objectPosition: photo.focus } : undefined}
          />
        </picture>
        <span className="visually-hidden"> (opens a larger view)</span>
      </a>
      <figcaption className={styles.caption}>{captionText(photo)}</figcaption>
    </figure>
  );
}

/**
 * Past photos (#gallery, v3.1 spec 0.8.2) under the night sky (v3 scene 3): polaroids
 * clipped to softly glowing strings of fairy lights. Two strings on desktop, one swipeable
 * row on phones. A photo opens the lightbox (src/scripts/gallery.ts).
 */
export function Gallery() {
  let index = 0;
  // The lightbox starts on the first photo; the script swaps in whichever one is opened.
  const first = gallery.find((p) => p.src);
  return (
    <section id="gallery" className={cx('scene-section', styles.gallery)} aria-labelledby="gallery-title" data-gallery="">
      <Scene name="tracks" />
      <div className="container">
        <SectionHead
          id="gallery-title"
          eyebrow={galleryIntro.eyebrow}
          title={galleryIntro.heading}
          highlight={galleryIntro.highlight}
          lede={galleryIntro.lede}
        />
      </div>

      <div className={styles.strings}>
        {strings(gallery).map((row, r) => (
          <div key={r} className={styles.string} style={{ '--count': row.length } as StyleVars}>
            <div className={styles.lights} aria-hidden="true">
              <svg className={styles.wire} viewBox="0 0 1000 100" preserveAspectRatio="none" focusable="false">
                <path d={`M0,${WIRE_TOP} Q500,${WIRE_TOP + 2 * SAG} 1000,${WIRE_TOP}`} vectorEffect="non-scaling-stroke" />
              </svg>
              {Array.from({ length: BULBS }, (_, b) => {
                const t = (b + 0.5) / BULBS;
                return <span key={b} className={styles.bulb} style={{ '--x': `${t * 100}%`, '--y': `${wireY(t)}px`, '--i': b } as StyleVars} />;
              })}
            </div>
            <ul role="list" className={styles.photos}>
              {row.map((photo, i) => {
                const n = index++;
                const t = (i + 0.5) / row.length;
                return (
                  <li
                    key={n}
                    className={styles.hang}
                    style={{ '--drop': `${wireY(t)}px`, '--tilt': `${TILTS[n % TILTS.length]}deg`, '--n': n } as StyleVars}
                  >
                    {/* The clip and photo swing together from the wire. */}
                    <div className={styles.swing}>
                      <span className={styles.clip} aria-hidden="true" />
                      <Polaroid photo={photo} index={n} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      <dialog className={styles.lightbox} aria-label="Photo viewer" data-lightbox="">
        <div className={cx('on-cream', styles.lbFrame)}>
          <button type="button" className={cx(styles.lbBtn, styles.lbClose)} data-lb-close="">
            <Icon name="close" />
            <span className="visually-hidden">Close</span>
          </button>
          <figure className={styles.lbFigure}>
            <picture>
              <source type="image/avif" data-lb-avif="" sizes="min(92vw, 1200px)" />
              <img
                className={styles.lbImg}
                data-lb-img=""
                src={first ? largest(first) : undefined}
                alt={first?.alt ?? ''}
                sizes="min(92vw, 1200px)"
                loading="lazy"
                decoding="async"
              />
            </picture>
            <figcaption className={styles.lbCaption}>
              <span data-lb-caption="" />
              <span className={cx('mono', styles.lbCount)} data-lb-count="" />
            </figcaption>
          </figure>
          <div className={styles.lbNav}>
            <button type="button" className={styles.lbBtn} data-lb-prev="">
              <Icon name="chevronLeft" />
              <span className="visually-hidden">Previous photo</span>
            </button>
            <button type="button" className={styles.lbBtn} data-lb-next="">
              <Icon name="chevronRight" />
              <span className="visually-hidden">Next photo</span>
            </button>
          </div>
        </div>
      </dialog>
    </section>
  );
}

export default Gallery;
