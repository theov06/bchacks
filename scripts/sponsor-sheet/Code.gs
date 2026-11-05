/**
 * BCHacks forms → Google Sheet.
 *
 * Paste this into the Sheet's Apps Script editor (Extensions → Apps Script) and deploy it as
 * a web app (setup: README "Sponsor form"). After pasting a new version, publish it with
 * Deploy → Manage deployments → Edit → Version: New version, so the URL stays the same.
 *
 * Sponsor form: each submission
 *   1. adds a row to the "Sponsor leads" tab (created on first use), with a "Deck sent?"
 *      checkbox the team ticks after emailing the deck by hand;
 *   2. emails the addresses in NOTIFY, with reply-to set to the sponsor.
 * "Notify me" sign-up (form=notify): each email is added to the "Notify list" tab.
 *
 * The site posts here from src/scripts/sponsorForm.ts and src/scripts/signup.ts. Without
 * JavaScript the forms post straight here and the visitor sees the small thank-you page below.
 */

/** Who gets an email for each new lead. Comma-separated; leave '' for no emails. */
const NOTIFY = 'cscu.okanagan@gmail.com,vovanmanhtam@gmail.com';
/** Where the no-JavaScript thank-you page links back to. */
const SITE_URL = 'https://bchacks.ca';
const SHEET_NAME = 'Sponsor leads';
const HEADERS = ['Submitted', 'Name', 'Company', 'Email', 'Deck sent?', 'Notes'];
const NOTIFY_SHEET = 'Notify list';
const NOTIFY_HEADERS = ['Submitted', 'Email'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function doPost(e) {
  const p = (e && e.parameter) || {};
  const js = p.js === '1';

  // Bots fill in the hidden field; people never see it. Pretend it worked and drop it.
  if (p['bot-field']) return reply(js, true);

  if (p.form === 'notify') return notify(p, js);

  const name = clean(p.name, 100);
  const company = clean(p.company, 150);
  const email = String(p.email || '').trim().slice(0, 200);
  if (!name || !company || !EMAIL_RE.test(email)) {
    return reply(js, false, 'Some fields are missing or the email address is not valid.');
  }

  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const sheet = leadsSheet();
    sheet.appendRow([new Date(), name, company, clean(email, 200), false, '']);
    sheet.getRange(sheet.getLastRow(), 5).insertCheckboxes();
  } finally {
    lock.releaseLock();
  }

  if (NOTIFY) {
    MailApp.sendEmail({
      to: NOTIFY,
      replyTo: email,
      subject: 'New sponsor lead: ' + company,
      body:
        name + ' from ' + company + ' asked for the sponsorship deck.\n\n' +
        'Email: ' + email + '\n\n' +
        'Reply to this email to send them the deck, then tick "Deck sent?" in the sheet:\n' +
        SpreadsheetApp.getActiveSpreadsheet().getUrl(),
    });
  }
  return reply(js, true);
}

/** "Notify me" sign-up: one row per email on the "Notify list" tab. */
function notify(p, js) {
  const email = String(p.email || '').trim().slice(0, 200);
  if (!EMAIL_RE.test(email)) return reply(js, false, 'That email address is not valid.', 'notify');
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    tab(NOTIFY_SHEET, NOTIFY_HEADERS).appendRow([new Date(), clean(email, 200)]);
  } finally {
    lock.releaseLock();
  }
  return reply(js, true, '', 'notify');
}

/** The leads tab, created with its header row the first time. */
function leadsSheet() {
  return tab(SHEET_NAME, HEADERS);
}

/** A tab by name, created with a bold, frozen header row the first time. */
function tab(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
  }
  return sheet;
}

/**
 * Trims and shortens a value, and stops it being read as a spreadsheet formula
 * (a leading = + - @ gets an apostrophe in front).
 */
function clean(value, max) {
  const s = String(value || '').trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/** JSON for the site's script; a small page for visitors without JavaScript. */
function reply(js, ok, error, kind) {
  if (js) {
    return ContentService.createTextOutput(JSON.stringify(ok ? { ok: true } : { ok: false, error: error }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  const text = ok
    ? kind === 'notify'
      ? "You're in. We'll email you the moment applications open."
      : "Thanks! We'll email you our sponsorship deck shortly."
    : "That didn't go through: " + error + ' Go back and try again.';
  return HtmlService.createHtmlOutput(
    '<p style="font:16px/1.5 system-ui,sans-serif;margin:40px auto;max-width:32em;padding:0 16px">' +
      text + '<br><br><a href="' + SITE_URL + '" target="_top">Back to BCHacks</a></p>',
  ).setTitle('BCHacks');
}

/** Run once from the editor (▶ Run) to create the tab and approve the permissions. */
function setup() {
  leadsSheet();
  tab(NOTIFY_SHEET, NOTIFY_HEADERS);
}
