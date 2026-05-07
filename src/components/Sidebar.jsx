import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ClipboardList, CreditCard, Handshake, Wallet, LogOut, X, Layers, Shield } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/leads', icon: Users, label: 'Leads' },
  { to: '/cohorts', icon: Layers, label: 'Batches' },
  { to: '/partners', icon: Handshake, label: 'Partners' },
  { to: '/payouts', icon: Wallet, label: 'Payouts' },
  { to: '/users', icon: Shield, label: 'Staff' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 39, display: 'none' }} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div>
            <h1>Nunukkam</h1>
            <span>EIS Platform</span>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ padding: '12px', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {user?.name}<br /><span style={{ fontSize: 11 }}>{user?.role}</span>
          </div>
          <button className="sidebar-link" onClick={handleLogout}><LogOut size={20} /> Logout</button>
        </div>
      </aside>
    </>
  );
}
