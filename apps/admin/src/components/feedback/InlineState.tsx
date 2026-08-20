import { AlertCircle, RefreshCw } from 'lucide-react';

type Props = { title: string; description?: string; actionLabel?: string; onAction?: () => void };

export function InlineState({ title, description, actionLabel = 'Try again', onAction }: Props) {
  return <div className="inline-state"><div className="inline-state-icon"><AlertCircle size={16}/></div><strong>{title}</strong>{description && <span>{description}</span>}{onAction && <button onClick={onAction}><RefreshCw size={13}/>{actionLabel}</button>}</div>;
}
