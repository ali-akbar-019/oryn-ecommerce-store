import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

type Resource = 'products' | 'categories' | 'inventory' | 'orders' | 'customers';

export function ManagementPage({ resource }: { resource: Resource }) {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmState, setConfirmState] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const title = resource[0].toUpperCase() + resource.slice(1);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      let response;
      switch (resource) {
        case 'products':
          response = await adminData.products(searchQuery);
          break;
        case 'categories':
          response = await adminData.categories();
          break;
        case 'inventory':
          response = await adminData.inventory();
          break;
        case 'orders':
          response = await adminData.orders();
          break;
        case 'customers':
          response = await adminData.customers();
          break;
        default:
          response = { data: [] };
      }

      setData(response.data?.items ?? response.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, [resource]);

  const archiveProduct = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminData.archiveProduct(selected.id);
      setConfirmState(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to archive product');
    } finally {
      setBusy(false);
    }
  };

  const deleteCategory = async () => {
    if (!selected) return;
    setBusy(true);
    try {
      await adminData.deleteCategory(selected.id);
      setConfirmState(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete category');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="state-view">
        <div className="loader-line" />
        <p>Loading {title.toLowerCase()}…</p>
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

  return (
    <div className="resource-page">
      {/* Header */}
      <div className="page-intro">
        <div>
          <p className="eyebrow">Live operations</p>
          <h2>{title}</h2>
          <p>Manage {title.toLowerCase()} using the connected ORYN commerce API.</p>
        </div>
        {['products', 'categories'].includes(resource) && (
          <button
            className="primary-btn"
            onClick={() =>
              resource === 'products'
                ? navigate('/products/new')
                : (setSelected(null), setModalOpen(true))
            }
          >
            <Icon name="Plus" size={16} /> Create new
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
            onKeyDown={(e) => e.key === 'Enter' && loadData()}
            placeholder={`Search ${title.toLowerCase()}…`}
          />
        </div>
        <button className="secondary-btn" onClick={loadData}>
          <Icon name="RefreshCw" size={15} /> Refresh
        </button>
      </div>

      {/* Table */}
      <section className="panel table-panel">
        <div className="table-wrap">
          <table>
            <thead>
              <Header resource={resource} />
            </thead>
            <tbody>
              {data.map((row) => (
                <Row
                  key={row.id}
                  resource={resource}
                  row={row}
                  onManage={() => {
                    if (resource === 'products') {
                      navigate(`/products/${row.id}`);
                    } else if (resource === 'orders') {
                      navigate(`/orders/${row.id}`);
                    } else if (resource === 'customers') {
                      navigate(`/customers/${row.id}`);
                    } else {
                      setSelected(row);
                      setModalOpen(true);
                    }
                  }}
                  onDelete={() => {
                    setSelected(row);
                    setConfirmState({
                      type: resource === 'products' ? 'product' : 'category'
                    });
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>

        {!data.length && (
          <div className="ops-empty">
            <Icon name="Inbox" size={24} />
            <strong>No {title.toLowerCase()} found</strong>
            <span>Try another search or create your first record.</span>
          </div>
        )}
      </section>

      {/* Modal */}
      {modalOpen && (
        <ManagementModal
          resource={resource}
          item={selected}
          close={() => setModalOpen(false)}
          refresh={loadData}
        />
      )}

      {/* Confirm Dialog */}
      {confirmState && (
        <ConfirmDialog
          open
          title={confirmState.type === 'product' ? 'Archive product?' : 'Delete category?'}
          description={
            confirmState.type === 'product'
              ? 'The product will be archived and removed from the active storefront.'
              : 'This category can only be deleted when it has no assigned products.'
          }
          confirmLabel={confirmState.type === 'product' ? 'Archive' : 'Delete'}
          danger
          onClose={() => setConfirmState(null)}
          onConfirm={confirmState.type === 'product' ? archiveProduct : deleteCategory}
        />
      )}
    </div>
  );
}

// ============ Table Header ============
function Header({ resource }: { resource: Resource }) {
  switch (resource) {
    case 'products':
      return (
        <tr>
          <th>Product</th>
          <th>Category</th>
          <th>Variants</th>
          <th>Stock</th>
          <th>Status</th>
          <th />
        </tr>
      );
    case 'categories':
      return (
        <tr>
          <th>Category</th>
          <th>Slug</th>
          <th>Products</th>
          <th>Children</th>
          <th />
        </tr>
      );
    case 'inventory':
      return (
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Stock</th>
          <th>Reserved</th>
          <th>Status</th>
          <th />
        </tr>
      );
    case 'orders':
      return (
        <tr>
          <th>Order</th>
          <th>Customer</th>
          <th>Total</th>
          <th>Payment</th>
          <th>Status</th>
          <th />
        </tr>
      );
    default:
      return (
        <tr>
          <th>Customer</th>
          <th>Email</th>
          <th>Orders</th>
          <th>Reviews</th>
          <th>Status</th>
          <th />
        </tr>
      );
  }
}

// ============ Table Row ============
function Row({
  resource,
  row,
  onManage,
  onDelete
}: {
  resource: Resource;
  row: any;
  onManage: () => void;
  onDelete: () => void;
}) {
  switch (resource) {
    case 'products':
      return (
        <tr>
          <td>
            <strong>{row.name}</strong>
            <small className="cell-sub">{row.slug}</small>
          </td>
          <td>{row.category?.name ?? '—'}</td>
          <td>{row.variants?.length ?? 0}</td>
          <td>
            {row.variants?.reduce(
              (n: number, v: any) =>
                n + (v.inventory?.quantity ?? v.stockQuantity ?? 0),
              0
            )}
          </td>
          <td>
            <span className={`status ${String(row.status).toLowerCase()}`}>
              {row.status}
            </span>
          </td>
          <td>
            <button className="table-action" onClick={onManage}>
              Open
            </button>
            <button className="table-action muted-action" onClick={onDelete}>
              Archive
            </button>
          </td>
        </tr>
      );

    case 'categories':
      return (
        <tr>
          <td>
            <strong>{row.name}</strong>
          </td>
          <td className="mono">{row.slug}</td>
          <td>{row._count?.products ?? 0}</td>
          <td>{row._count?.children ?? 0}</td>
          <td>
            <button className="table-action" onClick={onManage}>
              Edit
            </button>
            <button className="table-action muted-action" onClick={onDelete}>
              Delete
            </button>
          </td>
        </tr>
      );

    case 'inventory':
      const stock = row.inventory?.quantity ?? row.stockQuantity ?? 0;
      const status =
        stock === 0
          ? 'out-of-stock'
          : stock < 10
            ? 'low-stock'
            : 'healthy';

      return (
        <tr>
          <td>
            <strong>{row.product?.name ?? '—'}</strong>
          </td>
          <td className="mono">{row.sku}</td>
          <td>{stock}</td>
          <td>{row.inventory?.reserved ?? 0}</td>
          <td>
            <span className={`status ${status}`}>
              {stock === 0
                ? 'Out of stock'
                : stock < 10
                  ? 'Low stock'
                  : 'Healthy'}
            </span>
          </td>
          <td>
            <button className="table-action" onClick={onManage}>
              Adjust
            </button>
          </td>
        </tr>
      );

    case 'orders':
      return (
        <tr>
          <td className="mono">{row.id.slice(0, 10).toUpperCase()}</td>
          <td>
            {row.user?.firstName} {row.user?.lastName}
            <small className="cell-sub">{row.user?.email}</small>
          </td>
          <td>${Number(row.total).toFixed(2)}</td>
          <td>
            <span className={`status ${String(row.paymentStatus).toLowerCase()}`}>
              {row.paymentStatus}
            </span>
          </td>
          <td>
            <span
              className={`status ${String(row.status)
                .toLowerCase()
                .replaceAll('_', '-')}`}
            >
              {String(row.status).replaceAll('_', ' ')}
            </span>
          </td>
          <td>
            <button className="table-action" onClick={onManage}>
              Open
            </button>
          </td>
        </tr>
      );

    default:
      return (
        <tr>
          <td>
            <strong>
              {row.firstName} {row.lastName}
            </strong>
          </td>
          <td>{row.email}</td>
          <td>{row._count?.orders ?? 0}</td>
          <td>{row._count?.reviews ?? 0}</td>
          <td>
            <span className={`status ${String(row.status).toLowerCase()}`}>
              {row.status}
            </span>
          </td>
          <td>
            <button className="table-action" onClick={onManage}>
              Open
            </button>
          </td>
        </tr>
      );
  }
}

// ============ Management Modal ============
function ManagementModal({
  resource,
  item,
  close,
  refresh
}: {
  resource: Resource;
  item: any;
  close: () => void;
  refresh: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? '');
  const [quantity, setQuantity] = useState(
    item?.inventory?.quantity ?? item?.stockQuantity ?? 0
  );
  const [status, setStatus] = useState(item?.status ?? 'CONFIRMED');
  const [categories, setCategories] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource === 'categories' || resource === 'products') {
      adminData
        .categories()
        .then((r) => setCategories(r.data ?? []))
        .catch(() => { });
    }
  }, [resource]);

  const save = async () => {
    setBusy(true);
    setError('');

    try {
      if (resource === 'categories') {
        if (item) {
          await adminData.updateCategory(item.id, { name, slug });
        } else {
          await adminData.createCategory({ name, slug });
        }
      } else if (resource === 'inventory') {
        await adminData.adjustStock(item.id, Number(quantity), 'ADMIN_ADJUSTMENT');
      } else if (resource === 'orders') {
        await adminData.updateOrder(item.id, {
          status,
          paymentStatus: item.paymentStatus
        });
      } else {
        throw new Error('Use the dedicated workspace for this resource.');
      }

      close();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <p className="eyebrow">{item ? 'Edit' : 'Create'}</p>
            <h3>{resource}</h3>
          </div>
          <button className="icon-btn" onClick={close}>
            <Icon name="X" />
          </button>
        </div>

        {error && <div className="notice error-notice">{error}</div>}

        <div className="modal-body">
          {resource === 'categories' && (
            <>
              <label>
                Category name
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label>
                Slug
                <input
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
              </label>
            </>
          )}

          {resource === 'inventory' && (
            <>
              <p className="modal-context">
                {item?.product?.name} · {item?.sku}
              </p>
              <label>
                Available quantity
                <input
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                />
              </label>
            </>
          )}

          {resource === 'orders' && (
            <label>
              Order status
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {[
                  'PENDING',
                  'CONFIRMED',
                  'PROCESSING',
                  'SHIPPED',
                  'OUT_FOR_DELIVERY',
                  'DELIVERED',
                  'CANCELLED',
                  'RETURNED'
                ].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
          )}

          {resource === 'products' && (
            <p className="modal-context">
              Open the Product Studio to manage products, variants, media and attributes.
            </p>
          )}
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          {resource !== 'products' && (
            <button className="primary-btn" disabled={busy} onClick={save}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}