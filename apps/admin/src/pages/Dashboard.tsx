import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';
import { InlineState } from '../components/feedback/InlineState';

type DashboardData = { products: number; orders: number; customers: number; revenue: number };
export function Dashboard() {
  const navigate = useNavigate(); const [data,setData]=useState<DashboardData|null>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
  const load=async()=>{setLoading(true);setError('');try{const result=await adminData.dashboard();setData(result.data)}catch(e){setError(e instanceof Error?e.message:'Unable to load dashboard')}finally{setLoading(false)}};
  useEffect(()=>{void load()},[]);
  if(error) return <InlineState title="Dashboard unavailable" message={error} action="Retry" onAction={load}/>;
  const cards=[['Active products',data?.products??0,'Catalog'],['Orders',data?.orders??0,'All time'],['Customers',data?.customers??0,'Customer accounts'],['Paid revenue',data?`$${data.revenue.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})`:'—','Paid orders']];
  return <div className="dashboard-page"><div className="page-intro"><div><p className="eyebrow">LIVE COMMERCE</p><h2>Store overview</h2><p>Operational metrics from the connected ORYN backend.</p></div><button className="primary-btn" onClick={()=>navigate('/products/new')}><Icon name="Plus" size={16}/> New product</button></div>
    <section className="stat-grid">{cards.map(([label,value,note])=><article className="stat-card" key={String(label)}><span>{label}</span><strong>{loading?'—':value}</strong><div><small>{note}</small></div></article>)}</section>
    <section className="dashboard-grid"><article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Connected</span><h3>Commerce system</h3></div><span className="status active">LIVE</span></div><div className="activity-list"><div className="activity"><span className="activity-line"/><div><p>Catalog data is served from Prisma + MySQL.</p><small>Products and inventory are no longer dashboard mock data.</small></div></div><div className="activity"><span className="activity-line"/><div><p>Orders and revenue are calculated from persisted records.</p><small>Payment state remains mock by design.</small></div></div></div></article><article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Next</span><h3>Operational shortcuts</h3></div></div><div className="activity-list"><button className="activity activity-button" onClick={()=>navigate('/products')}><span className="activity-line"/><div><p>Manage products</p><small>Catalog, variants and publishing</small></div><Icon name="ArrowUpRight" size={15}/></button><button className="activity activity-button" onClick={()=>navigate('/inventory')}><span className="activity-line"/><div><p>Review inventory</p><small>Stock levels and adjustments</small></div><Icon name="ArrowUpRight" size={15}/></button><button className="activity activity-button" onClick={()=>navigate('/orders')}><span className="activity-line"/><div><p>Open orders</p><small>Fulfillment and payment states</small></div><Icon name="ArrowUpRight" size={15}/></button></div></article></section>
  </div>;
}
