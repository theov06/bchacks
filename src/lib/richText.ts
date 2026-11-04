import { site } from '@content/site';

const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const tokens: Record<string, string> = {
  codeOfConductUrl: site.codeOfConductUrl,
  contactEmail: site.contactEmail,
  sponsorEmail: site.sponsorEmail,
  deadline: site.deadlineLong,
};

/**
 * Turns content text into safe HTML: escapes everything, fills {tokens} from
 * site config, and converts [label](url) into links. External links open in a new tab.
 */
export function richText(input: string): string {
  const filled = input.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
  return escape(filled).replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, label: string, url: string) => {
    const ext = /^https?:\/\//.test(url);
    return `<a href="${url}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}${
      ext ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''
    }</a>`;
  });
}

/** Formats an ISO date as e.g. "Nov 2, 2026". */
export const formatDate = (iso: string) =>
  // Date-only strings are read as midday so the Pacific time zone can't shift them to the previous day.
  new Date(/^\d{4}-\d{2}-\d{2}$/.test(iso) ? `${iso}T12:00:00` : iso).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'America/Vancouver' });

/**
 * Formats an ISO date-time like "2027-03-06T11:00:00-08:00" as "Sat 11:00",
 * using the clock time exactly as written (no time-zone conversion).
 */
export const formatDateTime = (iso: string) => {
  const day = new Date(`${iso.slice(0, 10)}T12:00:00Z`).toLocaleDateString('en-CA', { weekday: 'short', timeZone: 'UTC' });
  return `${day} ${iso.slice(11, 16)}`;
};
