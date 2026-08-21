// apps/admin/src/components/inventory/InventoryTable.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { StockAdjustModal } from './StockAdjustModal';
import { InventoryHistory } from './InventoryHistory';

interface InventoryTableProps {
    items: any[];
    onRefresh: () => void;
    onError: (error: string) => void;
}

export function InventoryTable({ items, onRefresh, onError }: InventoryTableProps) {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showHistory, setShowHistory] = useState<string | null>(null);
    const [showAdjustModal, setShowAdjustModal] = useState<any | null>(null);
    const [showBulkUpdate, setShowBulkUpdate] = useState(false);
    const [bulkQuantity, setBulkQuantity] = useState<number>(0);
    const [bulkReason, setBulkReason] = useState('BULK_ADJUSTMENT');
    const [isLoading, setIsLoading] = useState(false);
    const [showExportConfirm, setShowExportConfirm] = useState(false);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === items.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(items.map((i) => i.id)));
        }
    };

    const isAllSelected = items.length > 0 && selectedIds.size === items.length;

    // Get stock status
    const getStockStatus = (item: any) => {
        const stock = item.inventory?.quantity ?? item.stockQuantity ?? 0;
        const threshold = item.lowStockThreshold ?? 10;

        if (stock === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: 'danger' };
        if (stock <= threshold) return { status: 'low-stock', label: 'Low Stock', color: 'warning' };
        return { status: 'healthy', label: 'Healthy', color: 'success' };
    };

    // Handle single stock adjustment
    const handleAdjustStock = async (variantId: string, quantity: number, reason: string) => {
        setIsLoading(true);
        try {
            await adminData.adjustStock(variantId, quantity, reason);
            onRefresh();
            setShowAdjustModal(null);
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to adjust stock');
        } finally {
            setIsLoading(false);
        }
    };

    // Handle bulk stock update
    const handleBulkUpdate = async () => {
        const ids = Array.from(selectedIds);
        setIsLoading(true);
        try {
            await Promise.all(
                ids.map((id) => adminData.adjustStock(id, bulkQuantity, bulkReason))
            );
            setSelectedIds(new Set());
            setShowBulkUpdate(false);
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bulk update failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Export inventory to CSV
    const handleExportCSV = () => {
        const headers = ['Product', 'SKU', 'Stock', 'Reserved', 'Status'];
        const rows = items.map((item) => {
            const stock = item.inventory?.quantity ?? item.stockQuantity ?? 0;
            const status = getStockStatus(item);
            return [
                item.product?.name || '—',
                item.sku,
                stock,
                item.inventory?.reserved || 0,
                status.label,
            ];
        });

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportConfirm(false);
    };

    return (
        <div className="inventory-table-wrapper">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar">
                    <span className="bulk-count">{selectedIds.size} selected</span>
                    <div className="bulk-actions-group">
                        <button
                            className="secondary-btn"
                            onClick={() => setShowBulkUpdate(true)}
                            disabled={isLoading}
                        >
                            <Icon name="Package" size={14} /> Bulk Update
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="table-toolbar">
                <button className="secondary-btn" onClick={() => setShowExportConfirm(true)}>
                    <Icon name="Download" size={14} /> Export CSV
                </button>
            </div>

            {/* Table */}
            <div className="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}>
                                <input
                                    type="checkbox"
                                    checked={isAllSelected}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th>Product</th>
                            <th>SKU</th>
                            <th>Stock</th>
                            <th>Reserved</th>
                            <th>Status</th>
                            <th style={{ width: 180 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => {
                            const stock = item.inventory?.quantity ?? item.stockQuantity ?? 0;
                            const stockStatus = getStockStatus(item);

                            return (
                                <tr key={item.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(item.id)}
                                            onChange={() => toggleSelect(item.id)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </td>
                                    <td>
                                        <strong>{item.product?.name ?? '—'}</strong>
                                        <small className="cell-sub">{item.product?.slug || ''}</small>
                                    </td>
                                    <td className="mono">{item.sku}</td>
                                    <td>
                                        <span className={`stock-quantity ${stock === 0 ? 'zero' : ''}`}>
                                            {stock}
                                        </span>
                                    </td>
                                    <td>{item.inventory?.reserved || 0}</td>
                                    <td>
                                        <span className={`status ${stockStatus.status}`}>
                                            {stockStatus.label}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button
                                                className="table-action"
                                                onClick={() => setShowAdjustModal(item)}
                                                title="Adjust stock"
                                            >
                                                <Icon name="Package" size={14} />
                                            </button>
                                            <button
                                                className="table-action"
                                                onClick={() => setShowHistory(item.id)}
                                                title="View history"
                                            >
                                                <Icon name="Clock" size={14} />
                                            </button>
                                            <button
                                                className="table-action"
                                                onClick={() => navigate(`/products/${item.productId}`)}
                                                title="View product"
                                            >
                                                <Icon name="ExternalLink" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {items.length === 0 && (
                <div className="ops-empty">
                    <Icon name="Box" size={24} />
                    <strong>No inventory found</strong>
                    <span>Inventory items will appear here when products are created.</span>
                </div>
            )}

            {/* Stock Adjust Modal */}
            {showAdjustModal && (
                <StockAdjustModal
                    item={showAdjustModal}
                    onClose={() => setShowAdjustModal(null)}
                    onSave={handleAdjustStock}
                    isLoading={isLoading}
                />
            )}

            {/* Inventory History Modal */}
            {showHistory && (
                <InventoryHistory
                    variantId={showHistory}
                    onClose={() => setShowHistory(null)}
                />
            )}

            {/* Bulk Update Modal */}
            {showBulkUpdate && (
                <div className="modal-backdrop" onClick={() => !isLoading && setShowBulkUpdate(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-head">
                            <div>
                                <p className="eyebrow">Bulk update</p>
                                <h3>Update {selectedIds.size} items</h3>
                            </div>
                            <button className="icon-btn" onClick={() => setShowBulkUpdate(false)}>
                                <Icon name="X" />
                            </button>
                        </div>
                        <div className="modal-body">
                            <label>
                                Quantity
                                <input
                                    type="number"
                                    min="0"
                                    value={bulkQuantity}
                                    onChange={(e) => setBulkQuantity(Number(e.target.value))}
                                    placeholder="Enter quantity"
                                />
                            </label>
                            <label>
                                Reason
                                <input
                                    value={bulkReason}
                                    onChange={(e) => setBulkReason(e.target.value)}
                                    placeholder="Reason for adjustment"
                                />
                            </label>
                        </div>
                        <div className="modal-actions">
                            <button className="secondary-btn" onClick={() => setShowBulkUpdate(false)}>
                                Cancel
                            </button>
                            <button
                                className="primary-btn"
                                onClick={handleBulkUpdate}
                                disabled={isLoading || bulkQuantity < 0}
                            >
                                {isLoading ? 'Updating...' : 'Update Stock'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Export Confirm Dialog */}
            {showExportConfirm && (
                <ConfirmDialog
                    open
                    title="Export inventory?"
                    description={`${items.length} items will be exported to CSV.`}
                    confirmLabel="Export"
                    onClose={() => setShowExportConfirm(false)}
                    onConfirm={handleExportCSV}
                />
            )}
        </div>
    );
}