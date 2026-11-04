import { site } from '../../../content/site';
import { cx } from '../../lib/ui';
import buttonStyles from './Button.module.css';
import { Icon } from './Icon';
import styles from './SponsorDialog.module.css';

interface Field {
  name: 'name' | 'company' | 'email';
  label: string;
  type: 'text' | 'email';
  autoComplete: string;
  /** Shown under the field when it's empty or invalid. */
  error: string;
}

const fields: Field[] = [
  { name: 'name', label: 'Name', type: 'text', autoComplete: 'name', error: 'Enter your name.' },
  { name: 'company', label: 'Company', type: 'text', autoComplete: 'organization', error: 'Enter your company or organization.' },
  { name: 'email', label: 'Email', type: 'email', autoComplete: 'email', error: 'Enter an email address like name@company.com.' },
];

/**
 * The sponsor pop-up (v3.1, spec 0.8.5), on every page. Every sponsor CTA carries
 * data-sponsor-open and opens it; without JavaScript those stay plain links.
 * The form is a Netlify form ("sponsor"), so it has to be in the pre-rendered HTML.
 * Behaviour: src/scripts/sponsorForm.ts.
 */
export function SponsorDialog() {
  return (
    <dialog
      id="sponsor-dialog"
      className={styles.dialog}
      aria-labelledby="sponsor-dialog-title"
      data-sponsor-dialog=""
      data-auto-email={site.sponsorForm.autoEmail ? 'true' : undefined}
      data-contact={site.sponsorEmail}
    >
      <div className={cx('on-cream', styles.panel)}>
        <div className={styles.top}>
          <h2 id="sponsor-dialog-title" className={styles.title}>
            Sponsor {site.edition}
          </h2>
          <button type="button" className={styles.close} data-sponsor-close="">
            <Icon name="close" />
            <span className="visually-hidden">Close</span>
          </button>
        </div>

        <form
          className={styles.form}
          name="sponsor"
          method="post"
          action="/"
          data-netlify="true"
          netlify-honeypot="bot-field"
          data-sponsor-form=""
          data-live={site.netlifyForms ? 'true' : undefined}
          noValidate
        >
          <input type="hidden" name="form-name" value="sponsor" />
          <p className={styles.lede}>Tell us who you are and we'll send you our sponsorship deck.</p>

          {/* Honeypot: people never see it; bots that fill it in are dropped by Netlify. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Leave this empty
              <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>

          {fields.map((f) => (
            <div key={f.name} className={styles.field}>
              <label htmlFor={`sp-${f.name}`} className={styles.label}>
                {f.label}
              </label>
              <input
                id={`sp-${f.name}`}
                className={styles.input}
                name={f.name}
                type={f.type}
                autoComplete={f.autoComplete}
                {...(f.type === 'email' ? { inputMode: 'email' as const, spellCheck: false } : {})}
                required
                aria-describedby={`sp-${f.name}-error`}
                data-error={f.error}
              />
              <p id={`sp-${f.name}-error`} className={styles.error} data-field-error="" />
            </div>
          ))}

          <p className={styles.note}>We'll only use this to send you our sponsorship deck and follow up.</p>

          <button type="submit" className={cx(buttonStyles.btn, buttonStyles.primary, buttonStyles.sun, styles.submit)}>
            <span className={styles.spinner} aria-hidden="true" />
            <span data-submit-label="">Send me the deck</span>
          </button>
          <p className={styles.failure} role="alert" data-sponsor-failure="" />
        </form>

        <div className={styles.success} data-sponsor-success="" hidden>
          <p className={styles.thanks} tabIndex={-1} data-sponsor-thanks="" />
          <button type="button" className={cx(buttonStyles.btn, buttonStyles.outline)} data-sponsor-close="">
            <span>Close</span>
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default SponsorDialog;
