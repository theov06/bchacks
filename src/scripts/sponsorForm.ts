import { postNetlifyForm } from './netlifyForm';

/**
 * Sponsor pop-up (v3.1, spec 0.8.5). Any [data-sponsor-open] link opens the one
 * <dialog data-sponsor-dialog>; without JavaScript (or <dialog> support) the links just
 * navigate. Focus moves to the first field, Tab stays inside, Esc and the close buttons
 * close it, and focus goes back to the link that opened it.
 */
export function initSponsorForm(): void {
  const dialog = document.querySelector<HTMLDialogElement>('[data-sponsor-dialog]');
  const form = dialog?.querySelector<HTMLFormElement>('[data-sponsor-form]');
  if (!dialog || !form || typeof dialog.showModal !== 'function') return;

  const success = dialog.querySelector<HTMLElement>('[data-sponsor-success]')!;
  const thanks = dialog.querySelector<HTMLElement>('[data-sponsor-thanks]')!;
  const failure = dialog.querySelector<HTMLElement>('[data-sponsor-failure]')!;
  const submit = form.querySelector<HTMLButtonElement>('button[type=submit]')!;
  const submitLabel = submit.querySelector<HTMLElement>('[data-submit-label]')!;
  const inputs = [...form.querySelectorAll<HTMLInputElement>('input[required]')];
  const contact = dialog.dataset.contact ?? '';
  let opener: HTMLElement | null = null;
  let sending = false;

  const showForm = () => {
    form.hidden = false;
    success.hidden = true;
  };

  const open = (from: HTMLElement) => {
    opener = from;
    // After a successful send, opening again starts a fresh form.
    if (!success.hidden) {
      form.reset();
      showForm();
    }
    dialog.showModal();
    inputs[0]?.focus();
  };

  document.addEventListener('click', (e) => {
    const link = (e.target as Element | null)?.closest<HTMLElement>('[data-sponsor-open]');
    if (!link) return;
    e.preventDefault();
    open(link);
  });

  dialog.querySelectorAll('[data-sponsor-close]').forEach((b) => b.addEventListener('click', () => dialog.close()));

  // A click on the backdrop (the dialog box itself, outside the panel) closes it. Both
  // ends of the click must be outside, so selecting text and dragging out doesn't.
  let downOutside = false;
  dialog.addEventListener('pointerdown', (e) => (downOutside = e.target === dialog));
  dialog.addEventListener('click', (e) => {
    if (downOutside && e.target === dialog) dialog.close();
  });

  // Keep Tab inside the dialog (the modal makes the page inert; this also skips the browser chrome).
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = [...dialog.querySelectorAll<HTMLElement>('button, input:not([type=hidden]):not([tabindex="-1"]), a[href]')].filter(
      (el) => el.offsetParent !== null,
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  dialog.addEventListener('close', () => {
    opener?.focus({ preventScroll: true });
    opener = null;
  });

  // Inline errors: shown on submit, cleared as soon as the field is fixed.
  const check = (input: HTMLInputElement, show: boolean) => {
    const error = document.getElementById(input.getAttribute('aria-describedby') ?? '');
    const ok = input.value.trim() !== '' && input.checkValidity();
    if (ok) {
      input.removeAttribute('aria-invalid');
      if (error) error.textContent = '';
    } else if (show) {
      input.setAttribute('aria-invalid', 'true');
      if (error) error.textContent = input.dataset.error ?? 'Fill this in.';
    }
    return ok;
  };
  inputs.forEach((input) =>
    input.addEventListener('input', () => {
      if (input.hasAttribute('aria-invalid')) check(input, false);
    }),
  );

  const setSending = (on: boolean) => {
    sending = on;
    submit.toggleAttribute('data-loading', on);
    submit.setAttribute('aria-disabled', String(on));
    submitLabel.textContent = on ? 'Sending…' : 'Send me the deck';
  };

  const fail = () => {
    failure.textContent = "That didn't go through. Try again, or email us at ";
    const a = document.createElement('a');
    a.href = `mailto:${contact}`;
    a.textContent = contact;
    failure.append(a, '.');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (sending) return;
    failure.textContent = '';
    const invalid = inputs.filter((input) => !check(input, true));
    if (invalid.length) {
      invalid[0].focus();
      return;
    }
    if (form.dataset.live !== 'true') {
      fail();
      return;
    }
    setSending(true);
    try {
      await postNetlifyForm(form);
      const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
      // Promise "a few minutes" only while the deck auto-email is set up (site.sponsorForm.autoEmail).
      thanks.textContent =
        dialog.dataset.autoEmail === 'true'
          ? `Thanks, ${name}! We will send our sponsorship deck to your email in a few minutes.`
          : `Thanks, ${name}! We'll email you our sponsorship deck shortly.`;
      form.hidden = true;
      success.hidden = false;
      thanks.focus();
    } catch {
      fail();
    } finally {
      setSending(false);
    }
  });
}
