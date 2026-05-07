import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

export default function PartnerForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', type: '', contact_person: '', mobile: '', email: '', commission_rate: '', is_active: true });
  const [submitting, setSubmitting] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await api.post('/partners', { ...form, commission_rate: Number(form.commission_rate) });
      toast.success('Partner created!'); navigate('/partners');
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/partners')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back</button>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>Add Partner</h1>
      <div className="card"><div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Partner Name *</label><input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} required /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}><option value="">Select</option><option value="college">College</option><option value="coaching_center">Coaching Center</option><option value="referral_agent">Referral Agent</option></select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contact_person} onChange={e => set('contact_person', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Mobile</label><input className="form-input" value={form.mobile} onChange={e => set('mobile', e.target.value)} /></div>
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Commission Rate (%) *</label><input className="form-input" type="number" min="0" max="50" value={form.commission_rate} onChange={e => set('commission_rate', e.target.value)} required /></div>
          </div>
          <button className="btn btn-primary btn-lg" type="submit" disabled={submitting}>{submitting ? <span className="spinner" /> : <><Save size={18} /> Save Partner</>}</button>
        </form>
      </div></div>
    </div>
  );
}
