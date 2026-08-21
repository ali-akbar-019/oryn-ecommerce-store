import { useEffect, useMemo, useState } from 'react';
import { Icon } from '../components/Icon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { adminData } from '../services/adminData';

type Resource =
  | 'reviews'
  | 'discounts'
  | 'returns'
  | 'payments'
  | 'shipping'
  | 'notifications'
  | 'administrators'
  | 'roles'
  | 'audit-logs';

const META: Record<Resource, [string, string, string]> = {
  reviews: [
    'Growth',
    'Reviews',
    'Moderate customer feedback and protect storefront quality.'
  ],
  discounts: [
    'Growth',
    'Discounts',
    'Create controlled promotions with timing and usage limits.'
  ],
  returns: [
    'Operations',
    'Returns',
    'Review requests and track the refund lifecycle.'
  ],
  payments: [
    'Operations',
    'Payments',
    'Monitor provider state, transactions and refunds.'
  ],
  shipping: [
    'Operations',
    'Shipping',
    'Configure delivery methods and customer-facing delivery rules.'
  ],
  notifications: [
    'Operations',
    'Notifications',
    'Manage customer communication and storefront events.'
  ],
  administrators: [
    'Control',
    'Administrators',
    'Manage access to sensitive ORYN commerce operations.'
  ],
  roles: [
    'Control',
    'Roles & permissions',
    'Define what each administrator can see and change.'
  ],
  'audit-logs': [
    'Control',
    'Audit logs',
    'Trace sensitive administrator activity.'
  ]
};

const formatDate = (value: any) =>
  value
    ? new Date(value).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    : '—';

const formatMoney = (value: any) => `$${Number(value ?? 0).toFixed(2)}`;

function StatusBadge({ value }: { value: string }) {
  return (
    <span className={`status ${String(value).toLowerCase().replaceAll('_', '-')}`}>
      {String(value).replaceAll('_', ' ')}
    </span>
  );
}

