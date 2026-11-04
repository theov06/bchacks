import { postNetlifyForm } from './netlifyForm';

/** Email sign-up forms ([data-signup]): inline validation, then POST or demo confirmation. */
export function initSignup(root: ParentNode = document): void {
  root.querySelectorAll<HTMLFormElement>('[data-signup]').forEach((form) => {
    const input = form.querySelector<HTMLInputElement>('input[type=email]');
    const msg = form.querySelector<HTMLElement>('[data-signup-msg]');
    const btn = form.querySelector<HTMLButtonElement>('button[type=submit]');
    if (!input || !msg || !btn) return;

    const say = (tone: '' | 'ok' | 'error', text: string) => {
      msg.dataset.tone = tone;
      msg.textContent = text;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!input.checkValidity()) {
        input.setAttribute('aria-invalid', 'true');
        say('error', 'Enter an email address like name@school.ca.');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      btn.disabled = true;
      say('', 'Sending…');
      try {
        if (form.dataset.demo === 'true') {
          // No endpoint configured (site.notifyFormAction is empty): say so instead of faking success.
          const contact = form.dataset.contact ?? '';
          say('error', `Sign-ups aren't switched on yet. Email ${contact} and we'll add you to the list.`);
          return;
        }
        if (form.hasAttribute('data-netlify-form')) {
          await postNetlifyForm(form);
        } else {
          const res = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' },
          });
          if (!res.ok) throw new Error(String(res.status));
        }
        say('ok', "You're in. We'll email you the moment applications open.");
        form.reset();
      } catch {
        say('error', "That didn't go through. Try again, or email us instead.");
      } finally {
        btn.disabled = false;
      }
    });
  });
}
