import { faq, faqIntro } from '../../../content/faq';
import { richText } from '../../lib/richText';
import { cx } from '../../lib/ui';
import { Icon } from '../ui/Icon';
import { Scene } from '../ui/Scene';
import { SectionHead } from '../ui/SectionHead';
import styles from './Faq.module.css';

/**
 * FAQ (#faq): below the surface (v3 scene 7). Native <details> accordions in a grid on dark
 * translucent panels; all start closed (content/faq.ts openCount). Keyboard and screen-reader support come
 * from the browser, and every answer is in the HTML. The scene's deep shadow stays in view
 * below the questions.
 */
export function Faq() {
  return (
    <section id="faq" className={cx('scene-section', styles.faq)} aria-labelledby="faq-title">
      <Scene name="faq" />
      <div className="container">
        <SectionHead
          id="faq-title"
          eyebrow={faqIntro.eyebrow}
          title={faqIntro.heading}
          highlight={faqIntro.highlight}
          lede={<span dangerouslySetInnerHTML={{ __html: richText(faqIntro.lede) }} />}
        />
        <div className={styles.grid}>
          {faq.map((item, i) => (
            <details key={item.question} className={styles.qa} open={i < faqIntro.openCount || undefined}>
              <summary className={styles.q}>
                <span>{item.question}</span>
                <span className={styles.qIcon} aria-hidden="true">
                  <Icon name="plus" size={18} />
                </span>
              </summary>
              <p className={styles.a} dangerouslySetInnerHTML={{ __html: richText(item.answer) }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Faq;
