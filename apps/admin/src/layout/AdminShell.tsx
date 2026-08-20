import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../components/Icon';

const groups = [
  { label: 'Overview', items: [{ to: '/', label: 'Dashboard', icon: 'LayoutDashboard' }] },
  { label: 'Commerce', items: [
    { to: '/products', label: 'Products', icon: 'Package' },
    { to: '/categories', label: 'Categories', icon: 'PanelsTopLeft' },
    { to: '/inventory', label: 'Inventory', icon: 'Boxes' },
    { to: '/orders', label: 'Orders', icon: 'ReceiptText' },
    { to: '/customers', label: 'Customers', icon: 'Users' },
  ]},
  { label: 'Growth', items: [
    { to: '/reviews', label: 'Reviews', icon: 'MessageSquareText' },
    { to: '/discounts', label: 'Discounts', icon: 'Tag' },
    { to: '/returns', label: 'Returns', icon: 'Undo2' },
    { to: '/analytics', label: 'Analytics', icon: 'ChartNoAxesCombined' },
  ]},
  { label: 'Operations', items: [
    { to: '/payments', label: 'Payments', icon: 'CreditCard' },
    { to: '/shipping', label: 'Shipping', icon: 'Truck' },
    { to: '/notifications', label: 'Notifications', icon: 'Bell' },
  ]},
  { label: 'Control', items: [
    { to: '/administrators', label: 'Administrators', icon: 'ShieldCheck' },
    { to: '/roles', label: 'Roles & permissions', icon: 'KeyRound' },
    { to: '/audit-logs', label: 'Audit logs', icon: 'ScrollText' },
    { to: '/settings', label: 'Settings', icon: 'Settings2' },
  ]},
];

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const title = location.pathname === '/' ? 'Dashboard' : location.pathname.slice(1).replaceAll('-', ' ');

  return <div className={collapsed ? 'admin-shell collapsed' : 'admin-shell'}>
    <aside className="sidebar">
      <div className="brand-row">
        <div className="brand-mark">O</div>
        {!collapsed && <div><strong>ORYN</strong><span>Commerce OS</span></div>}
        <button className="icon-btn collapse-btn" onClick={() => setCollapsed(v => !v)} aria-label="Toggle sidebar"><Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} /></button>
      </div>
      <div className="store-switch"><span className="status-dot" />{!collapsed && <><span>ORYN Store</span><Icon name="ChevronsUpDown" size={14} /></>}</div>
      <nav>{groups.map(group => <div className="nav-group" key={group.label}>{!collapsed && <div className="nav-label">{group.label}</div>}{group.items.map(item => <NavLink key={item.to} to={item.to} end={item.to === '/'} title={collapsed ? item.label : undefined}><Icon name={item.icon as never} /><span>{!collapsed && item.label}</span></NavLink>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="admin-avatar">AG</div>{!collapsed && <div><strong>Alex Grant</strong><span>Platform Admin</span></div>}<button className="icon-btn"><Icon name="MoreHorizontal" /></button></div>
    </aside>
    <main className="main-area">
      <header className="topbar">
        <div><div className="breadcrumb">ORYN / <span>{title}</span></div><h1>{title}</h1></div>
        <div className="top-actions"><button className="icon-btn"><Icon name="Search" /></button><button className="icon-btn"><Icon name="Bell" /></button><div className="top-avatar">AG</div></div>
      </header>
      <div className="page-content"><Outlet /></div>
    </main>
  </div>;
}
