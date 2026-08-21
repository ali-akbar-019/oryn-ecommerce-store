// apps/admin/src/components/orders/OrderTable.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface OrderTableProps {
    orders: any[];
    onRefresh: () => void;
    onError: (error: string) => void;
}

export function OrderTable({ orders, onRefresh, onError }: OrderTableProps) {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);
    const [showRefundConfirm, setShowRefundConfirm] = useState<string | null>(null);
    const [showExportConfirm, setShowExportConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const toggleSelect = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === orders.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(orders.map((o) => o.id)));
        }
    };

    const isAllSelected = orders.length > 0 && selectedIds.size === orders.length;

    // Cancel order
    const handleCancel = async (id: string) => {
        setIsLoading(true);
        try {
            const order = orders.find((o) => o.id === id);
            await adminData.updateOrder(id, {
                status: 'CANCELLED',
                paymentStatus: order?.paymentStatus === 'PAID' ? 'REFUNDED' : order?.paymentStatus
            });
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to cancel order');
        } finally {
            setIsLoading(false);
            setShowCancelConfirm(null);
        }
    };

    // Refund order
    const handleRefund = async (id: string) => {
        setIsLoading(true);
        try {
            await adminData.updateOrder(id, { paymentStatus: 'REFUNDED' });
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to process refund');
        } finally {
            setIsLoading(false);
            setShowRefundConfirm(null);
        }
    };

    // Bulk cancel orders
    const handleBulkCancel = async () => {
        const ids = Array.from(selectedIds);
        setIsLoading(true);
        try {
            await Promise.all(
                ids.map((id) => {
                    const order = orders.find((o) => o.id === id);
                    return adminData.updateOrder(id, {
                        status: 'CANCELLED',
                        paymentStatus: order?.paymentStatus === 'PAID' ? 'REFUNDED' : order?.paymentStatus
                    });
                })
            );
            setSelectedIds(new Set());
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bulk cancel failed');
        } finally {
            setIsLoading(false);
        }
    };

    // Export orders to CSV
    const handleExportCSV = () => {
        const headers = ['Order ID', 'Customer', 'Email', 'Date', 'Status', 'Payment', 'Total'];
        const rows = orders.map((o) => [
            o.id.slice(0, 10).toUpperCase(),
            `${o.user?.firstName || ''} ${o.user?.lastName || ''}`,
            o.user?.email || '',
            new Date(o.createdAt).toLocaleDateString(),
            o.status,
            o.paymentStatus,
            Number(o.total).toFixed(2)
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `orders-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportConfirm(false);
    };

    return (
        <div className="order-table-wrapper">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar">
                    <span className="bulk-count">{selectedIds.size} selected</span>
                    <div className="bulk-actions-group">
                        <button
                            className="secondary-btn danger-outline"
                            onClick={handleBulkCancel}
                            disabled={isLoading}
                        >
                            <Icon name="X" size={14} /> Cancel orders
                        </button>
                    </div>
                </div>
            )}

            {/* Export Button */}
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
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Date</th>
                            <th>Total</th>
                            <th>Payment</th>
                            <th>Status</th>
                            <th style={{ width: 140 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="clickable-row">
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(order.id)}
                                        onChange={() => toggleSelect(order.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td
                                    className="mono"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    {order.id.slice(0, 10).toUpperCase()}
                                </td>
                                <td onClick={() => navigate(`/orders/${order.id}`)}>
                                    <strong>
                                        {order.user?.firstName} {order.user?.lastName}
                                    </strong>
                                    <small className="cell-sub">{order.user?.email}</small>
                                </td>
                                <td onClick={() => navigate(`/orders/${order.id}`)}>
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </td>
                                <td
                                    className="mono"
                                    onClick={() => navigate(`/orders/${order.id}`)}
                                >
                                    ${Number(order.total).toFixed(2)}
                                </td>
                                <td onClick={() => navigate(`/orders/${order.id}`)}>
                                    <span className={`status ${String(order.paymentStatus).toLowerCase()}`}>
                                        {order.paymentStatus}
                                    </span>
                                </td>
                                <td onClick={() => navigate(`/orders/${order.id}`)}>
                                    <span className={`status ${String(order.status).toLowerCase().replaceAll('_', '-')}`}>
                                        {String(order.status).replaceAll('_', ' ')}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            className="table-action"
                                            onClick={() => navigate(`/orders/${order.id}`)}
                                            title="View order"
                                        >
                                            <Icon name="Eye" size={14} />
                                        </button>
                                        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                                            <button
                                                className="table-action danger"
                                                onClick={() => setShowCancelConfirm(order.id)}
                                                title="Cancel order"
                                            >
                                                <Icon name="X" size={14} />
                                            </button>
                                        )}
                                        {order.paymentStatus === 'PAID' && (
                                            <button
                                                className="table-action"
                                                onClick={() => setShowRefundConfirm(order.id)}
                                                title="Refund order"
                                            >
                                                <Icon name="Undo" size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Cancel Confirm Dialog */}
            {showCancelConfirm && (
                <ConfirmDialog
                    open
                    title="Cancel order?"
                    description="This order will be cancelled. If payment was made, it will be refunded."
                    confirmLabel="Cancel order"
                    danger
                    onClose={() => setShowCancelConfirm(null)}
                    onConfirm={() => handleCancel(showCancelConfirm)}
                />
            )}

            {/* Refund Confirm Dialog */}
            {showRefundConfirm && (
                <ConfirmDialog
                    open
                    title="Refund order?"
                    description="A refund will be processed for this order."
                    confirmLabel="Refund"
                    danger
                    onClose={() => setShowRefundConfirm(null)}
                    onConfirm={() => handleRefund(showRefundConfirm)}
                />
            )}

            {/* Export Confirm Dialog */}
            {showExportConfirm && (
                <ConfirmDialog
                    open
                    title="Export orders?"
                    description={`${orders.length} orders will be exported to CSV.`}
                    confirmLabel="Export"
                    onClose={() => setShowExportConfirm(false)}
                    onConfirm={handleExportCSV}
                />
            )}
        </div>
    );
}