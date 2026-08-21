// apps/admin/src/components/customers/CustomerFilters.tsx
import { useState } from 'react';
import { Icon } from '../Icon';

interface CustomerFiltersProps {
    onFilterChange: (filters: {
        status?: string;
        dateFrom?: string;
        dateTo?: string;
        search?: string;
    }) => void;
    onSearch: (query: string) => void;
}

export function CustomerFilters({ onFilterChange, onSearch }: CustomerFiltersProps) {
    const [status, setStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const handleChange = () => {
        onFilterChange({
            status: status || undefined,
            dateFrom: dateFrom || undefined,
            dateTo: dateTo || undefined,
        });
    };

    const handleReset = () => {
        setStatus('');
        setDateFrom('');
        setDateTo('');
        onSearch('');
        onFilterChange({});
    };

    return (
        <div className="customer-filters">
            <div className="filter-group">
                <label>Status</label>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); handleChange(); }}
                >
                    <option value="">All</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="SUSPENDED">Suspended</option>
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