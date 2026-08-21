import { products, orders } from '../data/mock';
import { Icon } from '../components/Icon';

const configs: Record<
  string,
  {
    kicker: string;
    title: string;
    desc: string;
    columns: string[];
    rows: string[][];
  }
> = {
  products: {
    kicker: 'Catalog',
    title: 'Products',
    desc: 'Manage the catalog, variants, pricing and publishing state.',
    columns: ['Product', 'Category', 'Price', 'Stock', 'Status'],
    rows: products.map((p) => [
      p.name,
      p.category,
      p.price,
      String(p.stock),
      p.status
    ])
  },
  categories: {
    kicker: 'Catalog',
    title: 'Categories',
    desc: 'Organize your store around clear, discoverable collections.',
    columns: ['Category', 'Products', 'Visibility', 'Updated'],
    rows: [
      ['Apparel', '84', 'Visible', 'Today'],
      ['Shoes', '42', 'Visible', 'Yesterday'],
      ['Watches', '31', 'Visible', 'Aug 16'],
      ['Electronics', '67', 'Visible', 'Aug 15'],
      ['Accessories', '53', 'Hidden', 'Aug 12']
    ]
  },
  inventory: {
    kicker: 'Operations',
    title: 'Inventory',
    desc: 'Monitor stock levels and identify items that need attention.',
    columns: ['Product', 'SKU', 'Available', 'Reserved', 'Status'],
    rows: [
      ['Studio Overshirt', 'ORY-SO-07', '9', '3', 'Low stock'],
      ['Field Tote 02', 'ORY-FT-02', '0', '0', 'Out of stock'],
      ['Form 01 Chronograph', 'ORY-FC-01', '24', '5', 'Healthy'],
      ['Arc Wireless Headphones', 'ORY-AW-01', '37', '8', 'Healthy'],
      ['No. 07 Leather Loafer', 'ORY-LL-07', '61', '12', 'Healthy']
    ]
  },
  orders: {
    kicker: 'Commerce',
    title: 'Orders',
    desc: 'Review purchases, payment state and fulfillment progress.',
    columns: ['Order', 'Customer', 'Date', 'Total', 'Status'],
    rows: orders.map((o) => [o.id, o.customer, o.date, o.total, o.status])
  },
  customers: {
    kicker: 'Commerce',
    title: 'Customers',
    desc: 'Understand customers, account status and purchasing activity.',
    columns: ['Customer', 'Email', 'Orders', 'Spend', 'Status'],
    rows: [
      ['Maya Chen', 'maya@example.com', '14', '$2,840', 'Active'],
      ['Daniel Reed', 'daniel@example.com', '8', '$1,492', 'Active'],
      ['Sofia Malik', 'sofia@example.com', '21', '$6,420', 'Active'],
      ['Noah Williams', 'noah@example.com', '3', '$294', 'Active'],
      ['Ava Morgan', 'ava@example.com', '17', '$4,180', 'Active']
    ]
  },
  reviews: {
    kicker: 'Growth',
    title: 'Reviews',
    desc: 'Moderate customer feedback and protect the quality of the storefront.',
    columns: ['Customer', 'Product', 'Rating', 'Submitted', 'Status'],
    rows: [
      ['Maya Chen', 'Form 01 Chronograph', '5 / 5', 'Today', 'Published'],
      ['Owen Price', 'Studio Overshirt', '4 / 5', 'Today', 'Pending'],
      ['Sofia Malik', 'Field Tote 02', '5 / 5', 'Yesterday', 'Published'],
      ['Liam Ford', 'No. 07 Leather Loafer', '2 / 5', 'Yesterday', 'Flagged']
    ]
  },
  discounts: {
    kicker: 'Growth',
    title: 'Discounts',
    desc: 'Create and manage promotion rules without compromising pricing authority.',
    columns: ['Code', 'Type', 'Value', 'Uses', 'Status'],
    rows: [
      ['WELCOME10', 'Percentage', '10%', '842', 'Active'],
      ['SUMMER26', 'Percentage', '20%', '184', 'Active'],
      ['ORYN150', 'Fixed', '$150', '42', 'Scheduled'],
      ['VIP25', 'Percentage', '25%', '61', 'Paused']
    ]
  },
  returns: {
    kicker: 'Operations',
    title: 'Returns',
    desc: 'Track return requests, eligibility and refund progress.',
    columns: ['Return', 'Customer', 'Order', 'Reason', 'Status'],
    rows: [
      ['RET-1082', 'Maya Chen', '#ORY-10420', 'Size', 'Approved'],
      ['RET-1081', 'Owen Price', '#ORY-10392', 'Changed mind', 'Pending'],
      ['RET-1079', 'Liam Ford', '#ORY-10370', 'Defective', 'Refunded']
    ]
  },
  payments: {
    kicker: 'Operations',
    title: 'Payments',
    desc: 'Monitor transaction state, failures and refunds.',
    columns: ['Transaction', 'Order', 'Method', 'Amount', 'Status'],
    rows: [
      ['PAY-8842', '#ORY-10482', 'Mock card', '$284.00', 'Paid'],
      ['PAY-8841', '#ORY-10481', 'Mock card', '$148.50', 'Paid'],
      ['PAY-8840', '#ORY-10479', 'Mock card', '$94.00', 'Pending'],
      ['PAY-8839', '#ORY-10477', 'Mock card', '$218.00', 'Refunded']
    ]
  },
  shipping: {
    kicker: 'Operations',
    title: 'Shipping',
    desc: 'Configure delivery methods and monitor fulfillment.',
    columns: ['Method', 'Region', 'Price', 'ETA', 'Status'],
    rows: [
      ['Standard', 'Domestic', '$8', '3–5 days', 'Active'],
      ['Express', 'Domestic', '$18', '1–2 days', 'Active'],
      ['Free shipping', 'Domestic', '$0', '5–7 days', 'Active']
    ]
  },
  notifications: {
    kicker: 'Operations',
    title: 'Notifications',
    desc: 'Manage customer communication and delivery events.',
    columns: ['Notification', 'Audience', 'Channel', 'Sent', 'Status'],
    rows: [
      ['Order confirmed', 'Customers', 'In-app', '1,284', 'Active'],
      ['Shipment update', 'Customers', 'In-app', '984', 'Active'],
      ['Summer Edit', 'All customers', 'In-app', '8,492', 'Scheduled']
    ]
  },
  administrators: {
    kicker: 'Control',
    title: 'Administrators',
    desc: 'Control access to ORYN operations and sensitive commerce data.',
    columns: ['Administrator', 'Role', 'Last sign in', 'Status'],
    rows: [
      ['Alex Grant', 'Platform Owner', 'Just now', 'Active'],
      ['Olivia Grant', 'Platform Admin', '12 min ago', 'Active'],
      ['Marcus Lee', 'Catalog Manager', 'Yesterday', 'Active'],
      ['Nora Shah', 'Support Manager', 'Aug 16', 'Suspended']
    ]
  },
  roles: {
    kicker: 'Control',
    title: 'Roles & permissions',
    desc: 'Define exactly what each administrator can see and change.',
    columns: ['Role', 'Members', 'Products', 'Orders', 'Settings'],
    rows: [
      ['Platform Owner', '1', 'Full', 'Full', 'Full'],
      ['Platform Admin', '1', 'Full', 'Full', 'Manage'],
      ['Catalog Manager', '1', 'Manage', 'View', 'None'],
      ['Support Manager', '1', 'View', 'Manage', 'None']
    ]
  },
  'audit-logs': {
    kicker: 'Control',
    title: 'Audit logs',
    desc: 'A traceable record of sensitive administrator activity.',
    columns: ['Actor', 'Action', 'Resource', 'Time', 'Result'],
    rows: [
      ['Alex Grant', 'Updated role', 'Olivia Grant', '10:24', 'Success'],
      ['Marcus Lee', 'Published product', 'Studio Overshirt', '09:31', 'Success'],
      ['Olivia Grant', 'Exported orders', 'Orders', 'Yesterday', 'Success'],
      ['Nora Shah', 'Login attempt', 'Admin', 'Aug 16', 'Blocked']
    ]
  }
};

