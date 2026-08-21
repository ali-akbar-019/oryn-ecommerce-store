// apps/admin/src/components/products/ProductFilters.tsx
import { useState, useEffect } from 'react';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';

interface ProductFiltersProps {
    onFilterChange: (filters: { status?: string; categoryId?: string; search?: string }) => void;
    onSearch: (query: string) => void;
}

export function ProductFilters({ onFilterChange, onSearch }: ProductFiltersProps) {
    const [categories, setCategories] = useState<any[]>([]);
    const [status, setStatus] = useState('');
    const [categoryId, setCategoryId] = useState('');

    useEffect(() => {
        adminData.categories().then((r) => setCategories(r.data ?? []));
    }, []);

    const handleChange = (type: string, value: string) => {
        if (type === 'status') setStatus(value);
        if (type === 'categoryId') setCategoryId(value);
        onFilterChange({ status: status || undefined, categoryId: categoryId || undefined });
    };

    return (
        <div className="product-filters">
            <div className="filter-group">
                <label>Status</label>
                <select
                    value={status}
                    onChange={(e) => handleChange('status', e.target.value)}
                >
                    <option value="">All</option>
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
            </div>

            <div className="filter-group">
                <label>Category</label>
                <select
                    value={categoryId}
                    onChange={(e) => handleChange('categoryId', e.target.value)}
                >
                    <option value="">All</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>
        </div>
    );
}