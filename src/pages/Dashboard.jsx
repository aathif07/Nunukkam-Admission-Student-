import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Users, ClipboardCheck, GraduationCap, IndianRupee, Handshake, TrendingUp, ArrowRight, UserPlus, Clock, Zap, Target, LayoutDashboard, Layers, Sparkles, Activity, PieChart as PieIcon, BarChart3, Search, Calendar, Filter } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const PURPLE_GRADIENTS = ['#4A148C', '#6A1C9A', '#7B1FA2', '#8E24AA', '#9C27B0', '#AB47BC'];
const SOURCE_COLORS = ['#6A1C9A', '#00C49F', '#FFBB28', '#FF8042', '#0088FE'];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      api.get('/dashboard/stats'),
      api.get('/cohorts')
    ]).then(([sRes, cRes]) => {
      setStats(sRes.data);
      setCohorts(cRes.data);
    }).catch(console.error).finally(() => setLoading(false));

    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;
  if (!stats) return <div className="empty-state"><h3>Could not load dashboard</h3></div>;

  const conversionRate = stats.totalLeads > 0 ? ((stats.enrolledLeads / stats.totalLeads) * 100).toFixed(1) : 0;
  const statusDistribution = stats.statusDistribution?.map((s, i) => ({ 
    name: s.status.replace(/_/g, ' '), 
    value: s.count, 
    fill: PURPLE_GRADIENTS[i % PURPLE_GRADIENTS.length] 
  })) || [];

  // Real Source Data from stats
  const sourceData = stats.sourceDistribution?.length > 0 
    ? stats.sourceDistribution.map(s => ({ name: s.source, value: s.count }))
    : [{ name: 'Direct/Other', value: 0 }];

  return (
    <div className="animate-in" style={{ color: 'var(--gray-900)', paddingBottom: 60 }}>
      {/* Dynamic Header */}
      <div style={{ 
        background: 'linear-gradient(135deg, #38006B 0%, #6A1C9A 100%)', 
        borderRadius: '24px', padding: '48px 40px', marginBottom: 32, color: 'white', 
        boxShadow: '0 25px 50px -12px rgba(74, 20, 140, 0.5)', position: 'relative', overflow: 'hidden' 
      }}>
        <div style={{ position: 'absolute', top: -100, right: -100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: -50, left: '20%', width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(20px)' }} />
        
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 12px', borderRadius: 100, fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Sparkles size={14} /> LIVE OPERATIONS
              </div>
              <div style={{ height: 1, width: 40, background: 'rgba(255,255,255,0.3)' }} />
              <span style={{ fontSize: 12, opacity: 0.7 }}>{new Date().toDateString()}</span>
            </div>
            <h1 style={{ fontSize: 40, fontWeight: 900, marginBottom: 12, letterSpacing: '-1.5px', textShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>{greeting}, Counselor!</h1>
            <p style={{ opacity: 0.9, fontSize: 16, fontWeight: 500, maxWidth: 550, lineHeight: 1.5 }}>
              The Nunukkam EIS is running at <span style={{ color: '#00e676', fontWeight: 800 }}>{conversionRate}% efficiency</span>. 
              Review the {stats.newLeads} new applications to maintain momentum.
            </p>
          </div>
          <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
             <Activity size={80} style={{ opacity: 0.1, marginBottom: -10 }} />
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 32 }}>
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: '#6A1C9A', trend: '+14%', sub: 'Active Pipeline' },
          { label: 'CRI Screening', value: stats.assessedLeads, icon: ClipboardCheck, color: '#00C49F', trend: 'LIVE', sub: 'Assessments Done' },
          { label: 'Enrollments', value: stats.enrolledLeads, icon: GraduationCap, color: '#FF8042', trend: `${conversionRate}%`, sub: 'Success Rate' },
          { label: 'Fee Collection', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN')}`, icon: IndianRupee, color: '#FFBB28', trend: 'SECURE', sub: 'Gross Revenue' },
        ].map((m, i) => (
          <div key={i} className="stat-card" style={{ 
            background: 'white', border: '1.5px solid var(--primary-50)', padding: 30, borderRadius: 28,
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            boxShadow: `0 10px 20px -5px ${m.color}15`,
            position: 'relative', overflow: 'hidden'
          }} onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-10px)';
            e.currentTarget.style.boxShadow = `0 20px 40px -10px ${m.color}40`;
          }} onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = `0 10px 20px -5px ${m.color}15`;
          }}>
            {/* Subtle Background Glow */}
            <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: `${m.color}05`, filter: 'blur(30px)' }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ 
                background: `linear-gradient(135deg, ${m.color}20, ${m.color}10)`, 
                color: m.color, padding: 14, borderRadius: 18,
                boxShadow: `inset 0 0 0 1px ${m.color}30`
              }}>
                <m.icon size={26} />
              </div>
              <div style={{ 
                fontSize: 11, fontWeight: 900, color: m.color, 
                background: `${m.color}10`, padding: '8px 16px', borderRadius: 100,
                backdropFilter: 'blur(4px)', border: `1px solid ${m.color}20`,
                height: 'fit-content'
              }}>
                {m.trend}
              </div>
            </div>
            <div style={{ fontSize: 40, fontWeight: 900, color: '#1A1A1A', letterSpacing: '-1.5px', marginBottom: 4 }}>{m.value}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-500)', display: 'flex', alignItems: 'center', gap: 6 }}>
              {m.label}
            </div>
            <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 16, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: m.color }} />
              {m.sub}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 32 }}>
        {/* Main Chart Card */}
        <div className="card" style={{ borderRadius: 24, padding: 0, border: '1.5px solid var(--primary-50)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '30px 32px', borderBottom: 'none' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><Activity size={20} color="var(--primary)" /> Enrollment Funnel Analysis</h2>
                <p style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 4 }}>Real-time distribution of leads across different operational stages</p>
              </div>
              <button className="btn btn-icon btn-secondary"><Filter size={16} /></button>
            </div>
          </div>
          <div className="card-body" style={{ padding: '0 32px 32px' }}>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={statusDistribution} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={1}/>
                    <stop offset="100%" stopColor="var(--primary-dark)" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--gray-500)', fontWeight: 600 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'var(--gray-500)' }} />
                <Tooltip cursor={{ fill: '#F3E5F5' }} contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Source Distribution Pie */}
        <div className="card" style={{ borderRadius: 24, padding: 0, border: '1.5px solid var(--primary-50)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '30px 32px', borderBottom: 'none' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}><PieIcon size={20} color="var(--primary)" /> Lead Sources</h2>
          </div>
          <div className="card-body" style={{ padding: '0 32px 32px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={sourceData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={SOURCE_COLORS[index % SOURCE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '100%', marginTop: 20 }}>
              {sourceData.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: SOURCE_COLORS[i] }} />
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{s.name}</span>
                  </div>
                  <span style={{ fontWeight: 800 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Quick Access Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div className="card" style={{ background: 'var(--primary-900)', color: 'white', borderRadius: 24, border: 'none', padding: 32 }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 10 }}><Zap size={20} /> Rapid Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
              <button className="btn" style={{ background: 'white', color: 'var(--primary-900)', height: 60, borderRadius: 16, fontSize: 15, fontWeight: 800, gap: 12 }} onClick={() => navigate('/enrollment')}>
                <UserPlus size={20} /> Register New Student
              </button>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <button className="btn" style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 54 }} onClick={() => navigate('/leads')}>Student CRM</button>
                <button className="btn" style={{ border: '1.5px solid rgba(255,255,255,0.2)', color: 'white', background: 'rgba(255,255,255,0.05)', borderRadius: 16, height: 54 }} onClick={() => navigate('/cohorts')}>Batch Management</button>
              </div>
              <button className="btn" style={{ border: '1.5px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 16, height: 54, gap: 8 }} onClick={() => navigate('/payouts')}>
                Financial Logs & Payouts <ArrowRight size={16} />
              </button>
            </div>
          </div>

          <div className="card" style={{ borderRadius: 24, padding: 32, border: '1.5px solid var(--primary-50)' }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 16 }}>Batch Progress</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {cohorts.length > 0 ? cohorts.slice(0, 4).map((c, i) => {
                const enrollmentCount = c._count?.enrollments || 0;
                const fillPercent = Math.min(100, Math.round((enrollmentCount / c.capacity) * 100));
                return (
                  <div key={c.cohortId}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ fontWeight: 700 }}>{c.name}</span>
                      <span style={{ color: 'var(--gray-500)' }}>{fillPercent}% Capacity</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ width: `${fillPercent}%`, height: '100%', background: PURPLE_GRADIENTS[i % PURPLE_GRADIENTS.length], borderRadius: 10 }} />
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--gray-400)', fontSize: 13 }}>No active batches found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Live Activity Feed */}
        <div className="card" style={{ borderRadius: 24, padding: 0, border: '1.5px solid var(--primary-50)', overflow: 'hidden' }}>
          <div className="card-header" style={{ padding: '30px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <h2 style={{ fontSize: 18, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff4444', animation: 'pulse 2s infinite' }} />
              Live Talent Pulse
            </h2>
            <button className="btn btn-sm btn-outline" style={{ borderRadius: 10, fontSize: 11 }}>VIEW ALL</button>
          </div>
          <div className="table-container" style={{ padding: '0 24px 24px' }}>
            <table style={{ borderCollapse: 'separate', borderSpacing: '0 12px' }}>
              <thead>
                <tr style={{ background: 'transparent' }}>
                  <th style={{ color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, padding: '0 16px' }}>Student</th>
                  <th style={{ color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Course</th>
                  <th style={{ color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Stage</th>
                  <th style={{ color: 'var(--gray-400)', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1 }}>Time</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {stats.recentLeads?.map(l => (
                  <tr key={l.leadId} onClick={() => navigate(`/leads/${l.leadId}`)} style={{ cursor: 'pointer', transition: 'all 0.3s' }} className="feed-row">
                    <td style={{ padding: '16px', background: 'var(--primary-50)', borderRadius: '16px 0 0 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'white', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>{l.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 800, color: 'var(--gray-900)', fontSize: 14 }}>{l.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--gray-500)' }}>{l.mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ background: 'var(--primary-50)', fontSize: 13, fontWeight: 600 }}><div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Layers size={14} color="var(--primary)" /> {l.courseName || 'General'}</div></td>
                    <td style={{ background: 'var(--primary-50)' }}><span className={`badge badge-${l.status}`} style={{ fontSize: 9, fontWeight: 800, padding: '4px 10px', borderRadius: 8 }}>{l.status}</span></td>
                    <td style={{ background: 'var(--primary-50)', fontSize: 12, color: 'var(--gray-500)' }}>{new Date(l.createdAt).toLocaleDateString()}</td>
                    <td style={{ background: 'var(--primary-50)', borderRadius: '0 16px 16px 0', textAlign: 'right', paddingRight: 20 }}><ArrowRight size={18} color="var(--primary)" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
