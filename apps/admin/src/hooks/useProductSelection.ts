// apps/admin/src/hooks/useProductSelection.ts
import { useState, useCallback } from 'react';

export function useProductSelection(products: any[]) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const toggleSelect = useCallback((id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    const toggleSelectAll = useCallback(() => {
        setSelectedIds((prev) => {
            if (prev.size === products.length && products.length > 0) {
                return new Set();
            }
            return new Set(products.map((p) => p.id));
        });
    }, [products]);

    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    const isAllSelected = products.length > 0 && selectedIds.size === products.length;
    const isSomeSelected = selectedIds.size > 0 && selectedIds.size < products.length;

    return {
        selectedIds,
        toggleSelect,
        toggleSelectAll,
        clearSelection,
        isAllSelected,
        isSomeSelected,
        count: selectedIds.size,
    };
}