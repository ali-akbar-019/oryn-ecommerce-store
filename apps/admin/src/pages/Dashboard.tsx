import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';
import { InlineState } from '../components/feedback/InlineState';

const money=(v:number)=>`$${Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}`;
export function Dashboard(){
 const navigate=useNavigate(); const [data,setData]=useState<any>(null); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 const load=async()=>{setLoading(true);setError('');try{const r=await adminData.dashboard();setData(r.data)}catch(e){setError(e instanceof Error?e.message:'Unable to load dashboard')}finally{setLoading(false)}};
 useEffect(()=>{void load()},[]);
 if(error)return <InlineState title="Dashboard unavailable" message={error} action="Retry" onAction={load}/>;
 const cards=[['Active products',data?.products??0,'Catalog'],['Orders',data?.orders??0,'All orders'],['Customers',data?.customers??0,'Customer accounts'],['Paid revenue',money(data?.revenue??0),'Captured orders']];
 return <div className="dashboard-page"><div className="page-intro"><div><p className="eyebrow">LIVE COMMERCE</p><h2>Store overview</h2><p>Operational metrics calculated from persisted ORYN commerce data.</p></div><button className="primary-btn" onClick={()=>navigate('/products/new')}><Icon name="Plus" size={16}/> New product</button></div>
 <section className="stat-grid">{cards.map(([label,value,note])=><article className="stat-card" key={String(label)}><span>{label}</span><strong>{loading?'—':value}</strong><div><small>{note}</small></div></article>)}</section>
 <section className="dashboard-grid"><article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Attention</span><h3>Operational health</h3></div><button className="secondary-btn" onClick={load}><Icon name="RefreshCw" size={14}/> Refresh</button></div><div className="health-grid"><button onClick={()=>navigate('/orders')}><span>Pending orders</span><strong>{loading?'—':data?.pendingOrders??0}</strong><small>Needs fulfillment attention</small></button><button onClick={()=>navigate('/inventory')}><span>Low stock variants</span><strong>{loading?'—':data?.lowStock??0}</strong><small>At or below threshold</small></button></div></article>
 <article className="panel activity-panel"><div className="panel-head"><div><span className="panel-kicker">Catalog</span><h3>Top products</h3></div></div><div className="rank-list">{(data?.topProducts??[]).map((p:any,i:number)=><button key={p.productId} onClick={()=>navigate(`/products/${p.productId}`)}><span className="rank">{String(i+1).padStart(2,'0')}</span><span>{p.name}</span><strong>{p.quantity} sold</strong></button>)}{!data?.topProducts?.length&&<div className="ops-empty"><span>No sales data yet.</span></div>}</div></article></section>
 <section className="panel table-panel"><div className="panel-head"><div><span className="panel-kicker">Commerce</span><h3>Recent orders</h3></div><button className="secondary-btn" onClick={()=>navigate('/orders')}>View all <Icon name="ArrowRight" size={14}/></button></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{(data?.recentOrders??[]).map((o:any)=><tr key={o.id} onClick={()=>navigate(`/orders/${o.id}`)} className="clickable-row"><td className="mono">{o.id.slice(0,10).toUpperCase()}</td><td>{o.user?.firstName} {o.user?.lastName}</td><td>{money(o.total)}</td><td><span className={`status ${String(o.paymentStatus).toLowerCase()}`}>{o.paymentStatus}</span></td><td><span className={`status ${String(o.status).toLowerCase().replaceAll('_','-')}`}>{String(o.status).replaceAll('_',' ')}</span></td></tr>)}</tbody></table></div></section>
 </div>
}
