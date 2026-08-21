import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';

export function OrderWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminData.order(id).then(r => setOrder(r.data)).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="state-view"><div className="loader-line"/><p>Loading order…</p></div>;
  if (!order) return <div className="state-view"><p>Order not found</p></div>;

  return <div className="order-workspace">
    <div className="page-intro">
      <div>
        <p className="eyebrow">Order detail</p>
        <h2>Order {id?.slice(0, 10).toUpperCase()}</h2>
      </div>
    </div>
    <section className="panel">
      <div className="panel-head"><h3>Items</h3></div>
      <div className="table-wrap">
        <table><thead><tr><th>Product</th><th>Variant</th><th>Qty</th><th>Price</th><th>Total</th></tr></thead>
        <tbody>{order.items?.map((item: any) => <tr key={item.id}><td>{item.productName}</td><td>{JSON.stringify(item.variantSnapshot?.attributes)}</td><td>{item.quantity}</td><td>${Number(item.unitPrice).toFixed(2)}</td><td>${Number(item.lineTotal).toFixed(2)}</td></tr>)}</tbody></table>
      </div>
      <div className="panel-foot"><strong>Total: ${Number(order.total).toFixed(2)}</strong></div>
    </section>
  </div>;
}