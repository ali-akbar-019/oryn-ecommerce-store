import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import { AdminShell } from './layout/AdminShell';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ManagementPage } from './pages/ManagementPage';
import { ProductEditor } from './pages/ProductEditor';
import { OrderWorkspace } from './pages/OrderWorkspace';
import { CustomerWorkspace } from './pages/CustomerWorkspace';
import { OperationsWorkspace } from './pages/OperationsWorkspace';
import { Analytics } from './pages/Analytics';
import { useAdminAuth } from './auth/authStore';

const operationResources = [
  'reviews',
  'discounts',
  'returns',
  'payments',
  'shipping',
  'notifications',
  'administrators',
  'roles',
  'audit-logs'
];

const resources = [
  'products',
  'categories',
  'inventory',
  'orders',
  'customers',
  'reviews',
  'discounts',
  'returns',
  'payments',
  'shipping',
  'notifications',
  'administrators',
  'roles',
  'audit-logs'
];

// Protected route wrapper
function Protected() {
  const token = useAdminAuth((s) => s.accessToken);
  return token ? <AdminShell /> : <Navigate to="/login" replace />;
}

// Resource element resolver
function resourceElement(resource: string) {
  if (['products', 'categories', 'inventory', 'orders', 'customers'].includes(resource)) {
    return <ManagementPage resource={resource as never} />;
  }
  if (operationResources.includes(resource)) {
    return <OperationsWorkspace resource={resource as never} />;
  }
  return <OperationsWorkspace resource={resource as never} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<Protected />}>
          <Route index element={<Dashboard />} />

          {/* Product Editor */}
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:id" element={<ProductEditor />} />

          {/* Order & Customer Workspaces */}
          <Route path="orders/:id" element={<OrderWorkspace />} />
          <Route path="customers/:id" element={<CustomerWorkspace />} />

          {/* Resource Pages */}
          {resources.map((resource) => (
            <Route
              key={resource}
              path={resource}
              element={resourceElement(resource)}
            />
          ))}

          {/* Analytics & Settings */}
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

// Mount the app
const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}