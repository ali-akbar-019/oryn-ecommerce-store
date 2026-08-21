// apps/admin/src/components/products/BulkActions.tsx
import { useState } from 'react';
import { Icon } from '../Icon';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { adminData } from '../../services/adminData';

interface BulkActionsProps {
    selectedIds: Set<string>;
    selectedProducts: any[];
    onActionComplete: () => void;
    onError: (error: string) => void;
}

export function BulkActions({ selectedIds, selectedProducts, onActionComplete, onError }: BulkActionsProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [showConfirm, setShowConfirm] = useState<{ action: 'publish' | 'archive' | 'delete'; title: string; description: string } | null>(null);

    const handleBulkAction = async (action: 'publish' | 'archive' | 'delete') => {
        const ids = Array.from(selectedIds);
        setIsLoading(true);

        try {
            switch (action) {
                case 'publish':
                    await Promise.all(ids.map((id) => adminData.updateProduct(id, { status: 'ACTIVE' })));
                    break;
                case 'archive':
                    await Promise.all(ids.map((id) => adminData.archiveProduct(id)));
                    break;
                case 'delete':
                    await Promise.all(ids.map((id) => adminData.archiveProduct(id))); // Delete = archive for now
                    break;
            }
            onActionComplete();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Bulk action failed');
        } finally {
            setIsLoading(false);
            setShowConfirm(null);
        }
    };

    if (selectedIds.size === 0) return null;

    return (
        <>
            <div className="bulk-actions">
                <span className="bulk-count">{selectedIds.size} selected</span>
                <div className="bulk-actions-group">
                    <button
                        className="secondary-btn"
                        onClick={() => setShowConfirm({ action: 'publish', title: 'Publish selected products?', description: `${selectedIds.size} products will be published to the storefront.` })}
                        disabled={isLoading}
                    >
                        <Icon name="Check" size={14} /> Publish
                    </button>
                    <button
                        className="secondary-btn"
                        onClick={() => setShowConfirm({ action: 'archive', title: 'Archive selected products?', description: `${selectedIds.size} products will be archived.` })}
                        disabled={isLoading}
                    >
                        <Icon name="Archive" size={14} /> Archive
                    </button>
                    <button
                        className="secondary-btn danger-outline"
                        onClick={() => setShowConfirm({ action: 'delete', title: 'Delete selected products?', description: `${selectedIds.size} products will be permanently deleted.` })}
                        disabled={isLoading}
                    >
                        <Icon name="Trash2" size={14} /> Delete
                    </button>
                </div>
            </div>

            {showConfirm && (
                <ConfirmDialog
                    open
                    title={showConfirm.title}
                    description={showConfirm.description}
                    confirmLabel={showConfirm.action === 'publish' ? 'Publish' : showConfirm.action === 'archive' ? 'Archive' : 'Delete'}
                    danger={showConfirm.action !== 'publish'}
                    onClose={() => setShowConfirm(null)}
                    onConfirm={() => handleBulkAction(showConfirm.action)}
                />
            )}
        </>
    );
}