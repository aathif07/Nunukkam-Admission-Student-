import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, ClipboardList, CreditCard, Handshake, Wallet, LogOut, X, Layers, Shield, Star, Award } from 'lucide-react';

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
      <aside className={`sidebar ${open ? 'open' : ''}`} style={{ overflow: 'hidden' }}>
        <div className="sidebar-logo" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* Decorative stars */}
          <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.2 }}>
            <Star size={20} fill="#FBBF24" color="#FBBF24" />
          </div>
          <div style={{ position: 'absolute', bottom: 8, left: 8, opacity: 0.15 }}>
            <Star size={14} fill="#FBBF24" color="#FBBF24" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
            {/* Logo placeholder - replace with actual Nunucam logo */}
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'linear-gradient(135deg, #6B1EA2, #9C4DCC)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(107, 30, 162, 0.3)'
            }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>N</span>
            </div>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.5px', color: '#6B1EA2' }}>Nunucam</h1>
              <span style={{ fontSize: 9, background: '#F3E5F5', color: '#6B1EA2', padding: '2px 8px', borderRadius: 20, fontWeight: 600, display: 'inline-block' }}>ESI Platform</span>
            </div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <div className="sidebar-section">Menu</div>
          {navItems.map(item => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`} onClick={onClose}>
              <item.icon size={20} />
              {item.label}
              {item.to === '/' && <Award size={14} style={{ marginLeft: 'auto', color: '#6B1EA2', opacity: 0.6 }} />}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 12px', borderTop: '1px solid var(--gray-100)' }}>
          <div style={{ padding: '12px', fontSize: 13, color: 'var(--gray-600)', background: 'var(--gray-50)', borderRadius: 12, marginBottom: 8 }}>
            {user?.name}<br /><span style={{ fontSize: 11, color: 'var(--gray-400)' }}>{user?.role}</span>
          </div>
          <button className="sidebar-link" onClick={handleLogout} style={{ color: '#DC2626' }}><LogOut size={20} /> Logout</button>
        </div>
      </aside>
    </>
  );
}
