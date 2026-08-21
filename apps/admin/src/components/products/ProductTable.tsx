// apps/admin/src/components/products/ProductTable.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { ProductFilters } from './ProductFilters';

interface ProductTableProps {
    products: any[];
    onRefresh: () => void;
    onError: (error: string) => void;
}

export function ProductTable({ products, onRefresh, onError }: ProductTableProps) {
    const navigate = useNavigate();
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [showDuplicateConfirm, setShowDuplicateConfirm] = useState<string | null>(null);
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
        if (selectedIds.size === products.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(products.map((p) => p.id)));
        }
    };

    const isAllSelected = products.length > 0 && selectedIds.size === products.length;

    // Duplicate product
    const handleDuplicate = async (id: string) => {
        setIsLoading(true);
        try {
            const product = await adminData.product(id);
            const { name, slug, brand, description, categoryId, images, variants, attributes } = product.data;

            await adminData.createProduct({
                name: `${name} (Copy)`,
                slug: `${slug}-copy-${Date.now()}`,
                brand,
                description,
                categoryId,
                status: 'DRAFT',
                images,
                variants: variants.map((v: any) => ({
                    sku: `${v.sku}-copy`,
                    price: Number(v.price),
                    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
                    stockQuantity: v.stockQuantity,
                    attributes: v.attributes || {}
                })),
                attributes: attributes || []
            });

            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to duplicate product');
        } finally {
            setIsLoading(false);
            setShowDuplicateConfirm(null);
        }
    };

    // Delete product (hard delete for drafts, archive for active)
    const handleDelete = async (id: string) => {
        setIsLoading(true);
        try {
            const product = products.find((p) => p.id === id);
            if (product?.status === 'DRAFT') {
                // Hard delete for drafts (using archive for now since we don't have hard delete)
                await adminData.archiveProduct(id);
            } else {
                await adminData.archiveProduct(id);
            }
            onRefresh();
        } catch (err) {
            onError(err instanceof Error ? err.message : 'Failed to delete product');
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(null);
        }
    };

    const handleExportCSV = () => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
        const rows = products.map((p) => {
            const variant = p.variants?.[0] || {};
            return [
                p.name,
                variant.sku || '—',
                p.category?.name || '—',
                variant.price || '—',
                p.variants?.reduce((sum: number, v: any) => sum + (v.inventory?.quantity ?? v.stockQuantity ?? 0), 0) || 0,
                p.status
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
        a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <div className="product-table-wrapper">
            {/* Bulk Actions Toolbar */}
            {selectedIds.size > 0 && (
                <div className="bulk-actions-bar">
                    <span className="bulk-count">{selectedIds.size} selected</span>
                    <div className="bulk-actions-group">
                        <button
                            className="secondary-btn"
                            onClick={() => {
                                const ids = Array.from(selectedIds);
                                Promise.all(ids.map((id) => adminData.updateProduct(id, { status: 'ACTIVE' })))
                                    .then(onRefresh)
                                    .catch((err) => onError(err.message));
                                setSelectedIds(new Set());
                            }}
                        >
                            <Icon name="Check" size={14} /> Publish
                        </button>
                        <button
                            className="secondary-btn"
                            onClick={() => {
                                const ids = Array.from(selectedIds);
                                Promise.all(ids.map((id) => adminData.archiveProduct(id)))
                                    .then(onRefresh)
                                    .catch((err) => onError(err.message));
                                setSelectedIds(new Set());
                            }}
                        >
                            <Icon name="Archive" size={14} /> Archive
                        </button>
                        <button
                            className="secondary-btn danger-outline"
                            onClick={() => {
                                if (confirm(`Delete ${selectedIds.size} products?`)) {
                                    const ids = Array.from(selectedIds);
                                    Promise.all(ids.map((id) => adminData.archiveProduct(id)))
                                        .then(onRefresh)
                                        .catch((err) => onError(err.message));
                                    setSelectedIds(new Set());
                                }
                            }}
                        >
                            <Icon name="Trash2" size={14} /> Delete
                        </button>
                    </div>
                </div>
            )}

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
                            <th>Category</th>
                            <th>Variants</th>
                            <th>Stock</th>
                            <th>Status</th>
                            <th style={{ width: 180 }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((product) => {
                            const totalStock = product.variants?.reduce(
                                (sum: number, v: any) => sum + (v.inventory?.quantity ?? v.stockQuantity ?? 0),
                                0
                            ) ?? 0;

                            return (
                                <tr key={product.id}>
                                    <td>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.has(product.id)}
                                            onChange={() => toggleSelect(product.id)}
                                        />
                                    </td>
                                    <td>
                                        <strong>{product.name}</strong>
                                        <small className="cell-sub">{product.slug}</small>
                                    </td>
                                    <td>{product.category?.name ?? '—'}</td>
                                    <td>{product.variants?.length ?? 0}</td>
                                    <td>{totalStock}</td>
                                    <td>
                                        <span className={`status ${String(product.status).toLowerCase()}`}>
                                            {product.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="table-actions">
                                            <button className="table-action" onClick={() => navigate(`/products/${product.id}`)}>
                                                <Icon name="Pencil" size={14} />
                                            </button>
                                            <button
                                                className="table-action"
                                                onClick={() => setShowDuplicateConfirm(product.id)}
                                                title="Duplicate"
                                            >
                                                <Icon name="Copy" size={14} />
                                            </button>
                                            <button
                                                className="table-action danger"
                                                onClick={() => setShowDeleteConfirm(product.id)}
                                                title="Delete"
                                            >
                                                <Icon name="Trash2" size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Export Button */}
            {products.length > 0 && (
                <div className="table-footer">
                    <button className="secondary-btn" onClick={handleExportCSV}>
                        <Icon name="Download" size={14} /> Export CSV
                    </button>
                </div>
            )}

            {/* Delete Confirm Dialog */}
            {showDeleteConfirm && (
                <ConfirmDialog
                    open
                    title="Delete product?"
                    description="This product will be archived and hidden from the storefront. This action can be undone."
                    confirmLabel="Delete"
                    danger
                    onClose={() => setShowDeleteConfirm(null)}
                    onConfirm={() => handleDelete(showDeleteConfirm)}
                />
            )}

            {/* Duplicate Confirm Dialog */}
            {showDuplicateConfirm && (
                <ConfirmDialog
                    open
                    title="Duplicate product?"
                    description="A new draft product will be created with the same details."
                    confirmLabel="Duplicate"
                    onClose={() => setShowDuplicateConfirm(null)}
                    onConfirm={() => handleDuplicate(showDuplicateConfirm)}
                />
            )}
        </div>
    );
}