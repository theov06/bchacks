import { iconPaths, type IconName } from '../../lib/icons';
import { cx } from '../../lib/ui';

export interface IconProps {
  name: IconName;
  size?: number;
  className?: string;
}

/** Always decorative: the surrounding control carries the accessible name. */
export function Icon({ name, size = 24, className }: IconProps) {
  return (
    <svg
      className={cx('icon', className)}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      dangerouslySetInnerHTML={{ __html: iconPaths[name] }}
    />
  );
}

export default Icon;
