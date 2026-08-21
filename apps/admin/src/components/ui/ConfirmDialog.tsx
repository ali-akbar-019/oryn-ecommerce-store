import { X } from 'lucide-react';

type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  danger?: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  danger,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" role="presentation">
      <div
        className="modal confirm-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
      >
        <div className="modal-head">
          <div>
            <p className="eyebrow">Confirmation</p>
            <h3 id="confirm-title">{title}</h3>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p className="confirm-copy">{description}</p>
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className={danger ? 'primary-btn danger-btn' : 'primary-btn'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}