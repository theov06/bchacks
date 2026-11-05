import { site } from '../../../content/site';
import { Icon } from './Icon';
import styles from './SignupForm.module.css';

export interface SignupFormProps {
  /** Unique per page; prefixes the input and message ids. */
  id: string;
  label: string;
}

/**
 * Email capture. Goes to site.notifyFormAction if set, else the team's Google Sheet (the
 * sponsor form's web app, "Notify list" tab), else the "notify" Netlify form. With none,
 * it tells the visitor to email the team instead of pretending to subscribe them.
 * Behaviour: src/scripts/signup.ts.
 */
export function SignupForm({ id, label }: SignupFormProps) {
  const sheet = site.notifyFormAction ? '' : site.sponsorForm.sheetUrl;
  const netlify = !site.notifyFormAction && !sheet && site.netlifyForms;
  const action = site.notifyFormAction || sheet || (netlify ? '/' : undefined);
  const inputId = `${id}-email`;
  const msgId = `${id}-msg`;
  return (
    <form
      className={styles.form}
      method="post"
      action={action}
      data-signup=""
      data-demo={action ? undefined : 'true'}
      data-contact={site.contactEmail}
      data-sheet={sheet || undefined}
      noValidate
      {...(netlify ? { name: 'notify', 'data-netlify': 'true', 'netlify-honeypot': 'bot-field', 'data-netlify-form': '' } : {})}
    >
      {sheet && <input type="hidden" name="form" value="notify" />}
      {(netlify || sheet) && (
        <>
          {netlify && <input type="hidden" name="form-name" value="notify" />}
          <div className={styles.honeypot} aria-hidden="true">
            <label>
              Leave this empty
              <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </div>
        </>
      )}
      <label htmlFor={inputId} className={styles.label}>
        {label}
      </label>
      <div className={styles.row}>
        <input
          id={inputId}
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          placeholder="cws@student.ubc.ca"
          required
          aria-describedby={msgId}
        />
        <button type="submit" className={styles.submit}>
          <span>Notify me</span>
          <Icon name="arrow" size={20} />
        </button>
      </div>
      <p id={msgId} className={styles.msg} role="status" aria-live="polite" data-signup-msg="">
        One email when applications open. No spam.
      </p>
    </form>
  );
}

export default SignupForm;
