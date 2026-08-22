import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { useAdminAuth } from '../auth/authStore';
import { adminData } from '../services/adminData';

const groups = [
  {
    label: 'Overview',
    items: [{ to: '/', label: 'Dashboard', icon: 'LayoutDashboard' }]
  },
  {
    label: 'Commerce',
    items: [
      { to: '/products', label: 'Products', icon: 'Package' },
      { to: '/categories', label: 'Categories', icon: 'PanelsTopLeft' },
      { to: '/inventory', label: 'Inventory', icon: 'Boxes' },
      { to: '/orders', label: 'Orders', icon: 'ReceiptText' },
      { to: '/customers', label: 'Customers', icon: 'Users' },
    ]
  },
  {
    label: 'Growth',
    items: [
      { to: '/reviews', label: 'Reviews', icon: 'MessageSquareText' },
      { to: '/discounts', label: 'Discounts', icon: 'Tag' },
      { to: '/returns', label: 'Returns', icon: 'Undo2' },
      { to: '/analytics', label: 'Analytics', icon: 'ChartNoAxesCombined' },
    ]
  },
  {
    label: 'Operations',
    items: [
      { to: '/payments', label: 'Payments', icon: 'CreditCard' },
      { to: '/shipping', label: 'Shipping', icon: 'Truck' },
      { to: '/notifications', label: 'Notifications', icon: 'Bell' },
    ]
  },
  {
    label: 'Control',
    items: [
      { to: '/administrators', label: 'Administrators', icon: 'ShieldCheck' },
      { to: '/roles', label: 'Roles & permissions', icon: 'KeyRound' },
      { to: '/audit-logs', label: 'Audit logs', icon: 'ScrollText' },
      { to: '/settings', label: 'Settings', icon: 'Settings2' },
    ]
  },
];

const searchable = groups.flatMap(group => group.items);

