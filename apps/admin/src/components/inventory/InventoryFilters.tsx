// apps/admin/src/components/inventory/InventoryFilters.tsx
import { useState } from 'react';
import { Icon } from '../Icon';

interface InventoryFiltersProps {
    onFilterChange: (filters: {
        status?: string;
        search?: string;
    }) => void;
    onSearch: (query: string) => void;
}

export function InventoryFilters({ onFilterChange, onSearch }: InventoryFiltersProps) {
    const [status, setStatus] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const handleChange = () => {
        onFilterChange({
            status: status || undefined,
        });
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        onSearch(query);
    };

    const handleReset = () => {
        setStatus('');
        setSearchQuery('');
        onSearch('');
        onFilterChange({});
    };

    return (
        <div className="inventory-filters">
            <div className="filter-group">
                <label>Status</label>
                <select
                    value={status}
                    onChange={(e) => { setStatus(e.target.value); handleChange(); }}
                >
                    <option value="">All</option>
                    <option value="healthy">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                    <option value="out-of-stock">Out of Stock</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Search</label>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search by product or SKU..."
                />
            </div>

            <button className="secondary-btn" onClick={handleReset} style={{ alignSelf: 'flex-end' }}>
                <Icon name="X" size={14} /> Reset
            </button>
        </div>
    );
}