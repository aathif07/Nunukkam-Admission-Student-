import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <header className="header">
          <button className="btn-icon btn-secondary" onClick={() => setSidebarOpen(!sidebarOpen)} style={{ display: 'none' }}>
            <Menu size={20} />
          </button>
          <div />
          <div className="header-actions" />
        </header>
        <main className="page-content animate-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
