import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Plus, Search, Handshake, Users, TrendingUp, Building2, User, Phone, Mail, ArrowRight } from 'lucide-react';

export default function PartnerList() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { 
    api.get('/partners')
      .then(r => setPartners(r.data))
      .finally(() => setLoading(false)); 
  }, []);

  const filteredPartners = partners.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.contactPerson?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Referral Ecosystem</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Managing {partners.length} institutional and individual partners</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/partners/new')} style={{ padding: '12px 24px', borderRadius: 14 }}>
          <Plus size={20} /> Add New Partner
        </button>
      </div>

      <div className="toolbar" style={{ background: 'white', padding: '16px', borderRadius: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 32 }}>
        <div className="search-input" style={{ flex: 1, background: 'var(--gray-50)', border: '1.5px solid var(--gray-100)' }}>
          <Search size={18} color="var(--primary)" />
          <input placeholder="Search partners by name or contact person..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="page-loader"><span className="spinner spinner-dark" /></div>
      ) : filteredPartners.length === 0 ? (
        <div className="empty-state" style={{ padding: 60, background: 'white', borderRadius: 24, border: '1.5px dashed var(--gray-200)' }}>
          <div style={{ background: 'var(--primary-50)', color: 'var(--primary)', padding: 20, borderRadius: '50%', marginBottom: 16 }}><Handshake size={32} /></div>
          <h3>No partners found</h3>
          <p>Try a different search term or register a new referral partner.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
          {filteredPartners.map(p => (
            <div key={p.partnerId} className="card" onClick={() => navigate(`/partners/${p.partnerId}`)} style={{ 
              cursor: 'pointer', padding: 0, overflow: 'hidden', border: '1.5px solid var(--primary-50)', 
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} onMouseOver={e => {e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = '0 12px 24px rgba(74, 20, 140, 0.12)';}} onMouseOut={e => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--shadow-sm)';}}>
              
              <div style={{ padding: 24, borderBottom: '1px solid var(--gray-50)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {p.type === 'educational_institution' ? <Building2 size={24} /> : <User size={24} />}
                  </div>
                  <span className={`badge ${p.isActive ? 'badge-enrolled' : 'badge-dropped'}`} style={{ fontSize: 10, fontWeight: 800 }}>
                    {p.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4 }}>{p.name}</h3>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{p.type?.replace(/_/g, ' ') || 'Partner'}</div>
              </div>

              <div style={{ padding: '20px 24px', background: 'var(--gray-50)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)' }}>COMMISSION</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <TrendingUp size={14} /> {Number(p.commissionRate)}%
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--gray-400)' }}>REFERRALS</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--gray-700)', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={14} /> {p._count?.leads || 0}
                  </div>
                </div>
              </div>

              <div style={{ padding: 24, fontSize: 13, color: 'var(--gray-600)', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><User size={14} color="var(--gray-400)" /> {p.contactPerson || 'No contact'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Phone size={14} color="var(--gray-400)" /> {p.mobile || 'No mobile'}</div>
              </div>

              <div style={{ padding: '12px 24px', borderTop: '1px solid var(--gray-50)', textAlign: 'right' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  View Performance <ArrowRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
