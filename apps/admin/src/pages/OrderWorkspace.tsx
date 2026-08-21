import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';

type OrderItem = {
  id: string;
  productName: string;
  variantSnapshot: {
    attributes?: Record<string, unknown>;
  };
  quantity: number;
  unitPrice: string | number;
  lineTotal: string | number;
};

type Order = {
  id: string;
  status: string;
  paymentStatus: string;
  subtotal: string | number;
  shippingTotal: string | number;
  taxTotal: string | number;
  total: string | number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  addressId: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  address: {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  items: OrderItem[];
  payment: {
    id: string;
    status: string;
    amount: string | number;
    provider: string;
    transactions: Array<{
      id: string;
      status: string;
      amount: string | number;
      providerReference?: string;
      createdAt: string;
    }>;
  };
  statusHistory: Array<{
    id: string;
    status: string;
    note?: string;
    createdAt: string;
  }>;
};

const formatMoney = (value: string | number) => `$${Number(value).toFixed(2)}`;
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`status ${String(value).toLowerCase().replaceAll('_', '-')}`}>
      {String(value).replaceAll('_', ' ')}
    </span>
  );
}

export function OrderWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminData.order(id);
      setOrder(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load order');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="state-view">
        <div className="loader-line" />
        <p>Loading order…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-view">
        <p>{error}</p>
        <button className="secondary-btn" onClick={fetchOrder}>
          Retry
        </button>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="state-view">
        <p>Order not found</p>
      </div>
    );
  }

  return (
    <div className="order-workspace">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Order detail</p>
          <h2>ORYN-{order.id.slice(-8).toUpperCase()}</h2>
          <div className="order-meta">
            <span>Placed: {formatDate(order.createdAt)}</span>
            <StatusBadge value={order.status} />
            <StatusBadge value={order.paymentStatus} />
          </div>
        </div>
        <button className="secondary-btn" onClick={() => navigate('/orders')}>
          <Icon name="ArrowLeft" size={15} /> Back to orders
        </button>
      </div>

      {/* Customer Info */}
      <section className="panel">
        <div className="panel-head">
          <h3>Customer</h3>
        </div>
        <div className="customer-info">
          <p>
            <strong>{order.user?.firstName} {order.user?.lastName}</strong>
          </p>
          <p>{order.user?.email}</p>
        </div>
      </section>

      {/* Shipping Address */}
      {order.address && (
        <section className="panel">
          <div className="panel-head">
            <h3>Shipping address</h3>
          </div>
          <div className="address-info">
            <p>
              <strong>{order.address.label}</strong>
            </p>
            <p>
              {order.address.firstName} {order.address.lastName}
            </p>
            <p>
              {order.address.line1}
              {order.address.line2 && (
                <>
                  <br />
                  {order.address.line2}
                </>
              )}
            </p>
            <p>
              {order.address.city}
              {order.address.state && `, ${order.address.state}`}{' '}
              {order.address.postalCode}
            </p>
            <p>{order.address.country}</p>
            <p>{order.address.phone}</p>
          </div>
        </section>
      )}

      {/* Order Items */}
      <section className="panel">
        <div className="panel-head">
          <h3>Items</h3>
          <span className="badge">{order.items?.length || 0} items</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Variant</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items?.map((item) => (
                <tr key={item.id}>
                  <td>
                    <strong>{item.productName}</strong>
                  </td>
                  <td>
                    {item.variantSnapshot?.attributes
                      ? Object.entries(item.variantSnapshot.attributes)
                        .map(([key, value]) => `${key}: ${String(value)}`)
                        .join(', ')
                      : '—'}
                  </td>
                  <td>{item.quantity}</td>
                  <td>{formatMoney(item.unitPrice)}</td>
                  <td>{formatMoney(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-foot">
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatMoney(order.subtotal)}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>{formatMoney(order.shippingTotal)}</span>
            </div>
            {Number(order.taxTotal) > 0 && (
              <div className="summary-row">
                <span>Tax</span>
                <span>{formatMoney(order.taxTotal)}</span>
              </div>
            )}
            <div className="summary-row total">
              <strong>Total</strong>
              <strong>{formatMoney(order.total)}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Details */}
      {order.payment && (
        <section className="panel">
          <div className="panel-head">
            <h3>Payment</h3>
            <StatusBadge value={order.payment.status} />
          </div>
          <div className="payment-info">
            <p>
              <strong>Provider:</strong> {order.payment.provider}
            </p>
            <p>
              <strong>Amount:</strong> {formatMoney(order.payment.amount)}
            </p>
            {order.payment.transactions?.length > 0 && (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Transaction</th>
                      <th>Status</th>
                      <th>Amount</th>
                      <th>Reference</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.payment.transactions.map((tx) => (
                      <tr key={tx.id}>
                        <td className="mono">{tx.id.slice(-8).toUpperCase()}</td>
                        <td>
                          <StatusBadge value={tx.status} />
                        </td>
                        <td>{formatMoney(tx.amount)}</td>
                        <td className="mono">{tx.providerReference || '—'}</td>
                        <td>{formatDate(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Status History */}
      {order.statusHistory?.length > 0 && (
        <section className="panel">
          <div className="panel-head">
            <h3>Status history</h3>
          </div>
          <div className="timeline">
            {order.statusHistory.map((entry, index) => (
              <div key={entry.id} className="timeline-item">
                <div className="timeline-marker" />
                <div className="timeline-content">
                  <div className="timeline-header">
                    <StatusBadge value={entry.status} />
                    <span className="timeline-date">{formatDate(entry.createdAt)}</span>
                  </div>
                  {entry.note && <p className="timeline-note">{entry.note}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Actions */}
      <div className="order-actions">
        <button
          className="primary-btn"
          onClick={() => {
            // Navigate to update order page or open modal
            alert('Order update functionality coming soon!');
          }}
        >
          <Icon name="Pencil" size={15} /> Update order
        </button>
        <button
          className="secondary-btn danger-outline"
          onClick={() => {
            if (confirm('Are you sure you want to cancel this order?')) {
              // Handle order cancellation
            }
          }}
        >
          <Icon name="X" size={15} /> Cancel order
        </button>
      </div>
    </div>
  );
}