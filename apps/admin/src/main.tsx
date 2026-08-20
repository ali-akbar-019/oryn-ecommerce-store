import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';
import { AdminShell } from './layout/AdminShell';
import { Dashboard } from './pages/Dashboard';
import { ResourcePage } from './pages/ResourcePage';
import { Settings } from './pages/Settings';

const resources = ['products','categories','inventory','orders','customers','reviews','discounts','returns','payments','shipping','notifications','administrators','roles','audit-logs'];

function App() {
  return <BrowserRouter><Routes><Route element={<AdminShell />}><Route index element={<Dashboard />} />{resources.map(resource => <Route key={resource} path={resource} element={<ResourcePage resource={resource} />} />)}<Route path="settings" element={<Settings />} /></Route></Routes></BrowserRouter>;
}
createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
