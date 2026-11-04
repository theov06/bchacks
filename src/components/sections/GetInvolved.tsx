import { roles, rolesIntro } from '../../../content/roles';
import { cx, type StyleVars } from '../../lib/ui';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './GetInvolved.module.css';

/**
 * Get involved (#involved): out on the lake (v3 scene 6). Dark ink text on the turquoise
 * water. The three role cards stay in the left ~820px so the boats stay visible on the right.
 */
export function GetInvolved() {
  return (
    <section id="involved" className={cx('scene-section', styles.involved)} aria-labelledby="involved-title">
      <Scene name="involved" />
      <div className="container">
        <div className={styles.column}>
          <SectionHead id="involved-title" eyebrow={rolesIntro.eyebrow} title={rolesIntro.heading} highlight={rolesIntro.highlight} lede={rolesIntro.lede} />
          <ul role="list" className={styles.cards}>
            {roles.map((r) => (
              <li key={r.title} className={cx('sticker', styles.card)} style={{ '--tone': `var(--${r.tone})` } as StyleVars}>
                <span className={styles.icon} aria-hidden="true">
                  <Icon name={r.icon} size={26} />
                </span>
                <h3>{r.title}</h3>
                <p>{r.description}</p>
                <Button href={r.formUrl} tone={r.tone} size="sm" external className={styles.cta}>
                  {r.cta}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export default GetInvolved;
