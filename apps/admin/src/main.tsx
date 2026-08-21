import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './styles.css';
import { AdminShell } from './layout/AdminShell';
import { Dashboard } from './pages/Dashboard';
import { ResourcePage } from './pages/ResourcePage';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { ManagementPage } from './pages/ManagementPage';
import { ProductEditor } from './pages/ProductEditor';
import { OrderWorkspace } from './pages/OrderWorkspace';
import { CustomerWorkspace } from './pages/CustomerWorkspace';
import { OperationsWorkspace } from './pages/OperationsWorkspace';
import { useAdminAuth } from './auth/authStore';
const operationResources=['reviews','discounts','returns','payments','shipping','notifications','administrators','roles','audit-logs'];
const resources=['products','categories','inventory','orders','customers','reviews','discounts','returns','payments','shipping','notifications','administrators','roles','audit-logs'];
function Protected() {
  const token = useAdminAuth((s) => s.accessToken);
  return token ? <AdminShell /> : <Navigate to="/login" replace />;
}
function resourceElement(resource: string) {
  if (['products', 'categories', 'inventory', 'orders', 'customers'].includes(resource)) return <ManagementPage resource={resource as never} />;
  if (operationResources.includes(resource)) return <OperationsWorkspace resource={resource as never} />;
  return <ResourcePage resource={resource} />;
}
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Protected />}>
          <Route index element={<Dashboard />} />
          <Route path="products/new" element={<ProductEditor />} />
          <Route path="products/:id" element={<ProductEditor />} />
          <Route path="orders/:id" element={<OrderWorkspace />} />
          <Route path="customers/:id" element={<CustomerWorkspace />} />
          {resources.map((resource) => (
            <Route key={resource} path={resource} element={resourceElement(resource)} />
          ))}
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
