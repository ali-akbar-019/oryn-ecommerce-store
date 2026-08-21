// apps/admin/src/components/inventory/InventoryHistory.tsx
import { useEffect, useState } from 'react';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';

interface InventoryHistoryProps {
    variantId: string;
    onClose: () => void;
}

export function InventoryHistory({ variantId, onClose }: InventoryHistoryProps) {
    const [history, setHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHistory = async () => {
            try {
                const response = await adminData.inventoryHistory(variantId);
                setHistory(response.data?.transactions || []);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load history');
            } finally {
                setLoading(false);
            }
        };
        loadHistory();
    }, [variantId]);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal history-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <div>
                        <p className="eyebrow">Inventory history</p>
                        <h3>Stock movements</h3>
                    </div>
                    <button className="icon-btn" onClick={onClose}>
                        <Icon name="X" />
                    </button>
                </div>

                <div className="modal-body">
                    {loading ? (
                        <div className="state-view">
                            <div className="loader-line" />
                            <p>Loading history…</p>
                        </div>
                    ) : error ? (
                        <div className="state-view">
                            <p>{error}</p>
                            <button className="secondary-btn" onClick={() => window.location.reload()}>
                                Retry
                            </button>
                        </div>
                    ) : history.length === 0 ? (
                        <div className="ops-empty">
                            <Icon name="Clock" size={24} />
                            <strong>No history</strong>
                            <span>No stock movements recorded for this item.</span>
                        </div>
                    ) : (
                        <div className="history-list">
                            {history.map((entry) => (
                                <div key={entry.id} className="history-item">
                                    <div className="history-icon">
                                        {entry.quantityDelta > 0 ? (
                                            <Icon name="ArrowUp" size={14} color="#587054" />
                                        ) : (
                                            <Icon name="ArrowDown" size={14} color="#8a5b57" />
                                        )}
                                    </div>
                                    <div className="history-content">
                                        <div className="history-header">
                                            <span className={`history-delta ${entry.quantityDelta > 0 ? 'positive' : 'negative'}`}>
                                                {entry.quantityDelta > 0 ? '+' : ''}{entry.quantityDelta}
                                            </span>
                                            <span className="history-reason">{entry.reason}</span>
                                            <span className="history-date">{formatDate(entry.createdAt)}</span>
                                        </div>
                                        {entry.referenceId && (
                                            <span className="history-reference">Reference: {entry.referenceId.slice(0, 12)}</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="modal-actions">
                    <button className="secondary-btn" onClick={onClose}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}