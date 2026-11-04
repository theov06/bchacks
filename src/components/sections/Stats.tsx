import { stats } from '../../../content/stats';
import { cx, type StyleVars } from '../../lib/ui';
import styles from './Stats.module.css';

const fmt = (n: number) => n.toLocaleString('en-CA');

/**
 * Stats as an interlocking honeycomb: pointy-top hexagons, two per row, every
 * second row shifted half a cell so the edges nest. Only confirmed numbers;
 * the section disappears when nothing is visible. Count-up: src/scripts/stats.ts.
 */
export function Stats() {
  const visible = stats.filter((s) => s.visible);
  if (visible.length === 0) return null;

  const rows = Math.ceil(visible.length / 2);
  const comb: StyleVars = {
    '--cols': visible.length > 1 ? 2 : 1,
    '--shift': rows > 1 ? 0.5 : 0,
    '--rows': rows,
  };

  return (
    <section id="stats" className={cx('section', styles.stats)} aria-labelledby="stats-title">
      <div className={cx('container', 'grid')}>
        <div className={styles.head}>
          <p className="eyebrow" aria-hidden="true">
            By the numbers
          </p>
          <h2 id="stats-title" className={styles.title}>
            The weekend in <span className="sky-text">numbers</span>
          </h2>
        </div>
        <ul role="list" className={styles.comb} style={comb}>
          {visible.map((s, i) => {
            const row = Math.floor(i / 2);
            const cell: StyleVars = { '--x': (i % 2) + (row % 2) * 0.5, '--y': row };
            return (
              <li key={s.label} className={styles.cell} style={cell}>
                <span
                  className={cx('mono', styles.num)}
                  data-count={s.value}
                  data-prefix={s.prefix ?? ''}
                  data-suffix={s.suffix ?? ''}
                >
                  {s.prefix}
                  {fmt(s.value)}
                  {s.suffix}
                </span>
                <span className={styles.label}>{s.label}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export default Stats;
