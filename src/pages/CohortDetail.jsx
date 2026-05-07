import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Users, Calendar, Layers, Search, GraduationCap } from 'lucide-react';

export default function CohortDetail() {
  const { id } = useParams();
  const [cohort, setCohort] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get(`/cohorts/${id}`)
      .then(r => setCohort(r.data))
      .catch(() => toast.error('Failed to load batch details'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;
  if (!cohort) return <div className="empty-state"><h3>Batch not found</h3></div>;

  const enrollmentCount = cohort._count?.enrollments || 0;
  const vacancy = cohort.capacity - enrollmentCount;

  return (
    <div className="animate-in">
      <button className="btn btn-secondary btn-sm" onClick={() => navigate('/cohorts')} style={{ marginBottom: 16 }}><ArrowLeft size={16} /> Back to Batches</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>{cohort.name}</h1>
          <p style={{ color: 'var(--gray-500)' }}>{cohort.courseName} — Batch Detail</p>
        </div>
        <span className="badge badge-enrolled" style={{ padding: '8px 20px', fontSize: 14 }}>{enrollmentCount} Students Enrolled</span>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Branch</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{cohort.branch || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Timing</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{cohort.timing || '—'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Lead Counselor</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{cohort.counselor?.name || 'Unassigned'}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Start Date</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{new Date(cohort.startDate).toLocaleDateString('en-IN')}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Capacity</div>
          <div className="stat-value" style={{ fontSize: 18 }}>{cohort.capacity} Seats</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Available Vacancy</div>
          <div className="stat-value" style={{ fontSize: 18, color: vacancy < 5 ? 'var(--danger)' : 'var(--success)' }}>{vacancy} Seats</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: 10 }}><Users size={18} /> Enrolled Students List</h2>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Mobile Number</th>
                <th>Admission Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cohort.enrollments?.length > 0 ? cohort.enrollments.map(e => (
                <tr key={e.enrollmentId}>
                  <td style={{ fontWeight: 600 }}>{e.lead.name}</td>
                  <td>{e.lead.mobile}</td>
                  <td><span className={`badge badge-${e.lead.status}`}>{e.lead.status.replace(/_/g, ' ')}</span></td>
                  <td>
                    <button className="btn btn-sm btn-outline" onClick={() => navigate(`/leads/${e.leadId}`)}>View Profile</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: 40, color: 'var(--gray-400)' }}>
                    <GraduationCap size={40} style={{ marginBottom: 12, opacity: 0.3 }} /><br />
                    No students have been assigned to this batch yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
