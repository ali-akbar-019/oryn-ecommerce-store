import { stats, revenue, orders, activities } from '../data/mock';
import { Icon } from '../components/Icon';

function statusClass(status: string) { return status.toLowerCase().replaceAll(' ', '-'); }

export function Dashboard() {
  const max = Math.max(...revenue.map(([, value]) => Number(value)));
  return <div className="dashboard-page">
    <div className="page-intro"><div><p className="eyebrow">WEDNESDAY, AUGUST 19</p><h2>Good morning, Alex.</h2><p>Here’s what’s happening across your store today.</p></div><button className="primary-btn"><Icon name="Plus" size={16}/> New product</button></div>
    <section className="stat-grid">{stats.map(stat => <article className="stat-card" key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong><div><em>{stat.delta}</em><small>{stat.note}</small></div></article>)}</section>
    <section className="dashboard-grid">
      <article className="panel revenue-panel"><div className="panel-head"><div><span className="panel-kicker">Performance</span><h3>Revenue overview</h3></div><button className="select-btn">Last 8 months <Icon name="ChevronDown" size={14}/></button></div><div className="chart"><div className="chart-y"><span>$120k</span><span>$90k</span><span>$60k</span><span>$30k</span><span>$0</span></div><div className="bars">{revenue.map(([month, value]) => <div className="bar-col" key={month}><div className="bar" style={{height: `${(Number(value)/max)*100}%`}}><span>${value}k</span></div><small>{month}</small></div>)}</div></div></article>
      <article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Live feed</span><h3>Recent activity</h3></div><button className="text-btn">View all</button></div><div className="activity-list">{activities.map(([time, text, type]) => <div className="activity" key={time}><span className="activity-line"/><div><p>{text}</p><small>{time} · {type}</small></div></div>)}</div></article>
    </section>
    <section className="panel table-panel"><div className="panel-head"><div><span className="panel-kicker">Commerce</span><h3>Recent orders</h3></div><button className="text-btn">View orders <Icon name="ArrowUpRight" size={14}/></button></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th>Payment</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><strong>{order.id}</strong></td><td>{order.customer}</td><td>{order.date}</td><td><strong>{order.total}</strong></td><td><span className={`status ${statusClass(order.status)}`}>{order.status}</span></td><td>{order.payment}</td></tr>)}</tbody></table></div></section>
  </div>;
}
