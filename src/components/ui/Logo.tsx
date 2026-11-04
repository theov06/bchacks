import { cx } from '../../lib/ui';
import { LOGO_B, LOGO_C } from '../../lib/logoGeometry';
import styles from './Logo.module.css';

export interface LogoProps {
  /** Unique per page: gradient, filter and clip ids must not collide between instances. */
  id: string;
  className?: string;
  /** Blueprint reveal once per visit (M1). Never delays text. */
  animate?: boolean;
  /** Hide from assistive tech when a sibling already names the brand. */
  decorative?: boolean;
  title?: string;
  /**
   * Background the logo sits on (spec 6B).
   * 'dark': sky gradient + soft outer glow. 'light': darker gradient, no glow.
   */
  surface?: 'dark' | 'light';
}

// Shared with the 3D landmark (src/lib/logoGeometry.ts).
const B = LOGO_B;
const C = LOGO_C;

// The logo's own gradients (D2). Mostly top to bottom with a slight diagonal.
const STOPS = {
  dark: [
    [0, '#B5ECFF'],
    [0.45, '#84DBF7'],
    [1, '#3B82F6'],
  ],
  light: [
    [0, '#1E7FB8'],
    [1, '#1D4ED8'],
  ],
} as const;

// Construction geometry for the reveal: guides along the logo's own 30° edges and verticals,
// plus CSCU-style circles. Drawn outside the viewBox (the svg has overflow: visible).
const GUIDES = [
  'M282 96 V690', // B stem, outer edge
  'M527 96 V690', // right edge
  'M232 310 L577 102', // B top bevel, 30°
  'M240 186 L600 392', // C lower arm, -30°
  'M330 608 L600 456', // B bowl, 30°
  'M196 637 H614', // baseline
];
const CIRCLES: [number, number, number][] = [
  [405, 390, 158],
  [405, 390, 236],
  [434, 532, 64],
];

function Shapes({ className }: { className?: string }) {
  return (
    <>
      <polygon className={className} points={B} pathLength={1} />
      <polygon className={cx(className, styles.c)} points={C} pathLength={1} />
    </>
  );
}

export function Logo({ id, className, animate = false, decorative = false, title = 'BCHacks', surface = 'dark' }: LogoProps) {
  const gid = `logo-grad-${id}`;
  const fid = `logo-glow-${id}`;
  const paint = `url(#${gid})`;

  return (
    <svg
      className={cx(styles.logo, animate && styles.draw, className)}
      data-surface={surface}
      viewBox="276 131 257 512"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : title}
      aria-hidden={decorative ? 'true' : undefined}
      focusable="false"
    >
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1="440" y1="137" x2="370" y2="637">
          {STOPS[surface].map(([o, c]) => (
            <stop key={o} offset={o} stopColor={c} />
          ))}
        </linearGradient>
        {animate && (
          <filter id={fid} x="-30%" y="-15%" width="160%" height="130%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        )}
      </defs>

      {animate && (
        // #84DBF7 is --sky, #1E7FB8 is --sky-dark: SVG paint attributes can't read CSS variables.
        <g className={styles.guides} fill="none" stroke={surface === 'dark' ? '#84DBF7' : '#1E7FB8'} strokeWidth={1.5}>
          {CIRCLES.map(([cx_, cy, r]) => (
            <circle key={r} className={styles.guide} cx={cx_} cy={cy} r={r} pathLength={1} />
          ))}
          {GUIDES.map((d) => (
            <path key={d} className={styles.guide} d={d} pathLength={1} />
          ))}
        </g>
      )}

      {/* Fill only, no stroke: the exact clean-SVG shape, identical to the favicon, social card and 3D landmark. */}
      <g className={styles.fill} fill={paint}>
        <Shapes />
      </g>

      {animate && (
        <g className={styles.trace} fill="none" stroke={surface === 'dark' ? '#84DBF7' : '#1E7FB8'} strokeWidth={5} strokeLinejoin="miter" filter={`url(#${fid})`}>
          <Shapes className={styles.line} />
        </g>
      )}
    </svg>
  );
}

export default Logo;
