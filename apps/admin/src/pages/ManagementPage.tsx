import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminData } from '../services/adminData';
import { Icon } from '../components/Icon';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { ProductTable } from '../components/products/ProductTable';
import { ProductFilters } from '../components/products/ProductFilters';
import { OrderFilters } from '../components/orders/OrderFilters';
import { OrderTable } from '../components/orders/OrderTable';
import { InventoryTable } from '../components/inventory/InventoryTable';
import { InventoryFilters } from '../components/inventory/InventoryFilters';
import { CustomerFilters } from '@/components/cusotmers/CustomerFilters';
import { CustomerTable } from '@/components/cusotmers/CustomerTable';

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
  const [filters, setFilters] = useState<{
    status?: string;
    categoryId?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }>({});

  const title = resource[0].toUpperCase() + resource.slice(1);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      let response;

      switch (resource) {
        case 'products': {
          const queryParams = new URLSearchParams();
          if (searchQuery) queryParams.set('q', searchQuery);
          if (filters.status) queryParams.set('status', filters.status);
          if (filters.categoryId) queryParams.set('categoryId', filters.categoryId);
          response = await adminData.products(queryParams.toString());
          break;
        }

        case 'orders': {
          const queryParams = new URLSearchParams();
          if (filters.status) queryParams.set('status', filters.status);
          if (filters.paymentStatus) queryParams.set('paymentStatus', filters.paymentStatus);
          if (filters.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
          if (filters.dateTo) queryParams.set('dateTo', filters.dateTo);
          response = await adminData.orders(queryParams.toString());
          break;
        }

        case 'customers': {
          const queryParams = new URLSearchParams();
          if (searchQuery) queryParams.set('search', searchQuery);
          if (filters.status) queryParams.set('status', filters.status);
          if (filters.dateFrom) queryParams.set('dateFrom', filters.dateFrom);
          if (filters.dateTo) queryParams.set('dateTo', filters.dateTo);
          response = await adminData.customers(queryParams.toString());
          break;
        }

        case 'inventory': {
          const queryParams = new URLSearchParams();
          if (searchQuery) queryParams.set('search', searchQuery);
          if (filters.status) queryParams.set('status', filters.status);
          response = await adminData.inventory(queryParams.toString());
          break;
        }

        case 'categories':
          response = await adminData.categories();
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
  }, [resource, filters]);

  // ===== Product Actions =====
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

  // ===== Category Actions =====
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

  // ===== Filter Handlers =====
  const handleProductFilterChange = (newFilters: { status?: string; categoryId?: string }) => {
    setFilters(newFilters);
  };

  const handleOrderFilterChange = (newFilters: {
    status?: string;
    paymentStatus?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleCustomerFilterChange = (newFilters: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleInventoryFilterChange = (newFilters: {
    status?: string;
  }) => {
    setFilters(newFilters);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // ===== Loading & Error States =====
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

  // ===== Main Render =====
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

      {/* ===== PRODUCTS ===== */}
      {resource === 'products' && (
        <>
          <ProductFilters
            onFilterChange={handleProductFilterChange}
            onSearch={handleSearch}
          />
          <ProductTable products={data} onRefresh={loadData} onError={setError} />
        </>
      )}

      {/* ===== ORDERS ===== */}
      {resource === 'orders' && (
        <>
          <OrderFilters onFilterChange={handleOrderFilterChange} />
          <OrderTable orders={data} onRefresh={loadData} onError={setError} />
        </>
      )}

      {/* ===== CUSTOMERS ===== */}
      {resource === 'customers' && (
        <>
          <CustomerFilters
            onFilterChange={handleCustomerFilterChange}
            onSearch={handleSearch}
          />
          <CustomerTable customers={data} onRefresh={loadData} onError={setError} />
        </>
      )}

      {/* ===== INVENTORY ===== */}
      {resource === 'inventory' && (
        <>
          <InventoryFilters
            onFilterChange={handleInventoryFilterChange}
            onSearch={handleSearch}
          />
          <InventoryTable items={data} onRefresh={loadData} onError={setError} />
        </>
      )}

      {/* ===== OTHER RESOURCES (Categories) ===== */}
      {resource !== 'products' &&
        resource !== 'orders' &&
        resource !== 'customers' &&
        resource !== 'inventory' && (
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
                        setSelected(row);
                        setModalOpen(true);
                      }}
                      onDelete={() => {
                        setSelected(row);
                        setConfirmState({
                          type: resource === 'categories' ? 'category' : 'product',
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
        )}

      {/* ===== MODAL ===== */}
      {modalOpen && (
        <ManagementModal
          resource={resource}
          item={selected}
          close={() => setModalOpen(false)}
          refresh={loadData}
        />
      )}

      {/* ===== CONFIRM DIALOG ===== */}
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

// ============ TABLE HEADER ============
function Header({ resource }: { resource: Resource }) {
  switch (resource) {
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
    default:
      return null;
  }
}

// ============ TABLE ROW ============
function Row({
  resource,
  row,
  onManage,
  onDelete,
}: {
  resource: Resource;
  row: any;
  onManage: () => void;
  onDelete: () => void;
}) {
  switch (resource) {
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

    default:
      return null;
  }
}

// ============ MANAGEMENT MODAL ============
function ManagementModal({
  resource,
  item,
  close,
  refresh,
}: {
  resource: Resource;
  item: any;
  close: () => void;
  refresh: () => void;
}) {
  const [name, setName] = useState(item?.name ?? '');
  const [slug, setSlug] = useState(item?.slug ?? '');
  const [quantity, setQuantity] = useState(
    item?.inventory?.quantity ?? item?.stockQuantity ?? 0
  );
  const [categories, setCategories] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (resource === 'categories') {
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
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label>
                Slug
                <input value={slug} onChange={(e) => setSlug(e.target.value)} />
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
        </div>

        <div className="modal-actions">
          <button className="secondary-btn" onClick={close}>
            Cancel
          </button>
          {resource !== 'products' && resource !== 'orders' && (
            <button className="primary-btn" disabled={busy} onClick={save}>
              {busy ? 'Saving…' : 'Save changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}