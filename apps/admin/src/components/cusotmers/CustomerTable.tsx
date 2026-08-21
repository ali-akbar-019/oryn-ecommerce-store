// apps/admin/src/components/customers/CustomerTable.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';
import { ConfirmDialog } from '../ui/ConfirmDialog';

interface CustomerTableProps {
    customers: any[];
    onRefresh: () => void;
    onError: (error: string) => void;
}

export function CustomerTable({ customers, onRefresh, onError }: CustomerTableProps) {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showStatusConfirm, setShowStatusConfirm] = useState<{ id: string; status: string } | null>(null);
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
        if (selectedIds.size === customers.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(customers.map((c) => c.id)));
        }
    };

    const isAllSelected = customers.length > 0 && selectedIds.size === customers.length;

    // Update customer status
    const handleUpdateStatus = async (id: string, status: string) => {
        setIsLoading(true);
        try {
            // Assuming there's an API endpoint for updating customer status
            await adminData.updateCustomer?.(id, { status });
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setIsLoading(false);
            setShowStatusConfirm(null);
        }
    };

    // Bulk update status
    const handleBulkStatusUpdate = async (status: string) => {
        const ids = Array.from(selectedIds);
        setIsLoading(true);
        try {
            await Promise.all(
                ids.map((id) => adminData.updateCustomer?.(id, { status }))
            );
            setSelectedIds(new Set());
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bulk update failed');
        } finally {
            setIsLoading(false);
            setShowStatusConfirm(null);
        }
    };

    // Export customers to CSV
    const handleExportCSV = () => {
        const headers = ['Name', 'Email', 'Status', 'Orders', 'Reviews', 'Joined Date'];
        const rows = customers.map((c) => [
            `${c.firstName} ${c.lastName}`,
            c.email,
            c.status,
            c._count?.orders || 0,
            c._count?.reviews || 0,
            new Date(c.createdAt).toLocaleDateString()
        ]);

        const csv = [
            headers.join(','),
            ...rows.map((row) => row.join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `customers-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        setShowExportConfirm(false);
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
                return 'status active';
            case 'inactive':
                return 'status inactive';
            case 'suspended':
                return 'status suspended';
            default:
                return 'status';
        }
    };

    return (
        <div className="customer-table-wrapper">
            {/* Bulk Actions */}
            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar">
                    <span className="bulk-count">{selectedIds.size} selected</span>
                    <div className="bulk-actions-group">
                        <button
                            className="secondary-btn"
                            onClick={() => setShowStatusConfirm({ id: 'bulk', status: 'ACTIVE' })}
                            disabled={isLoading}
                        >
                            <Icon name="Check" size={14} /> Activate
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={() => setShowStatusConfirm({ id: 'bulk', status: 'INACTIVE' })}
                            disabled={isLoading}
                        >
                            <Icon name="Pause" size={14} /> Deactivate
                        </button>
                        <button
                            className="secondary-btn danger-outline"
                            onClick={() => setShowStatusConfirm({ id: 'bulk', status: 'SUSPENDED' })}
                            disabled={isLoading}
                        >
                            <Icon name="AlertCircle" size={14} /> Suspend
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
                            <th>Customer</th>
                            <th>Email</th>
                            <th>Orders</th>
                            <th>Reviews</th>
                            <th>Joined</th>
                            <th>Status</th>
                            <th style={{ width: 140 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers.map((customer) => (
                            <tr key={customer.id}>
                                <td>
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.has(customer.id)}
                                        onChange={() => toggleSelect(customer.id)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                                <td
                                    className="clickable"
                                    onClick={() => navigate(`/customers/${customer.id}`)}
                                >
                                    <strong>
                                        {customer.firstName} {customer.lastName}
                                    </strong>
                                </td>
                                <td onClick={() => navigate(`/customers/${customer.id}`)}>
                                    {customer.email}
                                </td>
                                <td onClick={() => navigate(`/customers/${customer.id}`)}>
                                    <span className="badge">{customer._count?.orders || 0}</span>
                                </td>
                                <td onClick={() => navigate(`/customers/${customer.id}`)}>
                                    <span className="badge">{customer._count?.reviews || 0}</span>
                                </td>
                                <td onClick={() => navigate(`/customers/${customer.id}`)}>
                                    {new Date(customer.createdAt).toLocaleDateString()}
                                </td>
                                <td onClick={() => navigate(`/customers/${customer.id}`)}>
                                    <span className={getStatusColor(customer.status)}>
                                        {customer.status}
                                    </span>
                                </td>
                                <td>
                                    <div className="table-actions">
                                        <button
                                            className="table-action"
                                            onClick={() => navigate(`/customers/${customer.id}`)}
                                            title="View profile"
                                        >
                                            <Icon name="Eye" size={14} />
                                        </button>
                                        {customer.status !== 'ACTIVE' && (
                                            <button
                                                className="table-action"
                                                onClick={() => setShowStatusConfirm({ id: customer.id, status: 'ACTIVE' })}
                                                title="Activate"
                                            >
                                                <Icon name="Check" size={14} />
                                            </button>
                                        )}
                                        {customer.status !== 'SUSPENDED' && (
                                            <button
                                                className="table-action danger"
                                                onClick={() => setShowStatusConfirm({ id: customer.id, status: 'SUSPENDED' })}
                                                title="Suspend"
                                            >
                                                <Icon name="AlertCircle" size={14} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Empty State */}
            {customers.length === 0 && (
                <div className="ops-empty">
                    <Icon name="Users" size={24} />
                    <strong>No customers found</strong>
                    <span>Customers will appear here when they register on the storefront.</span>
                </div>
            )}

            {/* Status Update Confirm Dialog */}
            {showStatusConfirm && (
                <ConfirmDialog
                    open
                    title={showStatusConfirm.id === 'bulk' ? `Update ${selectedIds.size} customers?` : 'Update customer status?'}
                    description={
                        showStatusConfirm.id === 'bulk'
                            ? `${selectedIds.size} customers will be set to ${showStatusConfirm.status}.`
                            : `This customer will be set to ${showStatusConfirm.status}.`
                    }
                    confirmLabel={`Set to ${showStatusConfirm.status}`}
                    danger={showStatusConfirm.status === 'SUSPENDED'}
                    onClose={() => setShowStatusConfirm(null)}
                    onConfirm={() => {
                        if (showStatusConfirm.id === 'bulk') {
                            handleBulkStatusUpdate(showStatusConfirm.status);
                        } else {
                            handleUpdateStatus(showStatusConfirm.id, showStatusConfirm.status);
                        }
                    }}
                />
            )}

            {/* Export Confirm Dialog */}
            {showExportConfirm && (
                <ConfirmDialog
                    open
                    title="Export customers?"
                    description={`${customers.length} customers will be exported to CSV.`}
                    confirmLabel="Export"
                    onClose={() => setShowExportConfirm(false)}
                    onConfirm={handleExportCSV}
                />
            )}
        </div>
    );
}