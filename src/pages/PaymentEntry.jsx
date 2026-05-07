import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, CreditCard, CheckCircle, Wallet } from 'lucide-react';

export default function PaymentEntry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [committed, setCommitted] = useState(false);
  const [feePlan, setFeePlan] = useState('full');
  const [totalFee, setTotalFee] = useState('');
  const [discount, setDiscount] = useState('0');
  const [scholarship, setScholarship] = useState('0');
  const [amountPaid, setAmountPaid] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [paymentMode, setPaymentMode] = useState('');
  const [txnId, setTxnId] = useState('');
  const [payerName, setPayerName] = useState('');
  const [cohortId, setCohortId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [receiptNumber] = useState(() => {
    const d = new Date();
    return `NNK-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
  });

  useEffect(() => {
    api.get(`/leads/${id}`).then(r => { 
      setLead(r.data); 
      setPayerName(r.data.name);
      // Fetch cohorts and auto-select matching one
      api.get('/cohorts', { params: { active: true } }).then(cr => {
        setCohorts(cr.data);
        // Auto-select cohort matching lead's course + branch + timing
        const match = cr.data.find(c => 
          c.courseName === r.data.courseName && 
          c.branch === r.data.branch && 
          c.timing === r.data.timing
        );
        if (match) setCohortId(match.cohortId);
      });
    });
  }, [id]);

  const finalFee = Math.max(0, Number(totalFee || 0) - Number(discount || 0) - Number(scholarship || 0));
  const balance = finalFee - Number(amountPaid || 0);

  // Auto-populate amountPaid for full payment
  useEffect(() => {
    if (feePlan === 'full' && finalFee > 0) {
      setAmountPaid(finalFee.toString());
    }
  }, [feePlan, finalFee]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!committed) { toast.error('Please accept the commitment declaration'); return; }
    if (Number(amountPaid) <= 0) { toast.error('Amount paid must be greater than 0'); return; }
    if (feePlan === 'full' && Number(amountPaid) < finalFee) { toast.error('For full payment, amount must cover final fee'); return; }
    if (feePlan === 'installment' && !dueDate) { toast.error('Due date required for installment'); return; }
    setSubmitting(true);
    try {
      const enrollRes = await api.post('/enrollments', { lead_id: id, cohort_id: cohortId || null, commitment_accepted: true });
      const payRes = await api.post(`/enrollments/${enrollRes.data.enrollment_id}/payments`, {
        fee_plan: feePlan, total_fee: finalFee, amount_paid: Number(amountPaid),
        due_date: dueDate || null, payment_mode: paymentMode, receipt_number: receiptNumber, payer_name: payerName,
      });
      // Calculate partner split for display
      const partnerRate = lead.partner ? Number(lead.partner.commissionRate) : 0;
      const partnerAmt = (Number(amountPaid) * partnerRate) / 100;
      const companyAmt = Number(amountPaid) - partnerAmt;
      setResult({ payRes: payRes.data, partnerRate, partnerAmt, companyAmt, finalFee, balance: finalFee - Number(amountPaid) });
      toast.success('Payment recorded successfully!');
    } catch (err) { toast.error(err.response?.data?.error || 'Payment failed'); }
    finally { setSubmitting(false); }
  };

  if (!lead) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;

  // Show result after payment
  if (result) return (
    <div>
      <div className="card" style={{ background: 'linear-gradient(135deg, #dcfce7, #f0fdf4)', border: '1.5px solid var(--success)' }}>
        <div className="card-body" style={{ textAlign: 'center', padding: 32 }}>
          <CheckCircle size={56} color="var(--success)" />
          <h1 style={{ color: 'var(--success)', marginTop: 8, fontSize: 24 }}>Payment Recorded!</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: 4 }}>Receipt #{receiptNumber}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 20 }}>
        <div className="card">
          <div className="card-header"><h2>Fee Summary</h2></div>
          <div className="card-body">
            {[['Total Fee', `₹${Number(totalFee).toLocaleString('en-IN')}`], ['Discount', `- ₹${Number(discount).toLocaleString('en-IN')}`], ['Scholarship', `- ₹${Number(scholarship).toLocaleString('en-IN')}`], ['Final Fee', `₹${result.finalFee.toLocaleString('en-IN')}`], ['Amount Paid', `₹${Number(amountPaid).toLocaleString('en-IN')}`], ['Balance', `₹${result.balance.toLocaleString('en-IN')}`]].map(([l, v], i) => (
              <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 5 ? '1px solid var(--gray-100)' : 'none', fontWeight: i >= 3 ? 700 : 400, color: i === 5 && result.balance > 0 ? 'var(--danger)' : undefined }}>
                <span style={{ fontSize: 13 }}>{l}</span><span>{v}</span>
              </div>
            ))}
          </div>
        </div>

        {lead.partner && (
          <div className="card">
            <div className="card-header"><h2><Wallet size={18} /> Partner Share Split</h2></div>
            <div className="card-body">
              <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius)', marginBottom: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Partner: {lead.partner.name} ({result.partnerRate}%)</div>
              </div>
              {[['Amount Paid', `₹${Number(amountPaid).toLocaleString('en-IN')}`], ['Partner Amount', `₹${result.partnerAmt.toLocaleString('en-IN')}`], ['Company Amount', `₹${result.companyAmt.toLocaleString('en-IN')}`]].map(([l, v], i) => (
                <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--gray-100)' : 'none', fontWeight: i > 0 ? 700 : 400, color: i === 1 ? 'var(--primary)' : i === 2 ? 'var(--success)' : undefined }}>
                  <span style={{ fontSize: 13 }}>{l}</span><span>{v}</span>
                </div>
              ))}
              <div style={{ marginTop: 12, padding: 10, background: 'var(--info-light)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--info)' }}>
                Formula: Partner Amount = Amount Paid × {result.partnerRate}% = ₹{result.partnerAmt.toLocaleString('en-IN')}
              </div>
            </div>
          </div>
        )}
      </div>

      <button className="btn btn-primary btn-lg" style={{ marginTop: 24, width: '100%' }} onClick={() => navigate(`/leads/${id}`)}>
        View Student Profile <CheckCircle size={16} />
      </button>
    </div>
  );

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate(`/leads/${id}`)} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Payment Entry</h1>

      {/* Student Summary */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div className="card-body" style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
          <div><div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Student</div><div style={{ fontWeight: 700, fontSize: 16 }}>{lead.name}</div></div>
          <div><div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Mobile</div><div>{lead.mobile}</div></div>
          <div><div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Course</div><div>{lead.courseName || '—'}</div></div>
          {lead.assessment && <div><div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>CRI Band</div><span className={`badge badge-${lead.assessment.band.toLowerCase().replace(/ /g,'-')}`}>{lead.assessment.band}</span></div>}
          {lead.partner && <div><div style={{ fontSize: 12, color: 'var(--gray-500)', fontWeight: 600 }}>Partner</div><div>{lead.partner.name} ({Number(lead.partner.commissionRate)}%)</div></div>}
        </div>
      </div>

      {/* Commitment */}
      <div style={{ padding: 16, background: committed ? 'var(--success-light)' : 'var(--warning-light)', borderRadius: 'var(--radius)', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'flex-start', border: `1.5px solid ${committed ? 'var(--success)' : 'var(--warning)'}`, transition: 'all 0.3s' }}>
        <input type="checkbox" checked={committed} onChange={e => setCommitted(e.target.checked)} style={{ marginTop: 3, width: 18, height: 18 }} />
        <div style={{ fontSize: 14 }}><strong>Commitment Declaration:</strong> Student has accepted attendance rules, professional conduct, placement discipline, task completion requirements, and the refund policy.</div>
      </div>

      <div className="card" style={{ opacity: committed ? 1 : 0.4, pointerEvents: committed ? 'auto' : 'none', transition: 'opacity 0.3s' }}>
        <div className="card-header"><h2>Fee Plan & Payment</h2></div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label className="form-label">Fee Plan *</label>
              <div className="radio-group">
                {['full', 'installment'].map(f => <label key={f} className={`radio-option ${feePlan === f ? 'selected' : ''}`} onClick={() => setFeePlan(f)}><input type="radio" checked={feePlan === f} readOnly />{f === 'full' ? 'Full Payment' : 'Installment'}</label>)}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group"><label className="form-label">Total Course Fee (₹) *</label><input className="form-input" type="number" value={totalFee} onChange={e => setTotalFee(e.target.value)} required placeholder="50000" /></div>
              <div className="form-group"><label className="form-label">Discount (₹)</label><input className="form-input" type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Scholarship (₹)</label><input className="form-input" type="number" value={scholarship} onChange={e => setScholarship(e.target.value)} placeholder="0" /></div>
              <div className="form-group"><label className="form-label">Final Fee (₹)</label><input className="form-input" value={`₹${finalFee.toLocaleString('en-IN')}`} readOnly style={{ background: 'var(--gray-50)', fontWeight: 700, fontSize: 16 }} /></div>
            </div>

            <div style={{ padding: 12, background: 'var(--info-light)', borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 13 }}>
              Final Fee = Total Fee - Discount - Scholarship = <strong>₹{finalFee.toLocaleString('en-IN')}</strong>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Amount Paid Now (₹) *</label>
                <input 
                  className="form-input" 
                  type="number" 
                  value={amountPaid} 
                  onChange={e => setAmountPaid(e.target.value)} 
                  required 
                  placeholder="10000" 
                  readOnly={feePlan === 'full'}
                  style={feePlan === 'full' ? { background: 'var(--gray-50)', fontWeight: 600 } : {}}
                />
              </div>
              <div className="form-group"><label className="form-label">Balance</label><input className="form-input" value={balance > 0 ? `₹${balance.toLocaleString('en-IN')}` : '₹0'} readOnly style={{ background: balance > 0 ? '#fef2f2' : '#f0fdf4', fontWeight: 700, color: balance > 0 ? 'var(--danger)' : 'var(--success)' }} /></div>
            </div>

            {feePlan === 'installment' && balance > 0 && (
              <div className="form-group"><label className="form-label">Due Date for Balance *</label><input className="form-input" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required /></div>
            )}

            <div className="form-row">
              <div className="form-group"><label className="form-label">Payment Mode *</label>
                <select className="form-select" value={paymentMode} onChange={e => setPaymentMode(e.target.value)} required><option value="">Select</option>{['UPI','Card','Cash','Bank Transfer','Cheque'].map(m => <option key={m}>{m}</option>)}</select>
              </div>
              <div className="form-group"><label className="form-label">Transaction ID</label><input className="form-input" value={txnId} onChange={e => setTxnId(e.target.value)} placeholder="Optional" /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Payer Name *</label><input className="form-input" value={payerName} onChange={e => setPayerName(e.target.value)} required /></div>
              <div className="form-group"><label className="form-label">Cohort / Batch *</label>
                <select className="form-select" value={cohortId} onChange={e => setCohortId(e.target.value)} required>
                  <option value="">Select</option>
                  {cohorts.map(c => {
                    const isMatch = lead && c.courseName === lead.courseName && c.branch === lead.branch && c.timing === lead.timing;
                    return <option key={c.cohortId} value={c.cohortId}>{isMatch ? '✅ ' : ''}{c.name} — {c.branch || ''} {c.timing || ''} — Starts {new Date(c.startDate).toLocaleDateString('en-IN')}</option>;
                  })}
                </select>
              </div>
            </div>
            <div className="form-group"><label className="form-label">Receipt Number</label><input className="form-input" value={receiptNumber} readOnly style={{ background: 'var(--gray-50)' }} /></div>

            {lead.partner && (
              <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius)', marginBottom: 16, border: '1.5px solid var(--primary-200)' }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Partner Share Preview — {lead.partner.name} ({Number(lead.partner.commissionRate)}%)</div>
                <div style={{ display: 'flex', gap: 24 }}>
                  <div><span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Partner Gets:</span> <strong style={{ color: 'var(--primary)' }}>₹{((Number(amountPaid || 0) * Number(lead.partner.commissionRate)) / 100).toLocaleString('en-IN')}</strong></div>
                  <div><span style={{ fontSize: 12, color: 'var(--gray-500)' }}>Company Gets:</span> <strong style={{ color: 'var(--success)' }}>₹{(Number(amountPaid || 0) - (Number(amountPaid || 0) * Number(lead.partner.commissionRate)) / 100).toLocaleString('en-IN')}</strong></div>
                </div>
              </div>
            )}

            <button className="btn btn-success btn-lg" type="submit" disabled={submitting} style={{ width: '100%' }}>
              {submitting ? <span className="spinner" /> : <><CreditCard size={18} /> Confirm Payment & Enroll</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
