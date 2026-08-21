import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface IconProps {
  name: keyof typeof Icons;
  size?: number;
  className?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 18, className, strokeWidth = 1.8 }: IconProps) {
  const Component = Icons[name] as LucideIcon;

  if (!Component) {
    console.warn(`Icon "${name}" not found`);
    return null;
  }

  return (
    <Component
      size={size}
      strokeWidth={strokeWidth}
      className={className}
    />
  );
}