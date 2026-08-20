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
import { useAdminAuth } from './auth/authStore';
const resources=['products','categories','inventory','orders','customers','reviews','discounts','returns','payments','shipping','notifications','administrators','roles','audit-logs'];
function Protected(){const token=useAdminAuth(s=>s.accessToken);return token?<AdminShell/>:<Navigate to="/login" replace/>}
function App(){return <BrowserRouter><Routes><Route path="/login" element={<Login/>}/><Route element={<Protected/>}><Route index element={<Dashboard/>}/><Route path="products/new" element={<ProductEditor/>}/><Route path="products/:id" element={<ProductEditor/>}/>{resources.map(resource=><Route key={resource} path={resource} element={['products','categories','inventory','orders','customers'].includes(resource)?<ManagementPage resource={resource as any}/>:<ResourcePage resource={resource}/>}/>}<Route path="settings" element={<Settings/>}/></Route></Routes></BrowserRouter>}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
