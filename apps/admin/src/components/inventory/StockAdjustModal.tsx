// apps/admin/src/components/inventory/StockAdjustModal.tsx
import { useState } from 'react';
import { Icon } from '../Icon';

interface StockAdjustModalProps {
    item: any;
    onClose: () => void;
    onSave: (id: string, quantity: number, reason: string) => Promise<void>;
    isLoading: boolean;
}

export function StockAdjustModal({ item, onClose, onSave, isLoading }: StockAdjustModalProps) {
    const [quantity, setQuantity] = useState(item.inventory?.quantity ?? item.stockQuantity ?? 0);
    const [reason, setReason] = useState('ADMIN_ADJUSTMENT');
    const [error, setError] = useState('');

    const handleSave = async () => {
        if (quantity < 0) {
            setError('Quantity cannot be negative');
            return;
        }
        await onSave(item.id, quantity, reason);
    };

    return (
        <div className="modal-backdrop" onClick={() => !isLoading && onClose()}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <p className="eyebrow">Adjust stock</p>
                        <h3>{item.product?.name}</h3>
                        <p className="modal-context">SKU: {item.sku}</p>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <Icon name="X" />
                    </button>
                </div>

                {error && <div className="notice error-notice">{error}</div>}

                <div className="modal-body">
                    <div className="current-stock">
                        <span>Current stock</span>
                        <strong>{item.inventory?.quantity ?? item.stockQuantity ?? 0}</strong>
                    </div>

                    <label>
                        New quantity
                        <input
                            type="number"
                            min="0"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            placeholder="Enter new quantity"
                        />
                    </label>

                    <label>
                        Reason
                        <select value={reason} onChange={(e) => setReason(e.target.value)}>
                            <option value="ADMIN_ADJUSTMENT">Admin Adjustment</option>
                            <option value="STOCK_COUNT">Stock Count</option>
                            <option value="RETURN">Return</option>
                            <option value="RESTOCK">Restock</option>
                            <option value="DAMAGED">Damaged</option>
                            <option value="LOST">Lost</option>
                        </select>
                    </label>
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>
                        Cancel
                    </button>
                    <button
                        className="primary-btn"
                        onClick={handleSave}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : 'Update Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}