export function ResourcePage({ resource }: { resource: string }) {
  const config = configs[resource] ?? configs.products;

  return (
    <div className="resource-page">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">{config.kicker}</p>
          <h2>{config.title}</h2>
          <p>{config.desc}</p>
        </div>
        <button className="primary-btn">
          <Icon name="Plus" size={16} /> Create new
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-field">
          <Icon name="Search" size={16} />
          <input placeholder={`Search ${config.title.toLowerCase()}...`} />
        </div>
        <button className="secondary-btn">
          <Icon name="SlidersHorizontal" size={15} /> Filters
        </button>
        <button className="secondary-btn">
          Export <Icon name="Download" size={15} />
        </button>
      </div>

      {/* Table */}
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {config.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.rows.map((row, index) => (
                <tr key={index}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>
                      {cellIndex === 0 ? (
                        <strong>{cell}</strong>
                      ) : cellIndex === row.length - 1 ? (
                        <span className={`status ${cell.toLowerCase().replaceAll(' ', '-')}`}>
                          {cell}
                        </span>
                      ) : (
                        cell
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="pagination">
          <span>
            Showing 1–{config.rows.length} of {config.rows.length + 28}
          </span>
          <div>
            <button className="icon-btn">
              <Icon name="ChevronLeft" size={15} />
            </button>
            <button className="page-current">1</button>
            <button className="icon-btn">
              <Icon name="ChevronRight" size={15} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}