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

/**
 * Posts a form to the Google Apps Script web app behind the sponsor sheet
 * (backend/sponsor-sheet/Code.gs). A urlencoded POST is a "simple" cross-origin request (no
 * preflight); Apps Script answers through a redirect that allows any origin, so the JSON
 * reply can be read. `js=1` asks for JSON instead of the no-JavaScript thank-you page.
 * This sends for real in dev too, so the sheet can be tested locally (delete test rows).
 */
export async function postToSheet(form: HTMLFormElement, url: string): Promise<void> {
  const body = new URLSearchParams();
  new FormData(form).forEach((value, key) => body.append(key, String(value)));
  body.set('js', '1');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(`Sheet post failed: ${res.status}`);
  const reply = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
  if (!reply?.ok) throw new Error(reply?.error ?? 'Sheet post failed');
}
