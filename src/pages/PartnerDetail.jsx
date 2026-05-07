import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Wallet, Users, History, TrendingUp, CheckCircle, Clock, ToggleLeft, ToggleRight, Info } from 'lucide-react';

export default function PartnerDetail() {
  const { id } = useParams();
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPartner = () => {
    api.get(`/partners/${id}`)
      .then(r => setPartner(r.data))
      .catch(() => toast.error('Failed to load partner details'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPartner(); }, [id]);

  const toggleStatus = async () => {
    try {
      await api.patch(`/partners/${id}`, { is_active: !partner.isActive });
      toast.success(`Partner ${!partner.isActive ? 'activated' : 'deactivated'}`);
      fetchPartner();
    } catch (err) { toast.error('Failed to update status'); }
  };

  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;
  if (!partner) return <div className="empty-state"><h3>Partner not found</h3></div>;

  return (
    <div className="animate-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/partners')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to Partners</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{partner.name}</h1>
          <p style={{ color: 'var(--gray-500)' }}>ID: {partner.partnerId}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className={`btn btn-sm ${partner.isActive ? 'btn-success' : 'btn-danger'}`} onClick={toggleStatus}>
            {partner.isActive ? <><ToggleRight size={18} /> Active</> : <><ToggleLeft size={18} /> Inactive</>}
          </button>
        </div>
      </div>

      {/* Commission Split Logic Info */}
      <div style={{ background: 'var(--primary-50)', border: '1.5px solid var(--primary-100)', padding: 16, borderRadius: 16, marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: 10, borderRadius: 12 }}><Info size={24} /></div>
        <div style={{ fontSize: 14 }}>
          <strong>Payout Split Procedure:</strong> This partner receives <strong>{partner.commissionRate}%</strong> of every payment collected from their referred students. 
          Commissions are calculated in real-time when the student pays their fees.
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="stat-card" style={{ border: '1px solid var(--primary-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="stat-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary)' }}><TrendingUp size={20} /></div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)' }}>{Number(partner.commissionRate)}% RATE</div>
          </div>
          <div className="stat-value">₹{(partner.totalCommission || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Commission Earned</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid var(--primary-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><CheckCircle size={20} /></div>
          </div>
          <div className="stat-value">₹{(partner.totalPaid || 0).toLocaleString('en-IN')}</div>
          <div className="stat-label">Total Payouts Released</div>
        </div>
        <div className="stat-card" style={{ border: '1px solid var(--primary-100)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div className="stat-icon" style={{ background: 'var(--warning-light)', color: '#a16207' }}><Clock size={20} /></div>
          </div>
          <div className="stat-value">₹{(partner.totalCommission - partner.totalPaid).toLocaleString('en-IN')}</div>
          <div className="stat-label">Unpaid Commission Balance</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
        <div className="card">
          <div className="card-header"><h2>Contact Information</h2></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[['Type', partner.type?.replace(/_/g,' ')], ['Contact Person', partner.contactPerson], ['Mobile', partner.mobile], ['Email', partner.email]].map(([l,v]) => (
                <div key={l}>
                  <div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                  <div style={{ fontWeight: 600, color: 'var(--gray-800)' }}>{v || '—'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <History size={18} /> <h2>Commission Payout History</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Fee Collected</th>
                    <th>Commission</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {partner.payouts?.length > 0 ? partner.payouts.map(p => (
                    <tr key={p.payoutId}>
                      <td style={{ fontSize: 13 }}>{new Date(p.createdAt).toLocaleDateString()}</td>
                      <td style={{ fontWeight: 600 }}>₹{Number(p.feeCollected).toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>₹{Number(p.commissionAmount).toLocaleString('en-IN')}</td>
                      <td><span className={`badge badge-${p.payoutStatus}`}>{p.payoutStatus}</span></td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No payouts recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Users size={18} /> <h2>Referred Students</h2>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Course</th>
                    <th>Status</th>
                    <th>Paid Fees</th>
                  </tr>
                </thead>
                <tbody>
                  {partner.leads?.length > 0 ? partner.leads.map(l => (
                    <tr key={l.leadId} className="clickable" onClick={() => navigate(`/leads/${l.leadId}`)}>
                      <td style={{ fontWeight: 600 }}>{l.name}</td>
                      <td style={{ fontSize: 13 }}>{l.courseName || '—'}</td>
                      <td><span className={`badge badge-${l.status}`}>{l.status.replace(/_/g,' ')}</span></td>
                      <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                        {l.enrollment ? `₹${l.enrollment.payments?.reduce((s,p)=>s+Number(p.amountPaid), 0).toLocaleString('en-IN')}` : '₹0'}
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="4" style={{ textAlign: 'center', padding: 32, color: 'var(--gray-400)' }}>No student referrals yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
