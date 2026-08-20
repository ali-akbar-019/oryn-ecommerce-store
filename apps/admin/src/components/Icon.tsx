import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export function Icon({ name, size = 18 }: { name: keyof typeof Icons; size?: number }) {
  const Component = Icons[name] as LucideIcon;
  return <Component size={size} strokeWidth={1.8} />;
}
