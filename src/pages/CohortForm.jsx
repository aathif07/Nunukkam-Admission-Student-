import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Calendar, Layers, Users as UsersIcon, MapPin, Clock, BookOpen } from 'lucide-react';

export default function CohortForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [counselors, setCounselors] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    course_name: '',
    branch: '',
    timing: '',
    start_date: '',
    end_date: '',
    capacity: '50',
    counselor_id: ''
  });

  useEffect(() => {
    api.get('/auth/users', { params: { role: 'counselor', active_only: 'true' } })
      .then(r => setCounselors(r.data))
      .catch(console.error);
  }, []);

  // Auto-generate batch name from course + branch + timing
  useEffect(() => {
    const parts = [];
    if (formData.course_name) parts.push(formData.course_name);
    if (formData.branch) parts.push(formData.branch);
    if (formData.timing) parts.push(formData.timing);
    if (formData.start_date) {
      const d = new Date(formData.start_date);
      parts.push(d.toLocaleString('en-IN', { month: 'short', year: 'numeric' }));
    }
    if (parts.length > 0) {
      setFormData(prev => ({ ...prev, name: parts.join(' — ') }));
    }
  }, [formData.course_name, formData.branch, formData.timing, formData.start_date]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.course_name) {
      toast.error('Course Name is required');
      return;
    }
    setLoading(true);
    try {
      await api.post('/cohorts', formData);
      toast.success('Batch created successfully!');
      navigate('/cohorts');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in" style={{ maxWidth: 700, margin: '0 auto' }}>
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cohorts')} style={{ marginBottom: 16 }}>
        <ArrowLeft size={16} /> Back to Batches
      </button>

      <div className="card" style={{ borderRadius: 24, overflow: 'hidden', border: '1.5px solid var(--primary-50)' }}>
        <div className="card-header" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', padding: '32px' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'white', fontSize: 22, fontWeight: 800 }}>
            <Layers size={24} /> Create New Academic Batch
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 }}>Define course, branch, timing and assign leadership for a new student cohort</p>
        </div>
        <div className="card-body" style={{ padding: '32px' }}>
          <form onSubmit={handleSubmit}>

            {/* Course & Branch */}
            <div style={{ background: 'var(--primary-50)', padding: 20, borderRadius: 16, marginBottom: 24, border: '1.5px solid var(--primary-100)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <BookOpen size={16} /> Course Configuration
              </h3>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label" style={{ fontWeight: 700 }}>Course Name *</label>
                <input 
                  className="form-input" 
                  placeholder="e.g. Banking (IBPS PO), TNPSC Group 2, Spoken English" 
                  value={formData.course_name}
                  onChange={e => setFormData({...formData, course_name: e.target.value})}
                  required
                  style={{ height: 48 }}
                />
              </div>
              <div className="form-row" style={{ gap: 16 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    <MapPin size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Branch *
                  </label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Chromepet, Tambaram, Guindy" 
                    value={formData.branch}
                    onChange={e => setFormData({...formData, branch: e.target.value})}
                    required
                    style={{ height: 48 }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label" style={{ fontWeight: 700 }}>
                    <Clock size={14} style={{ display: 'inline', verticalAlign: 'text-bottom' }} /> Timing *
                  </label>
                  <input 
                    className="form-input" 
                    placeholder="e.g. Morning (6 AM - 9 AM)" 
                    value={formData.timing}
                    onChange={e => setFormData({...formData, timing: e.target.value})}
                    required
                    style={{ height: 48 }}
                  />
                </div>
              </div>
            </div>

            {/* Auto-generated batch name */}
            <div className="form-group" style={{ marginBottom: 24 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Batch Designation (Auto-generated)</label>
              <input 
                className="form-input" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
                style={{ height: 50, fontSize: 15, background: 'var(--gray-50)', fontWeight: 600 }}
              />
              <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>Auto-generated from course, branch, timing and start date. You can edit it.</div>
            </div>

            {/* Schedule & Capacity */}
            <div className="form-row" style={{ gap: 24, marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Lead Counselor Assignment</label>
                <select 
                  className="form-select" 
                  value={formData.counselor_id}
                  onChange={e => setFormData({...formData, counselor_id: e.target.value})}
                  style={{ height: 48 }}
                >
                  <option value="">Select Counselor</option>
                  {counselors.map(c => <option key={c.userId} value={c.userId}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Enrollment Capacity (Seats)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  value={formData.capacity}
                  onChange={e => setFormData({...formData, capacity: e.target.value})}
                  placeholder="50" 
                  style={{ height: 48 }}
                />
              </div>
            </div>

            <div className="form-row" style={{ gap: 24, marginBottom: 24 }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Batch Start Date *</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.start_date}
                  onChange={e => setFormData({...formData, start_date: e.target.value})}
                  required 
                  style={{ height: 48 }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>Anticipated End Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={formData.end_date}
                  onChange={e => setFormData({...formData, end_date: e.target.value})}
                  style={{ height: 48 }}
                />
              </div>
            </div>

            <div style={{ background: 'var(--primary-50)', padding: 20, borderRadius: 16, marginBottom: 32, display: 'flex', gap: 16, border: '1.5px solid var(--primary-100)' }}>
              <div style={{ background: 'var(--primary)', color: 'white', padding: 8, borderRadius: 10, height: 'fit-content' }}><UsersIcon size={20} /></div>
              <div style={{ fontSize: 13, color: 'var(--primary-900)', lineHeight: 1.5 }}>
                <strong>How it works:</strong> The Course, Branch, and Timing you set here will appear as options in the Student Enrollment Form. When a student enrolls with a matching course, branch, and timing, they are automatically linked to this batch.
              </div>
            </div>

            <button className="btn btn-primary btn-lg" style={{ width: '100%', height: 56, borderRadius: 16, fontSize: 16, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><Save size={20} /> Initialize Batch</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
