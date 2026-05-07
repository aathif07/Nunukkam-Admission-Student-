import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { Plus, Users, Calendar, ArrowRight, Layers, Layout, Clock, CheckCircle, MapPin } from 'lucide-react';

export default function CohortList() {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/cohorts')
      .then(r => setCohorts(r.data))
      .catch(() => toast.error('Failed to load batches'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px' }}>Batch Management</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Schedule and track student enrollment groups</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/cohorts/new')} style={{ padding: '12px 24px', borderRadius: 14 }}>
          <Plus size={20} /> Create New Batch
        </button>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
        <div className="stat-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ background: 'var(--primary-50)', color: 'var(--primary)', padding: 10, borderRadius: 12 }}><Layers size={20} /></div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{cohorts.length}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Active Batches</div>
        </div>
        <div className="stat-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ background: 'var(--success-light)', color: 'var(--success)', padding: 10, borderRadius: 12 }}><Users size={20} /></div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{cohorts.reduce((sum, c) => sum + (c._count?.enrollments || 0), 0)}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Allocated Students</div>
        </div>
        <div className="stat-card" style={{ padding: 24, borderRadius: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
            <div style={{ background: 'var(--warning-light)', color: '#a16207', padding: 10, borderRadius: 12 }}><Layout size={20} /></div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{cohorts.length > 0 ? Math.round(cohorts.reduce((sum, c) => sum + c.capacity, 0) / cohorts.length) : 0}</div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 600 }}>Avg Batch Capacity</div>
        </div>
      </div>

      <div className="card" style={{ borderRadius: 20, overflow: 'hidden', border: '1.5px solid var(--primary-50)' }}>
        <div className="table-container">
          <table>
            <thead style={{ background: 'var(--gray-50)' }}>
              <tr>
                <th style={{ padding: '20px 24px' }}>BATCH NAME & PROGRAM</th>
                <th>BRANCH</th>
                <th>TIMING</th>
                <th>START DATE</th>
                <th>ENROLLMENT</th>
                <th>CAPACITY STATUS</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cohorts.length > 0 ? cohorts.map(c => {
                const enrollmentCount = c._count?.enrollments || 0;
                const fillPercent = Math.min(100, Math.round((enrollmentCount / c.capacity) * 100));
                const isOngoing = new Date(c.startDate) <= new Date();

                return (
                  <tr key={c.cohortId} className="clickable" onClick={() => navigate(`/cohorts/${c.cohortId}`)} style={{ transition: 'all 0.2s' }}>
                    <td style={{ padding: '16px 24px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--primary-50)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Layers size={20} /></div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{c.name}</div>
                          <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{c.courseName}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                        <MapPin size={14} color="var(--primary)" />
                        {c.branch || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--gray-600)' }}>
                        <Clock size={14} color="var(--gray-400)" />
                        {c.timing || '—'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--gray-700)' }}>
                        <Calendar size={14} color="var(--gray-400)" />
                        {new Date(c.startDate).toLocaleDateString('en-IN')}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={14} color="var(--primary)" />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{enrollmentCount}</span>
                        <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>/ {c.capacity}</span>
                      </div>
                    </td>
                    <td style={{ minWidth: 150 }}>
                      <div style={{ height: 6, width: '100%', background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden', marginBottom: 4 }}>
                        <div style={{ width: `${fillPercent}%`, height: '100%', background: fillPercent > 80 ? 'var(--danger)' : 'var(--primary)' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: fillPercent > 80 ? 'var(--danger)' : 'var(--gray-500)' }}>{fillPercent}% FULL</div>
                    </td>
                    <td>
                      <span className={`badge`} style={{ 
                        background: isOngoing ? 'var(--success-light)' : 'var(--primary-50)', 
                        color: isOngoing ? 'var(--success)' : 'var(--primary)',
                        fontSize: 10, fontWeight: 800, padding: '4px 12px', borderRadius: 8
                      }}>
                        {isOngoing ? 'ONGOING' : 'UPCOMING'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', paddingRight: 24 }}><ArrowRight size={18} color="var(--primary)" /></td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
                    <Layers size={48} style={{ marginBottom: 16, opacity: 0.2 }} /><br />
                    <h3 style={{ color: 'var(--gray-900)', fontSize: 18 }}>No batches scheduled</h3>
                    <p>Start by creating your first academic enrollment group.</p>
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
