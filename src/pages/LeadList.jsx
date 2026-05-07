import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Search, Plus, Filter, User, Phone, MapPin, Calendar, ArrowRight, ClipboardList, Share2, Copy, Check, Link } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['all', 'new', 'assessment_sent', 'assessed', 'counseled', 'parent_aligned', 'commitment_accepted', 'enrolled', 'dropped'];

export default function LeadList() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const registerUrl = `${window.location.origin}/register`;

  const fetchLeads = () => {
    setLoading(true);
    api.get('/leads', { params: { search: search || undefined, status: status !== 'all' ? status : undefined, page, limit: 20 } })
      .then(r => { setLeads(r.data.leads); setPagination(r.data.pagination); })
      .catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeads(); }, [search, status, page]);

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Student Pipeline</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Manage {pagination.total || 0} active enrollment journeys</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-secondary" onClick={() => setShowShareModal(true)} style={{ padding: '12px 20px', borderRadius: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Share2 size={18} /> Share Link
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/enrollment')} style={{ padding: '12px 24px', borderRadius: 14 }}>
            <Plus size={20} /> Register New Student
          </button>
        </div>
      </div>

      <div className="toolbar" style={{ background: 'white', padding: '16px', borderRadius: 16, boxShadow: 'var(--shadow-sm)', marginBottom: 24, gap: 16 }}>
        <div className="search-input" style={{ flex: 1, background: 'var(--gray-50)', border: '1.5px solid var(--gray-100)' }}>
          <Search size={18} color="var(--primary)" />
          <input placeholder="Search by name, mobile, or ID..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Filter size={18} color="var(--gray-400)" />
          <select className="filter-select" style={{ minWidth: 160, background: 'var(--gray-50)', border: '1.5px solid var(--gray-100)' }} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
            {STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Stages' : s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--primary-50)' }}>
        {loading ? <div className="page-loader"><span className="spinner spinner-dark" /></div> : leads.length === 0 ? (
          <div className="empty-state" style={{ padding: 60 }}>
            <div style={{ background: 'var(--primary-50)', color: 'var(--primary)', padding: 20, borderRadius: '50%', marginBottom: 16 }}><Search size={32} /></div>
            <h3 style={{ fontSize: 20 }}>No students found</h3>
            <p style={{ maxWidth: 300, margin: '8px auto' }}>Try adjusting your search filters or add a new student registration.</p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead style={{ background: 'var(--gray-50)' }}>
                <tr>
                  <th style={{ padding: '20px 24px' }}>STUDENT PROFILE</th>
                  <th>PROGRAM</th>
                  <th>STAGE</th>
                  <th>ASSIGNED TO</th>
                  <th>SOURCE</th>
                  <th>LAST UPDATED</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {leads.map(l => (
                  <tr key={l.leadId} className="clickable" onClick={() => navigate(`/leads/${l.leadId}`)} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }}>{l.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{l.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={10} /> {l.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>{l.courseName || '—'}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)', display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={10} /> {l.branch || l.city || 'N/A'}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${l.status}`} style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 8, letterSpacing: 0.5 }}>
                        {l.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-100)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>{l.counselor?.name[0] || '?'}</div>
                         <div style={{ fontSize: 13, fontWeight: 500 }}>{l.counselor?.name || 'Unassigned'}</div>
                      </div>
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{l.source || 'Direct'}</td>
                    <td>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Calendar size={12} /> {new Date(l.createdAt).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}><ArrowRight size={18} color="var(--primary)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '20px 32px', background: 'var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Showing page {page} of {pagination.totalPages}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-sm btn-secondary" style={{ borderRadius: 10 }} disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</button>
              <button className="btn btn-sm btn-secondary" style={{ borderRadius: 10 }} disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next</button>
            </div>
          </div>
        )}
      </div>

    {/* Share Registration Link Modal */}
    {showShareModal && (
      <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
        <div className="modal animate-in" onClick={e => e.stopPropagation()} style={{ maxWidth: 500 }}>
          <div className="modal-header" style={{ padding: '24px 32px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10, margin: 0 }}>
              <Link size={22} color="var(--primary)" /> Share Registration Link
            </h2>
            <button className="btn btn-icon btn-secondary" style={{ borderRadius: '50%', width: 32, height: 32 }} onClick={() => setShowShareModal(false)}>✕</button>
          </div>
          <div className="modal-body" style={{ padding: '32px' }}>
            <p style={{ fontSize: 14, color: 'var(--gray-600)', marginBottom: 20, lineHeight: 1.6 }}>
              Share this link with students to let them register independently. Their submissions will appear in the Student Pipeline automatically.
            </p>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <input className="form-input" value={registerUrl} readOnly style={{ flex: 1, fontSize: 13, fontFamily: 'monospace', background: 'var(--gray-50)' }} />
              <button className="btn btn-primary" style={{ borderRadius: 12, padding: '10px 20px', minWidth: 100 }} onClick={() => {
                navigator.clipboard.writeText(registerUrl);
                setCopied(true);
                toast.success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
              }}>
                {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <a href={`https://wa.me/?text=${encodeURIComponent('Register for our program at Nunukkam Academy: ' + registerUrl)}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ flex: 1, borderRadius: 12, textDecoration: 'none', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
                📱 Share via WhatsApp
              </a>
              <a href={`mailto:?subject=Register at Nunukkam Academy&body=Complete your registration here: ${registerUrl}`} className="btn btn-secondary" style={{ flex: 1, borderRadius: 12, textDecoration: 'none', textAlign: 'center', padding: '10px 16px', fontSize: 13, fontWeight: 600 }}>
                ✉️ Share via Email
              </a>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
  );
}
