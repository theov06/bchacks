import { schedule } from '../../../content/schedule';
import { Placeholder } from '../ui/Placeholder';
import styles from './Schedule.module.css';

export interface ScheduleProps {
  /** Prefix for day heading ids; must be unique per page. */
  id?: string;
}

/**
 * Two-day timeline. Lays itself out by its own width (container query), so the
 * same component works in the home section and in a /live panel. Empty data
 * shows the themed placeholder, never "TBD".
 */
export function Schedule({ id = 'schedule' }: ScheduleProps) {
  if (schedule.length === 0) {
    return <Placeholder title="Schedule coming soon" text="We'll post the full weekend timeline here a few weeks before the event." />;
  }
  return (
    <div className={styles.schedule}>
      {schedule.map((day, d) => {
        const headingId = `${id}-day-${d}`;
        return (
          <section key={day.day} className={styles.day} aria-labelledby={headingId}>
            <h3 id={headingId} className={styles.dayTitle}>
              {day.day} <span className="mono">{day.date}</span>
            </h3>
            <ol role="list" className={styles.slots}>
              {day.items.map((item) => (
                <li key={`${item.time}-${item.title}`} className={styles.slot}>
                  <time className={styles.time}>{item.time}</time>
                  <span className={styles.what}>{item.title}</span>
                  {item.location && <span className={styles.where}>{item.location}</span>}
                </li>
              ))}
            </ol>
          </section>
        );
      })}
    </div>
  );
}

export default Schedule;
