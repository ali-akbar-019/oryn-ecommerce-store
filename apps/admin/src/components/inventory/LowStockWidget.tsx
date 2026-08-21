// apps/admin/src/components/inventory/LowStockWidget.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../Icon';
import { adminData } from '../../services/adminData';

export function LowStockWidget() {
    const navigate = useNavigate();
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const response = await adminData.inventory();
                const lowStock = (response.data?.items || response.data || [])
                    .filter((item: any) => {
                        const stock = item.inventory?.quantity ?? item.stockQuantity ?? 0;
                        return stock <= 10 && stock > 0;
                    })
                    .slice(0, 5);
                setItems(lowStock);
            } catch {
                // Silently fail
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="panel">
                <div className="panel-head">
                    <div>
                        <span className="panel-kicker">Inventory</span>
                        <h3>Low stock</h3>
                    </div>
                </div>
                <div className="state-view" style={{ minHeight: 120 }}>
                    <div className="loader-line" />
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="panel">
                <div className="panel-head">
                    <div>
                        <span className="panel-kicker">Inventory</span>
                        <h3>Low stock</h3>
                    </div>
                </div>
                <div className="state-view" style={{ minHeight: 120 }}>
                    <div className="icon-success">
                        <Icon name="Check" size={24} />
                    </div>
                    <strong style={{ fontSize: 14, fontWeight: 500 }}>All stocked</strong>
                    <span style={{ fontSize: 11, color: '#8a8881' }}>No items need attention.</span>
                </div>
            </div>
        );
    }

    return (
        <div className="panel">
            <div className="panel-head">
                <div>
                    <span className="panel-kicker">Inventory</span>
                    <h3>Low stock</h3>
                </div>
                <button className="text-btn" onClick={() => navigate('/inventory')}>
                    View all
                </button>
            </div>
            <div className="low-stock-list">
                {items.map((item) => {
                    const stock = item.inventory?.quantity ?? item.stockQuantity ?? 0;
                    return (
                        <button
                            key={item.id}
                            className="low-stock-item"
                            onClick={() => navigate(`/products/${item.productId}`)}
                        >
                            <div>
                                <strong>{item.product?.name || 'Unknown'}</strong>
                                <span>{item.sku}</span>
                            </div>
                            <span className="stock-badge warning">{stock} left</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}