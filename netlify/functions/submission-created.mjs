/**
 * Netlify runs this after every verified (non-spam) Netlify Forms submission.
 * For the "sponsor" form it emails the sponsor a link to the sponsorship deck via Resend.
 * The team's own copy of the lead comes from the form notification set in the Netlify UI.
 *
 * Environment variables (Netlify → Site configuration → Environment variables; never in the repo):
 *   RESEND_API_KEY   Resend API key with sending access
 *   DECK_FROM        sender on a domain verified in Resend, e.g. "BCHacks <sponsor@bchacks.ca>"
 *   DECK_URL         public link to the deck PDF
 *   DECK_REPLY_TO    optional; where sponsor replies go (defaults to DECK_FROM)
 *
 * Once this works end to end, set site.sponsorForm.autoEmail to true in content/site.ts.
 */
const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export const handler = async (event) => {
  const { payload } = JSON.parse(event.body ?? '{}');
  if (payload?.form_name !== 'sponsor') return { statusCode: 200, body: 'Not the sponsor form.' };

  const { RESEND_API_KEY, DECK_FROM, DECK_URL, DECK_REPLY_TO } = process.env;
  if (!RESEND_API_KEY || !DECK_FROM || !DECK_URL) {
    console.error('Deck email not sent: set RESEND_API_KEY, DECK_FROM and DECK_URL.');
    return { statusCode: 200, body: 'Deck email not configured.' };
  }

  const name = String(payload.data?.name ?? '').trim().slice(0, 100);
  const email = String(payload.data?.email ?? '').trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { statusCode: 200, body: 'No valid email.' };

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: DECK_FROM,
      to: [email],
      reply_to: DECK_REPLY_TO || DECK_FROM,
      subject: 'The BCHacks 2026 sponsorship deck',
      text: `Hi ${name},\n\nThanks for your interest in sponsoring BCHacks 2026. Here's our sponsorship deck:\n${DECK_URL}\n\nReply to this email with any questions.\n\nThe BCHacks team`,
      html: `<p>Hi ${escape(name)},</p><p>Thanks for your interest in sponsoring BCHacks 2026. Here's our sponsorship deck:</p><p><a href="${escape(DECK_URL)}">Download the BCHacks 2026 sponsorship deck (PDF)</a></p><p>Reply to this email with any questions.</p><p>The BCHacks team</p>`,
    }),
  });
  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
    return { statusCode: 502, body: 'Deck email failed.' };
  }
  return { statusCode: 200, body: 'Deck email sent.' };
};
