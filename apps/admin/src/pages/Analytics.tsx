import { useEffect, useState } from 'react';
import { Icon } from '../components/Icon';
import { adminData } from '../services/adminData';

export function Analytics() {
  const [data, setData] = useState<any>(null); const [error, setError] = useState('');
  useEffect(() => { adminData.analytics().then(r => setData(r.data)).catch(e => setError(e instanceof Error ? e.message : 'Unable to load analytics')); }, []);
  if (error) return <div className="state-view"><p>{error}</p><button className="secondary-btn" onClick={() => location.reload()}>Retry</button></div>;
  if (!data) return <div className="state-view"><div className="loader-line"/><p>Loading analytics…</p></div>;
  const max = Math.max(...(data.salesByDay ?? []).map((x:any) => Number(x.revenue)), 1);
  return <div className="analytics-page"><div className="page-intro"><div><p className="eyebrow">Growth intelligence</p><h2>Analytics</h2><p>Read the commerce signals behind ORYN's real orders and payments.</p></div><button className="secondary-btn" onClick={() => location.reload()}><Icon name="RefreshCw" size={15}/> Refresh</button></div>
    <div className="analytics-grid"><section className="panel analytics-chart"><div className="panel-head"><div><p className="panel-kicker">Paid revenue</p><h3>Last 30 active days</h3></div></div><div className="analytics-bars">{(data.salesByDay ?? []).map((x:any)=><div className="analytics-bar-col" key={x.day}><div className="analytics-bar" style={{height:`${Math.max(4,(Number(x.revenue)/max)*180)}px`}} title={`${x.day}: $${Number(x.revenue).toFixed(2)}`}/><span>{x.day.slice(5)}</span></div>)}</div></section>
    <section className="panel analytics-side"><div className="panel-head"><div><p className="panel-kicker">Top products</p><h3>Units sold</h3></div></div><div className="analytics-list">{data.topProducts?.map((x:any,i:number)=><div key={x.productId}><span>{String(i+1).padStart(2,'0')}</span><strong>{x.name}</strong><em>{x.quantity}</em></div>)}</div></section></div>
    <div className="analytics-grid secondary"><section className="panel"><div className="panel-head"><div><p className="panel-kicker">Orders</p><h3>Status distribution</h3></div></div><div className="metric-list">{data.ordersByStatus?.map((x:any)=><div key={x.status}><span>{x.status.replaceAll('_',' ')}</span><strong>{x._count._all}</strong></div>)}</div></section><section className="panel"><div className="panel-head"><div><p className="panel-kicker">Payments</p><h3>Provider state</h3></div></div><div className="metric-list">{data.paymentsByStatus?.map((x:any)=><div key={x.status}><span>{x.status}</span><strong>{x._count._all}</strong><em>${Number(x._sum.amount ?? 0).toFixed(2)}</em></div>)}</div></section></div>
  </div>;
}
