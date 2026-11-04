/**
 * Posts a Netlify form (data-netlify) the way Netlify expects from JavaScript: urlencoded,
 * to "/", with the form-name field. Throws on anything but a 2xx.
 *
 * The dev server has no Netlify behind it, so in dev this only waits a moment and
 * succeeds, letting the loading and success states be checked locally.
 */
export async function postNetlifyForm(form: HTMLFormElement): Promise<void> {
  const body = new URLSearchParams();
  new FormData(form).forEach((value, key) => body.append(key, String(value)));
  if (import.meta.env.DEV) {
    await new Promise((r) => setTimeout(r, 700));
    console.info(`[dev] Netlify form "${body.get('form-name')}" not sent:`, Object.fromEntries(body));
    return;
  }
  const res = await fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Form post failed: ${res.status}`);
}