// ============ Main Component ============
export function OperationsWorkspace({ resource }: { resource: Resource }) {
  const [rows, setRows] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editor, setEditor] = useState<{
    type: 'create' | 'edit' | 'manage';
    item?: any;
  } | null>(null);
  const [confirm, setConfirm] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      switch (resource) {
        case 'reviews':
          response = await adminData.reviews();
          break;
        case 'discounts':
          response = await adminData.coupons();
          break;
        case 'returns':
          response = await adminData.returns();
          break;
        case 'payments':
          response = await adminData.payments();
          break;
        case 'shipping':
          response = await adminData.shipping();
          break;
        case 'notifications':
          response = await adminData.notifications();
          break;
        case 'administrators':
          response = await adminData.administrators();
          break;
        case 'roles':
          response = await adminData.roles();
          break;
        case 'audit-logs':
          response = await adminData.auditLogs();
          break;
        default:
          response = { data: [] };
      }

      setRows(response.data?.items ?? response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [resource]);

  const filteredRows = useMemo(() => {
    if (!searchQuery) return rows;
    return rows.filter((row) =>
      JSON.stringify(row).toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [rows, searchQuery]);

  const handleDelete = async () => {
    if (!confirm) return;
    setBusy(true);

    try {
      switch (resource) {
        case 'shipping':
          await adminData.deleteShipping(confirm.id);
          break;
        case 'notifications':
          await adminData.deleteNotification(confirm.id);
          break;
        case 'administrators':
          await adminData.deleteAdministrator(confirm.id);
          break;
        case 'roles':
          await adminData.deleteRole(confirm.id);
          break;
        default:
          break;
      }

      setConfirm(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete record');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="state-view">
        <div className="loader-line" />
        <p>Loading {META[resource][1].toLowerCase()}…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="state-view">
        <p>{error}</p>
        <button className="secondary-btn" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  const canCreate = [
    'discounts',
    'shipping',
    'notifications',
    'administrators',
    'roles'
  ].includes(resource);

  return (
    <div className="operations-page">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">{META[resource][0]}</p>
          <h2>{META[resource][1]}</h2>
          <p>{META[resource][2]}</p>
        </div>
        {canCreate && (
          <button
            className="primary-btn"
            onClick={() => setEditor({ type: 'create' })}
          >
            <Icon name="Plus" size={15} /> Create
          </button>
        )}
      </div>

      {/* Toolbar */}
      <div className="toolbar">
        <div className="search-field">
          <Icon name="Search" size={16} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${META[resource][1].toLowerCase()}…`}
          />
        </div>
        <button className="secondary-btn" onClick={loadData}>
          <Icon name="RefreshCw" size={15} /> Refresh
        </button>
      </div>

      {/* Table */}
      <section className="panel table-panel">
        <div className="table-wrap">
          {resource === 'shipping' ? (
            <ShippingTable
              rows={filteredRows}
              onEdit={(item) => setEditor({ type: 'edit', item })}
              onDelete={(item) =>
                setConfirm({
                  id: item.id,
                  title: 'Delete shipping method?',
                  description:
                    'This delivery method will be removed from ORYN checkout.',
                  label: 'Delete'
                })
              }
            />
          ) : resource === 'roles' ? (
            <RolesTable
              rows={filteredRows}
              onManage={(item) => setEditor({ type: 'manage', item })}
              onDelete={(item) =>
                setConfirm({
                  id: item.id,
                  title: 'Delete role?',
                  description:
                    'A role can only be deleted when no administrator is assigned to it.',
                  label: 'Delete'
                })
              }
            />
          ) : (
            <DataTable
              resource={resource}
              rows={filteredRows}
              refresh={loadData}
              onDelete={(item) =>
                setConfirm({
                  id: item.id,
                  title: `Delete ${resource.slice(0, -1)}?`,
                  description:
                    'This record will be permanently removed. This action cannot be undone.',
                  label: 'Delete'
                })
              }
            />
          )}
        </div>

        {!filteredRows.length && (
          <div className="ops-empty">
            <Icon name="Inbox" size={24} />
            <strong>No records yet</strong>
            <span>Live records will appear here when ORYN has activity.</span>
          </div>
        )}
      </section>

      {/* Editor Dialog */}
      {editor && (
        <OperationsDialog
          resource={resource}
          mode={editor.type}
          item={editor.item}
          close={() => setEditor(null)}
          saved={() => {
            setEditor(null);
            void loadData();
          }}
        />
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title ?? ''}
        description={confirm?.description ?? ''}
        confirmLabel={busy ? 'Deleting…' : confirm?.label ?? 'Delete'}
        danger
        onClose={() => !busy && setConfirm(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

// ============ Data Table ============
function DataTable({
  resource,
  rows,
  refresh,
  onDelete
}: {
  resource: Resource;
  rows: any[];
  refresh: () => void;
  onDelete: (item: any) => void;
}) {
  if (resource === 'reviews') {
    return (
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Rating</th>
            <th>Date</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>
                  {row.user?.firstName} {row.user?.lastName}
                </strong>
                <small className="cell-sub">{row.user?.email}</small>
              </td>
              <td>{row.product?.name}</td>
              <td>{row.rating}.0 ★</td>
              <td>{formatDate(row.createdAt)}</td>
              <td>
                <StatusBadge value={row.approved ? 'Published' : 'Pending'} />
              </td>
              <td>
                <div className="action-group">
                  {!row.approved && (
                    <button
                      className="mini-btn"
                      onClick={async () => {
                        await adminData.updateReview(row.id, { approved: true });
                        refresh();
                      }}
                    >
                      Approve
                    </button>
                  )}
                  {row.approved && (
                    <button
                      className="mini-btn"
                      onClick={async () => {
                        await adminData.updateReview(row.id, { approved: false });
                        refresh();
                      }}
                    >
                      Unpublish
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resource === 'discounts') {
    return (
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Starts</th>
            <th>Expires</th>
            <th>Uses</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong className="mono">{row.code}</strong>
              </td>
              <td>{row.type}</td>
              <td>
                {row.type === 'PERCENTAGE' ? `${row.value}%` : formatMoney(row.value)}
              </td>
              <td>{formatDate(row.startsAt)}</td>
              <td>{row.expiresAt ? formatDate(row.expiresAt) : 'No expiry'}</td>
              <td>{row.usages?.length ?? 0}</td>
              <td>
                <StatusBadge value={row.active ? 'Active' : 'Paused'} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resource === 'returns') {
    return (
      <table>
        <thead>
          <tr>
            <th>Return</th>
            <th>Customer</th>
            <th>Order</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Date</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="mono">{row.id.slice(-8).toUpperCase()}</td>
              <td>
                {row.user?.firstName} {row.user?.lastName}
              </td>
              <td className="mono">{row.orderId.slice(-8).toUpperCase()}</td>
              <td>{row.reason}</td>
              <td>
                <StatusBadge value={row.status} />
              </td>
              <td>{formatDate(row.createdAt)}</td>
              <td>
                <select
                  className="inline-select"
                  value={row.status}
                  onChange={async (e) => {
                    await adminData.updateReturn(row.id, { status: e.target.value });
                    refresh();
                  }}
                >
                  <option>REQUESTED</option>
                  <option>APPROVED</option>
                  <option>REJECTED</option>
                  <option>RECEIVED</option>
                  <option>REFUNDED</option>
                  <option>CANCELLED</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resource === 'payments') {
    return (
      <table>
        <thead>
          <tr>
            <th>Payment</th>
            <th>Order</th>
            <th>Provider</th>
            <th>Amount</th>
            <th>Transactions</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="mono">{row.id.slice(-9).toUpperCase()}</td>
              <td className="mono">{row.orderId.slice(-8).toUpperCase()}</td>
              <td>{row.provider}</td>
              <td>
                {formatMoney(row.amount)} {row.currency}
              </td>
              <td>{row.transactions?.length ?? 0}</td>
              <td>
                <StatusBadge value={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resource === 'notifications') {
    return (
      <table>
        <thead>
          <tr>
            <th>Notification</th>
            <th>Customer</th>
            <th>Type</th>
            <th>Read</th>
            <th>Date</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>{row.title}</strong>
                <small className="cell-sub">{row.body}</small>
              </td>
              <td>
                {row.user?.firstName} {row.user?.lastName}
              </td>
              <td>
                <StatusBadge value={row.type} />
              </td>
              <td>{row.readAt ? 'Read' : 'Unread'}</td>
              <td>{formatDate(row.createdAt)}</td>
              <td>
                <button className="table-action danger" onClick={() => onDelete(row)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (resource === 'administrators') {
    return (
      <table>
        <thead>
          <tr>
            <th>Administrator</th>
            <th>Role</th>
            <th>Email</th>
            <th>Status</th>
            <th>Joined</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>
                <strong>
                  {row.firstName} {row.lastName}
                </strong>
              </td>
              <td>{row.role?.name}</td>
              <td>{row.email}</td>
              <td>
                <StatusBadge value={row.status} />
              </td>
              <td>{formatDate(row.createdAt)}</td>
              <td>
                {row.role?.name !== 'Platform Owner' && (
                  <button className="table-action danger" onClick={() => onDelete(row)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Audit logs
  return (
    <table>
      <thead>
        <tr>
          <th>Time</th>
          <th>Actor</th>
          <th>Action</th>
          <th>Resource</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{new Date(row.createdAt).toLocaleString()}</td>
            <td>
              <strong>
                {row.actor?.firstName} {row.actor?.lastName}
              </strong>
            </td>
            <td>{row.action}</td>
            <td>{row.resource}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ============ Shipping Table ============
function ShippingTable({
  rows,
  onEdit,
  onDelete
}: {
  rows: any[];
  onEdit: (item: any) => void;
  onDelete: (item: any) => void;
}) {
  return (
    <div className="shipping-cards">
      {rows.map((row) => (
        <article className="shipping-card" key={row.id}>
          <div className="shipping-icon">
            <Icon name="Truck" size={18} />
          </div>
          <div className="shipping-main">
            <div>
              <p className="eyebrow">Delivery method</p>
              <h3>{row.name}</h3>
              <p>{row.description || 'ORYN delivery option.'}</p>
            </div>
            <StatusBadge value={row.active ? 'Active' : 'Paused'} />
          </div>
          <div className="shipping-meta">
            <div>
              <span>Price</span>
              <strong>{formatMoney(row.price)}</strong>
            </div>
            <div>
              <span>Updated</span>
              <strong>{formatDate(row.updatedAt)}</strong>
            </div>
          </div>
          <div className="shipping-actions">
            <button className="secondary-btn" onClick={() => onEdit(row)}>
              <Icon name="Pencil" size={13} /> Edit
            </button>
            <button className="secondary-btn danger-outline" onClick={() => onDelete(row)}>
              <Icon name="Trash2" size={13} /> Delete
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

// ============ Roles Table ============
function RolesTable({
  rows,
  onManage,
  onDelete
}: {
  rows: any[];
  onManage: (item: any) => void;
  onDelete: (item: any) => void;
}) {
  return (
    <div className="role-grid">
      {rows.map((row) => (
        <article className="role-card" key={row.id}>
          <p className="eyebrow">Role</p>
          <h3>{row.name}</h3>
          <p>
            {row.users?.length ?? 0} members · {row.permissions?.length ?? 0}{' '}
            permissions
          </p>
          <div className="permission-stack">
            {(row.permissions ?? []).slice(0, 8).map((permission: any) => (
              <span key={permission.permissionId}>
                {permission.permission?.key}
              </span>
            ))}
          </div>
          <div className="role-actions">
            <button className="secondary-btn" onClick={() => onManage(row)}>
              Manage <Icon name="ArrowRight" size={14} />
            </button>
            <button
              className="icon-btn danger"
              onClick={() => onDelete(row)}
              aria-label={`Delete ${row.name}`}
            >
              <Icon name="Trash2" size={15} />
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

// ============ Operations Dialog ============
function OperationsDialog({
  resource,
  mode,
  item,
  close,
  saved
}: {
  resource: Resource;
  mode: 'create' | 'edit' | 'manage';
  item?: any;
  close: () => void;
  saved: () => void;
}) {
  const [form, setForm] = useState<any>(item ?? {});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');

    try {
      if (resource === 'shipping') {
        if (mode === 'edit') {
          await adminData.updateShipping(item.id, {
            name: form.name,
            description: form.description || null,
            price: Number(form.price),
            active: !!form.active
          });
        } else {
          await adminData.createShipping({
            name: form.name,
            description: form.description || null,
            price: Number(form.price),
            active: true
          });
        }
      }

      if (resource === 'discounts') {
        await adminData.createCoupon({
          code: form.code,
          type: form.type || 'PERCENTAGE',
          value: Number(form.value),
          startsAt: form.startsAt || new Date().toISOString(),
          expiresAt: form.expiresAt || null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          active: true
        });
      }

      if (resource === 'notifications') {
        await adminData.createNotification({
          userId: form.userId,
          type: form.type,
          title: form.title,
          body: form.body,
          deepLink: form.deepLink || null
        });
      }

      if (resource === 'roles' && mode === 'create') {
        await adminData.createRole({ name: form.name });
      }

      if (resource === 'administrators') {
        await adminData.createAdministrator({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          roleId: form.roleId
        });
      }

      saved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setBusy(false);
    }
  };

  const title =
    mode === 'manage'
      ? 'Role permissions'
      : mode === 'edit'
        ? 'Edit shipping method'
        : `Create ${META[resource][1].slice(0, -1)}`;

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) close();
      }}
    >
      <div className="modal admin-dialog">
        <div className="modal-head">
          <div>
            <p className="eyebrow">{META[resource][0]}</p>
            <h3>{title}</h3>
          </div>
          <button className="icon-btn" onClick={close} aria-label="Close">
            <Icon name="X" />
          </button>
        </div>

        {error && <div className="notice error-notice">{error}</div>}

        <div className="modal-body">
          {/* Shipping Form */}
          {resource === 'shipping' && (
            <>
              <label>
                Name
                <input
                  value={form.name ?? ''}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={form.description ?? ''}
                  rows={4}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={form.price ?? 0}
                  onChange={(e) =>
                    setForm({ ...form, price: e.target.value })
                  }
                />
              </label>
              {mode === 'edit' && (
                <label>
                  Active
                  <select
                    value={form.active ? 'true' : 'false'}
                    onChange={(e) =>
                      setForm({ ...form, active: e.target.value === 'true' })
                    }
                  >
                    <option value="true">Active</option>
                    <option value="false">Paused</option>
                  </select>
                </label>
              )}
            </>
          )}

          {/* Discounts Form */}
          {resource === 'discounts' && (
            <>
              <label>
                Code
                <input
                  value={form.code ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                />
              </label>
              <label>
                Type
                <select
                  value={form.type ?? 'PERCENTAGE'}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                >
                  <option>PERCENTAGE</option>
                  <option>FIXED</option>
                </select>
              </label>
              <label>
                Value
                <input
                  type="number"
                  min="0"
                  value={form.value ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, value: e.target.value })
                  }
                />
              </label>
              <label>
                Expires
                <input
                  type="datetime-local"
                  value={form.expiresAt ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      expiresAt: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : ''
                    })
                  }
                />
              </label>
            </>
          )}

          {/* Notifications Form */}
          {resource === 'notifications' && (
            <>
              <label>
                User ID
                <input
                  value={form.userId ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, userId: e.target.value })
                  }
                />
              </label>
              <label>
                Type
                <input
                  value={form.type ?? 'ADMIN_MESSAGE'}
                  onChange={(e) =>
                    setForm({ ...form, type: e.target.value })
                  }
                />
              </label>
              <label>
                Title
                <input
                  value={form.title ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </label>
              <label>
                Body
                <textarea
                  value={form.body ?? ''}
                  rows={5}
                  onChange={(e) =>
                    setForm({ ...form, body: e.target.value })
                  }
                />
              </label>
              <label>
                Deep link
                <input
                  value={form.deepLink ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, deepLink: e.target.value })
                  }
                />
              </label>
            </>
          )}

          {/* Roles Form */}
          {resource === 'roles' && (
            <>
              {mode === 'create' ? (
                <label>
                  Name
                  <input
                    value={form.name ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                </label>
              ) : (
                <>
                  <div className="role-summary">
                    <strong>{item?.name}</strong>
                    <span>{item?.users?.length ?? 0} assigned administrators</span>
                  </div>
                  <div className="permission-detail-list">
                    {(item?.permissions ?? []).map((permission: any) => (
                      <div key={permission.permissionId}>
                        <Icon name="Check" size={14} />
                        <span>
                          <strong>{permission.permission?.key}</strong>
                          <small>
                            {permission.permission?.description ??
                              'Permission available to this role.'}
                          </small>
                        </span>
                      </div>
                    ))}
                    {!(item?.permissions?.length) && (
                      <div className="ops-empty">
                        <Icon name="KeyRound" size={22} />
                        <strong>No permissions assigned</strong>
                        <span>
                          Permissions can be assigned once the role policy editor is
                          enabled.
                        </span>
                      </div>
                    )}
                  </div>
                </>
              )}
            </>
          )}

          {/* Administrators Form */}
          {resource === 'administrators' && (
            <>
              <label>
                First name
                <input
                  value={form.firstName ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                />
              </label>
              <label>
                Last name
                <input
                  value={form.lastName ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={form.email ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={form.password ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </label>
              <label>
                Role ID
                <input
                  value={form.roleId ?? ''}
                  onChange={(e) =>
                    setForm({ ...form, roleId: e.target.value })
                  }
                />
              </label>
            </>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Close
          </button>
          {mode !== 'manage' && (
            <button className="primary-btn" disabled={busy} onClick={submit}>
              {busy ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}