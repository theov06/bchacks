import type { CSSProperties } from 'react';

/** Joins class names, skipping falsy values. */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');

/** Inline style that may also set CSS custom properties, e.g. { '--i': 2 }. */
export type StyleVars = CSSProperties & { [key: `--${string}`]: string | number };

/** Lowercase, hyphenated id fragment: "Day-of" -> "day-of". */
export const slug = (s: string): string => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Attributes for a link that opens in a new tab. */
export const externalProps = { target: '_blank', rel: 'noopener' } as const;
