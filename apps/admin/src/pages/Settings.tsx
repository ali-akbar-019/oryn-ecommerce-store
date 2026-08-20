import { Icon } from '../components/Icon';

export function Settings() {
  const sections = [
    ['Store identity','ORYN','ORYN Commerce Store','General'],
    ['Storefront','Appearance','Editorial light theme','Design'],
    ['Commerce','Currency','USD · United States Dollar','Commerce'],
    ['Shipping','Default method','Standard · 3–5 business days','Commerce'],
    ['Returns','Window','30 days from delivery','Commerce'],
    ['Security','Session policy','8 hours · refresh enabled','Security'],
  ];
  return <div className="settings-page"><div className="page-intro"><div><p className="eyebrow">CONTROL</p><h2>Settings</h2><p>Configure store behavior without changing application code.</p></div><button className="primary-btn"><Icon name="Save" size={16}/> Save changes</button></div><div className="settings-grid">{sections.map(([label,key,value,group])=><article className="setting-card" key={key}><div className="setting-icon"><Icon name={group==='Security'?'Shield':'SlidersHorizontal'} /></div><div><span>{label}</span><h3>{key}</h3><p>{value}</p></div><Icon name="ChevronRight" size={17}/></article>)}</div></div>;
}