export function AdminShell() {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unread, setUnread] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAdminAuth();

  const title = location.pathname === '/'
    ? 'Dashboard'
    : location.pathname.split('/')[1].replaceAll('-', ' ');

  const results = useMemo(
    () => searchable
      .filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 8),
    [query]
  );

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [searchOpen]);

  // Fetch notifications
  useEffect(() => {
    let alive = true;

    adminData.notifications()
      .then(r => {
        if (!alive) return;
        const items = r.data?.items ?? r.data ?? [];
        setNotifications(items.slice(0, 8));
        setUnread(items.filter((n: any) => !n.readAt).length);
      })
      .catch(() => { });

    return () => {
      alive = false;
    };
  }, [location.pathname]);

  async function markRead(id: string, deepLink?: string) {
    try {
      await adminData.markNotificationRead(id);
      setNotifications(items =>
        items.map(n =>
          n.id === id ? { ...n, readAt: new Date().toISOString() } : n
        )
      );
      setUnread(v => Math.max(0, v - 1));
    } catch { }

    if (deepLink?.startsWith('/')) {
      navigate(deepLink);
    }

    setNotificationOpen(false);
  }

  async function markAllRead() {
    try {
      await adminData.markAllNotificationsRead();
      setNotifications(items =>
        items.map(n => ({ ...n, readAt: new Date().toISOString() }))
      );
      setUnread(0);
    } catch { }
  }

  function logout() {
    auth.clear();
    navigate('/login', { replace: true });
  }

  return (
    <div className={collapsed ? 'admin-shell collapsed' : 'admin-shell'}>
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="brand-row">
          <div className="brand-mark">O</div>
          {!collapsed && (
            <div>
              <strong>ORYN</strong>
              <span>Commerce OS</span>
            </div>
          )}
          <button
            className="icon-btn collapse-btn"
            onClick={() => setCollapsed(v => !v)}
            aria-label="Toggle sidebar"
          >
            <Icon name={collapsed ? 'PanelLeftOpen' : 'PanelLeftClose'} />
          </button>
        </div>
        {!collapsed && (
          <button className="store-switch" onClick={() => navigate('/')}>
            <span className="status-dot" />

            <>
              <span>ORYN Store</span>
              <Icon name="ChevronsUpDown" size={14} />
            </>

          </button>
        )}
        <nav>
          {groups.map(group => (
            <div className="nav-group" key={group.label}>
              {!collapsed && <div className="nav-label">{group.label}</div>}
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon name={item.icon as never} />
                  <span>{!collapsed && item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button className="admin-avatar" onClick={() => setProfileOpen(v => !v)}>
            {(auth.user?.firstName?.[0] ?? 'A') + (auth.user?.lastName?.[0] ?? 'G')}
          </button>
          {!collapsed && (
            <button className="sidebar-identity" onClick={() => setProfileOpen(v => !v)}>
              <strong>{auth.user ? `${auth.user.firstName} ${auth.user.lastName}` : 'Platform Admin'}</strong>
              <span>{auth.user?.role?.name ?? 'Administrator'}</span>
            </button>
          )}
          <button
            className="icon-btn more-btn"
            onClick={() => setProfileOpen(v => !v)}
            aria-label="Open account menu"
          >
            <Icon name="MoreHorizontal" />
          </button>
        </div>

        {profileOpen && (
          <div className="popover sidebar-popover">
            <p className="eyebrow">Account</p>
            <strong>{auth.user?.email ?? 'Administrator'}</strong>
            <button onClick={() => { setProfileOpen(false); navigate('/settings'); }}>
              <Icon name="Settings2" size={14} /> Settings
            </button>
            <button onClick={logout}>
              <Icon name="LogOut" size={14} /> Sign out
            </button>
          </div>
        )}
      </aside>

      {/* Main Area */}
      <main className="main-area">
        {/* Top Bar */}
        <header className="topbar">
          <div>
            <div className="breadcrumb">ORYN / <span>{title}</span></div>
            <h1>{title}</h1>
          </div>
          <div className="top-actions">
            <button
              className="icon-btn top-action-btn"
              onClick={() => { setSearchOpen(v => !v); setNotificationOpen(false); setProfileOpen(false); }}
              aria-label="Search"
            >
              <Icon name="Search" />
            </button>

            <button
              className="icon-btn top-action-btn notification-trigger"
              onClick={() => { setNotificationOpen(v => !v); setSearchOpen(false); setProfileOpen(false); }}
              aria-label="Notifications"
            >
              <Icon name="Bell" />
              {unread > 0 && (
                <span className="notification-badge">{unread > 9 ? '9+' : unread}</span>
              )}
            </button>

            <button
              className="top-avatar"
              onClick={() => { setProfileOpen(v => !v); setSearchOpen(false); setNotificationOpen(false); }}
              aria-label="Open profile"
            >
              {(auth.user?.firstName?.[0] ?? 'A') + (auth.user?.lastName?.[0] ?? 'G')}
            </button>
          </div>
        </header>

        {/* Search Popover */}
        {searchOpen && (
          <div className="top-popover search-popover">
            <div className="search-popover-input">
              <Icon name="Search" size={16} />
              <input
                ref={searchRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search admin sections…"
                onKeyDown={e => {
                  if (e.key === 'Escape') setSearchOpen(false);
                  if (e.key === 'Enter' && results[0]) {
                    navigate(results[0].to);
                    setSearchOpen(false);
                  }
                }}
              />
              <kbd>ESC</kbd>
            </div>
            {results.length ? (
              results.map(item => (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to);
                    setSearchOpen(false);
                    setQuery('');
                  }}
                >
                  <Icon name={item.icon as never} size={15} />
                  <span>{item.label}</span>
                  <Icon name="ArrowUpRight" size={13} />
                </button>
              ))
            ) : (
              <div className="popover-empty">No admin section matches "{query}".</div>
            )}
          </div>
        )}

        {/* Notification Popover */}
        {notificationOpen && (
          <div className="top-popover notification-popover">
            <div className="popover-head">
              <div>
                <p className="eyebrow">Activity</p>
                <strong>Notifications</strong>
              </div>
              <button className="text-btn" onClick={markAllRead}>Mark all read</button>
            </div>
            {notifications.length ? (
              notifications.map(n => (
                <button
                  className={`notification-item ${n.readAt ? '' : 'unread'}`}
                  key={n.id}
                  onClick={() => markRead(n.id, n.deepLink)}
                >
                  <span className="notification-dot" />
                  <div>
                    <strong>{n.title}</strong>
                    <p>{n.body}</p>
                    <small>{new Date(n.createdAt).toLocaleString()}</small>
                  </div>
                </button>
              ))
            ) : (
              <div className="popover-empty">No notifications yet.</div>
            )}
            <button
              className="popover-footer"
              onClick={() => { navigate('/notifications'); setNotificationOpen(false); }}
            >
              View all notifications
            </button>
          </div>
        )}

        {/* Profile Popover */}
        {profileOpen && (
          <div className="top-popover profile-popover">
            <p className="eyebrow">Signed in as</p>
            <strong>{auth.user?.firstName} {auth.user?.lastName}</strong>
            <span>{auth.user?.email}</span>
            <button onClick={() => { navigate('/settings'); setProfileOpen(false); }}>
              <Icon name="Settings2" size={14} /> Account settings
            </button>
            <button onClick={logout}>
              <Icon name="LogOut" size={14} /> Sign out
            </button>
          </div>
        )}

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}