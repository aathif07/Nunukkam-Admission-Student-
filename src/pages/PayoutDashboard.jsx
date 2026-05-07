import { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { Wallet, Clock, CheckCircle, IndianRupee } from 'lucide-react';

export default function PayoutDashboard() {
  const [data, setData] = useState({ payouts: [], summary: {}, pagination: {} });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [modal, setModal] = useState(null);
  const [payRef, setPayRef] = useState('');

  const fetch = () => {
    setLoading(true);
    api.get('/payouts', { params: { status: statusFilter !== 'all' ? statusFilter : undefined } })
      .then(r => setData(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [statusFilter]);

  const updateStatus = async (payoutId, newStatus) => {
    try {
      const body = { payout_status: newStatus };
      if (newStatus === 'paid') body.payment_reference = payRef;
      await api.patch(`/payouts/${payoutId}/status`, body);
      toast.success(`Status updated to ${newStatus}`);
      setModal(null); setPayRef(''); fetch();
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const s = data.summary || {};

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Payout Dashboard</h1>

      <div className="summary-cards">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}><Clock size={24} /></div>
          <div className="stat-value">{s.pendingCount || 0}</div>
          <div className="stat-label">Pending — ₹{(s.pendingAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--info-light)', color: 'var(--info)' }}><Wallet size={24} /></div>
          <div className="stat-value">{s.processedCount || 0}</div>
          <div className="stat-label">Processed — ₹{(s.processedAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}><CheckCircle size={24} /></div>
          <div className="stat-value">{s.paidCount || 0}</div>
          <div className="stat-label">Paid — ₹{(s.paidAmount || 0).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div className="toolbar">
        <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['all', 'pending', 'processed', 'paid'].map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="page-loader"><span className="spinner spinner-dark" /></div> : data.payouts.length === 0 ? (
          <div className="empty-state"><h3>No payouts found</h3></div>
        ) : (
          <div className="table-container">
            <table>
              <thead><tr><th>Student</th><th>Partner</th><th>Fee</th><th>Rate</th><th>Commission</th><th>Status</th><th>Action</th></tr></thead>
              <tbody>
                {data.payouts.map(p => (
                  <tr key={p.payoutId}>
                    <td style={{ fontWeight: 600 }}>{p.student_name}</td>
                    <td>{p.partner_name}</td>
                    <td>₹{Number(p.feeCollected).toLocaleString('en-IN')}</td>
                    <td>{Number(p.commissionRate)}%</td>
                    <td style={{ fontWeight: 700 }}>₹{Number(p.commissionAmount).toLocaleString('en-IN')}</td>
                    <td><span className={`badge badge-${p.payoutStatus}`}>{p.payoutStatus}</span></td>
                    <td>
                      {p.payoutStatus === 'pending' && <button className="btn btn-sm btn-primary" onClick={() => updateStatus(p.payoutId, 'processed')}>Mark Processed</button>}
                      {p.payoutStatus === 'processed' && <button className="btn btn-sm btn-success" onClick={() => setModal(p.payoutId)}>Mark Paid</button>}
                      {p.payoutStatus === 'paid' && <span style={{ fontSize: 12, color: 'var(--success)' }}>✓ {p.paidAt && new Date(p.paidAt).toLocaleDateString('en-IN')}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Mark as Paid</h3><button className="btn btn-icon btn-secondary" onClick={() => setModal(null)}>✕</button></div>
            <div className="modal-body">
              <div className="form-group"><label className="form-label">Payment Reference Number</label><input className="form-input" value={payRef} onChange={e => setPayRef(e.target.value)} placeholder="e.g. NEFT-20250615-001" /></div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={() => updateStatus(modal, 'paid')}>Confirm Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
