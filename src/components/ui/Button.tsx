import type { ReactNode } from 'react';
import type { IconName } from '../../lib/icons';
import { cx, externalProps } from '../../lib/ui';
import { Icon } from './Icon';
import { NewTab } from './NewTab';
import styles from './Button.module.css';

export interface ButtonProps {
  href: string;
  /**
   * Sticker buttons (docs/bchacks-design-reference):
   * primary   = coloured fill (`tone`), 3px ink border, offset shadow
   * secondary = light outline for dark backgrounds
   * outline   = ink outline for cream cards
   */
  variant?: 'primary' | 'secondary' | 'outline';
  /** Fill colour for primary buttons. */
  tone?: 'sky' | 'sun' | 'aqua' | 'coral';
  size?: 'lg' | 'md' | 'sm';
  icon?: IconName;
  external?: boolean;
  download?: boolean;
  /** Opens the sponsor pop-up form (src/scripts/sponsorForm.ts); href is the no-JS fallback. */
  sponsorForm?: boolean;
  className?: string;
  /** Text label. Use this from .astro pages; `children` also works from .tsx. */
  label?: ReactNode;
  children?: ReactNode;
}

/** A link styled as a sticker button. */
export function Button({
  href,
  variant = 'primary',
  tone = 'sky',
  size = 'md',
  icon,
  external = false,
  download = false,
  sponsorForm = false,
  className,
  label,
  children,
}: ButtonProps) {
  return (
    <a
      href={href}
      className={cx(styles.btn, styles[variant], styles[size], variant === 'primary' && styles[tone], className)}
      download={download || undefined}
      data-sponsor-open={sponsorForm ? '' : undefined}
      {...(external ? externalProps : {})}
    >
      <span>{label ?? children}</span>
      {icon && <Icon name={icon} size={20} className={styles.icon} />}
      {external && <NewTab />}
    </a>
  );
}

export default Button;
