import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';

export function CustomerWorkspace() {
  const { id } = useParams<{ id: string }>();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      adminData.customer(id).then(r => setCustomer(r.data)).finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <div className="state-view"><div className="loader-line"/><p>Loading customer…</p></div>;
  if (!customer) return <div className="state-view"><p>Customer not found</p></div>;

  return <div className="customer-workspace">
    <div className="page-intro">
      <div>
        <p className="eyebrow">Customer detail</p>
        <h2>{customer.firstName} {customer.lastName}</h2>
        <p>{customer.email}</p>
      </div>
    </div>
    <section className="panel">
      <div className="panel-head"><h3>Addresses</h3></div>
      <div className="table-wrap">
        <table><thead><tr><th>Label</th><th>Name</th><th>City</th><th>Country</th><th>Default</th></tr></thead>
        <tbody>{customer.addresses?.map((a: any) => <tr key={a.id}><td>{a.label}</td><td>{a.firstName} {a.lastName}</td><td>{a.city}</td><td>{a.country}</td><td>{a.isDefault ? 'Yes' : 'No'}</td></tr>)}</tbody></table>
      </div>
    </section>
  </div>;
}