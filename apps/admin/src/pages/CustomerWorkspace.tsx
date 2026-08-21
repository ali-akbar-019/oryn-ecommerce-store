import { useEffect, useState } from 'react';

import { useParams } from 'react-router-dom';

import { adminData } from '../services/adminData';

import { Icon } from '../components/Icon';

type Address = {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  isDefault: boolean;
};

type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  createdAt: string;
  addresses: Address[];
  orders: any[];
  reviews: any[];
};

export function CustomerWorkspace() {
  const { id } = useParams<{ id: string }>();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomer = async () => {
    if (!id) return;

    setLoading(true);
    setError('');

    try {
      const response = await adminData.customer(id);
      setCustomer(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load customer');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loading) {
    return (
      <div className="state-view">
        <div className="loader-line" />
        <p>Loading customer…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-view">
        <p>{error}</p>
        <button className="secondary-btn" onClick={fetchCustomer}>
          Retry
        </button>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="state-view">
        <p>Customer not found</p>
      </div>
    );
  }

  return (
    <div className="customer-workspace">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Customer detail</p>
          <h2>
            {customer.firstName} {customer.lastName}
          </h2>
          <p>{customer.email}</p>

          <div className="customer-meta">
            <span className="status-badge">{customer.status}</span>
            <span>
              Joined: {new Date(customer.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        <button
          className="secondary-btn"
          onClick={() => window.history.back()}
        >
          <Icon name="ArrowLeft" size={15} />
          Back
        </button>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card">
          <p className="summary-label">Orders</p>
          <p className="summary-value">
            {customer.orders?.length || 0}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Reviews</p>
          <p className="summary-value">
            {customer.reviews?.length || 0}
          </p>
        </div>

        <div className="summary-card">
          <p className="summary-label">Addresses</p>
          <p className="summary-value">
            {customer.addresses?.length || 0}
          </p>
        </div>
      </div>

      {/* Addresses Section */}
      <section className="panel">
        <div className="panel-head">
          <h3>Addresses</h3>
          <span className="badge">
            {customer.addresses?.length || 0}
          </span>
        </div>

        {customer.addresses?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Name</th>
                  <th>City</th>
                  <th>Country</th>
                  <th>Default</th>
                </tr>
              </thead>

              <tbody>
                {customer.addresses.map((address: Address) => (
                  <tr key={address.id}>
                    <td>
                      <strong>{address.label}</strong>
                    </td>
                    <td>
                      {address.firstName} {address.lastName}
                    </td>
                    <td>{address.city}</td>
                    <td>{address.country}</td>
                    <td>
                      {address.isDefault ? (
                        <span className="status-badge">
                          <Icon name="Check" size={13} />
                          Yes
                        </span>
                      ) : (
                        'No'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No addresses saved.</p>
          </div>
        )}
      </section>

      {/* Orders Section */}
      <section className="panel">
        <div className="panel-head">
          <h3>Recent Orders</h3>
          <span className="badge">
            {customer.orders?.length || 0}
          </span>
        </div>

        {customer.orders?.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Total</th>
                </tr>
              </thead>

              <tbody>
                {customer.orders.slice(0, 10).map((order: any) => (
                  <tr key={order.id}>
                    <td>
                      ORYN-{order.id.slice(-8).toUpperCase()}
                    </td>

                    <td>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <span className="status-badge">
                        {order.status}
                      </span>
                    </td>

                    <td>
                      ${Number(order.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <p>No orders yet.</p>
          </div>
        )}
      </section>

      {/* Reviews Section */}
      <section className="panel">
        <div className="panel-head">
          <h3>Reviews</h3>
          <span className="badge">
            {customer.reviews?.length || 0}
          </span>
        </div>

        {customer.reviews?.length ? (
          <div className="reviews-list">
            {customer.reviews.slice(0, 5).map((review: any) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <strong>
                    {review.product?.name || 'Unknown Product'}
                  </strong>

                  <span className="rating">
                    <Icon name="Star" size={14} />
                    {review.rating}/5
                  </span>
                </div>

                <p>{review.body}</p>

                <small>
                  {new Date(review.createdAt).toLocaleDateString()}
                </small>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No reviews yet.</p>
          </div>
        )}
      </section>
    </div>
  );
}