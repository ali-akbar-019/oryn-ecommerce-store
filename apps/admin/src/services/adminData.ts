import { api } from './api';

export const adminData = {
    dashboard: () => api('/admin/dashboard'),

    // Products
    products: (q = '') => api(`/admin/products?limit=100${q ? `&q=${encodeURIComponent(q)}` : ''}`),
    product: (id: string) => api(`/admin/products/${id}`),
    createProduct: (body: unknown) => api('/admin/products', { method: 'POST', body: JSON.stringify(body) }),
    updateProduct: (id: string, body: unknown) => api(`/admin/products/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    archiveProduct: (id: string) => api(`/admin/products/${id}`, { method: 'DELETE' }),
    deleteProduct: (id: string) => api(`/admin/products/${id}`, { method: 'DELETE' }),
    duplicateProduct: (id: string) => api(`/admin/products/${id}/duplicate`, { method: 'POST' }),
    bulkUpdateProducts: (ids: string[], data: any) =>
        api('/admin/products/bulk', { method: 'PATCH', body: JSON.stringify({ ids, data }) }),

    // Categories
    categories: () => api('/admin/categories'),
    createCategory: (body: unknown) => api('/admin/categories', { method: 'POST', body: JSON.stringify(body) }),
    updateCategory: (id: string, body: unknown) => api(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteCategory: (id: string) => api(`/admin/categories/${id}`, { method: 'DELETE' }),

    // Inventory
    inventory: (queryString = '') => api(`/admin/inventory${queryString ? `?${queryString}` : ''}`),
    adjustStock: (id: string, quantity: number, reason: string) =>
        api(`/admin/inventory/${id}`, { method: 'PATCH', body: JSON.stringify({ quantity, reason }) }),
    inventoryHistory: (variantId: string) => api(`/admin/inventory/${variantId}/history`),

    // Orders - Updated to accept query params
    orders: (queryString = '') => api(`/admin/orders${queryString ? `?${queryString}` : ''}`),
    order: (id: string) => api(`/admin/orders/${id}`),
    updateOrder: (id: string, body: unknown) => api(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    // Customers - with query params support
    customers: (queryString = '') => api(`/admin/customers${queryString ? `?${queryString}` : ''}`),
    customer: (id: string) => api(`/admin/customers/${id}`),
    updateCustomer: (id: string, body: unknown) => api(`/admin/customers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    bulkUpdateCustomers: (ids: string[], data: any) =>
        api('/admin/customers/bulk', { method: 'PATCH', body: JSON.stringify({ ids, data }) }),

    // Reviews
    reviews: () => api('/admin/reviews'),
    review: (id: string) => api(`/admin/reviews/${id}`),
    updateReview: (id: string, body: unknown) => api(`/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    // Coupons
    coupons: () => api('/admin/coupons'),
    createCoupon: (body: unknown) => api('/admin/coupons', { method: 'POST', body: JSON.stringify(body) }),

    // Returns
    returns: () => api('/admin/returns'),
    updateReturn: (id: string, body: unknown) => api(`/admin/returns/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),

    // Payments
    payments: () => api('/admin/payments'),

    // Shipping
    shipping: () => api('/admin/shipping'),
    createShipping: (body: unknown) => api('/admin/shipping', { method: 'POST', body: JSON.stringify(body) }),
    updateShipping: (id: string, body: unknown) => api(`/admin/shipping/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    deleteShipping: (id: string) => api(`/admin/shipping/${id}`, { method: 'DELETE' }),

    // Notifications
    notifications: () => api('/admin/notifications'),
    createNotification: (body: unknown) => api('/admin/notifications', { method: 'POST', body: JSON.stringify(body) }),
    deleteNotification: (id: string) => api(`/admin/notifications/${id}`, { method: 'DELETE' }),

    // Administrators
    administrators: () => api('/admin/administrators'),
    createAdministrator: (body: unknown) => api('/admin/administrators', { method: 'POST', body: JSON.stringify(body) }),
    deleteAdministrator: (id: string) => api(`/admin/administrators/${id}`, { method: 'DELETE' }),

    // Roles
    roles: () => api('/admin/roles'),
    createRole: (body: unknown) => api('/admin/roles', { method: 'POST', body: JSON.stringify(body) }),
    deleteRole: (id: string) => api(`/admin/roles/${id}`, { method: 'DELETE' }),

    // Audit Logs
    auditLogs: () => api('/admin/audit-logs'),

    // Analytics
    analytics: () => api('/admin/analytics'),

    // Settings
    settings: () => api('/admin/settings'),
    updateSettings: (body: unknown) => api('/admin/settings', { method: 'PATCH', body: JSON.stringify(body) }),

    // Notifications (user)
    markNotificationRead: (id: string) => api(`/notifications/${id}/read`, { method: 'PATCH' }),
    markAllNotificationsRead: () => api('/notifications/read-all', { method: 'POST' }),
};