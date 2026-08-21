// apps/admin/src/components/orders/OrderFilters.tsx
import { useState } from 'react';
import { Icon } from '../Icon';

interface OrderFiltersProps {
    onFilterChange: (filters: {
        status?: string;
        paymentStatus?: string;
        dateFrom?: string;
        dateTo?: string;
    }) => void;
}

export function OrderFilters({ onFilterChange }: OrderFiltersProps) {
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleChange = () => {
        onFilterChange({
            status: status || undefined,
            paymentStatus: paymentStatus || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        });
    };

    const handleReset = () => {
        setStatus('');
        setPaymentStatus('');
        setDateFrom('');
        setDateTo('');
        onFilterChange({});
    };

    return (
        <div className="order-filters">
            <div className="filter-group">
                <label>Order Status</label>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); handleChange(); }}
                >
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="RETURNED">Returned</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Payment Status</label>
                <select
                    value={paymentStatus}
                    onChange={(e) => { setPaymentStatus(e.target.value); handleChange(); }}
                >
                    <option value="">All</option>
                    <option value="PENDING">Pending</option>
                    <option value="PAID">Paid</option>
                    <option value="FAILED">Failed</option>
                    <option value="REFUNDED">Refunded</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
            </div>

            <div className="filter-group">
                <label>From Date</label>
                <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => { setDateFrom(e.target.value); handleChange(); }}
                />
            </div>

            <div className="filter-group">
                <label>To Date</label>
                <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => { setDateTo(e.target.value); handleChange(); }}
                />
            </div>

            <button className="secondary-btn" onClick={handleReset} style={{ alignSelf: 'flex-end' }}>
                <Icon name="X" size={14} /> Reset
            </button>
        </div>
    );
}