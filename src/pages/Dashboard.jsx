import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Users, ClipboardCheck, GraduationCap, IndianRupee, ArrowRight, UserPlus, Clock, Zap, Layers, Activity, PieChart as PieIcon, TrendingUp, Filter, ChevronRight, Calendar, Star, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PRIMARY = '#6B1EA2';
const BLUE = '#2563EB';

// Star decoration component
const StarDecoration = ({ className = '', style = {} }) => (
  <div className={className} style={style}>
    <Star size={24} fill="#FBBF24" color="#FBBF24" style={{ opacity: 0.3 }} />
  </div>
);

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
    fill: PRIMARY
  })) || [];

  const sourceData = stats.sourceDistribution?.length > 0
    ? stats.sourceDistribution.map(s => ({ name: s.source, value: s.count }))
    : [{ name: 'Direct/Other', value: 0 }];

  const sourceColors = ['#6B1EA2', '#2563EB', '#10B981', '#F59E0B', '#EF4444'];

  return (
    <div className="animate-in" style={{ color: 'var(--gray-900)', paddingBottom: 60, background: '#F8FAFC' }}>
      {/* Welcome Section - Modern Premium Banner */}
      <div className="card" style={{
        borderRadius: 24,
        padding: '36px 40px',
        marginBottom: 28,
        border: 'none',
        background: 'linear-gradient(135deg, #6B1EA2 0%, #8B5CF6 50%, #A78BFA 100%)',
        position: 'relative',
        overflow: 'hidden',
        minHeight: 180
      }}>
        {/* Abstract UI Elements - Right Side */}
        {/* Large rounded blob 1 */}
        <div style={{
          position: 'absolute',
          top: -60,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
          filter: 'blur(40px)'
        }} />
        {/* Large rounded blob 2 */}
        <div style={{
          position: 'absolute',
          bottom: -80,
          right: 100,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(167,139,250,0.3) 0%, rgba(167,139,250,0) 70%)',
          filter: 'blur(30px)'
        }} />
        {/* Floating glow circles */}
        <div style={{
          position: 'absolute',
          top: 30,
          right: 80,
          width: 60,
          height: 60,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)'
        }} />
        <div style={{
          position: 'absolute',
          bottom: 40,
          right: 200,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)'
        }} />
        {/* Star shapes with glow */}
        <div style={{ position: 'absolute', top: 50, right: 150, opacity: 0.4 }}>
          <Star size={20} fill="rgba(255,255,255,0.6)" color="rgba(255,255,255,0.6)" />
        </div>
        <div style={{ position: 'absolute', bottom: 60, right: 50, opacity: 0.3 }}>
          <Star size={16} fill="rgba(255,255,255,0.5)" color="rgba(255,255,255,0.5)" />
        </div>
        {/* Curved pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 400,
          height: 200,
          background: 'linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
          borderRadius: '0 120px 0 0'
        }} />

        {/* Content */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20, position: 'relative', zIndex: 1 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                background: 'rgba(255,255,255,0.2)',
                padding: '4px 12px',
                borderRadius: 20,
                letterSpacing: 0.5,
                backdropFilter: 'blur(10px)'
              }}>
                DASHBOARD
              </span>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 8, letterSpacing: '-0.5px' }}>
              {greeting}! 👋
            </h1>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', maxWidth: 500, lineHeight: 1.6 }}>
              You have <span style={{ color: '#FBBF24', fontWeight: 700 }}>{stats.newLeads} new leads</span> waiting. Your conversion rate is <span style={{ fontWeight: 700, color: 'white' }}>{conversionRate}%</span>. Keep up the great work!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid - Clean White Cards with Interactive Elements */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }}>
        {[
          { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: PRIMARY, sub: 'All time', change: '+12%' },
          { label: 'Screened', value: stats.assessedLeads, icon: ClipboardCheck, color: '#2563EB', sub: 'CRI Done', change: '+8%' },
          { label: 'Enrolled', value: stats.enrolledLeads, icon: GraduationCap, color: '#10B981', sub: 'Converted', change: '+15%' },
          { label: 'Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, icon: IndianRupee, color: '#F59E0B', sub: 'Collected', change: '+23%' },
        ].map((m, i) => (
          <div key={i} className="card" style={{
            padding: 24,
            borderRadius: 16,
            border: '1px solid var(--gray-100)',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }} onMouseOver={e => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.12)';
          }} onMouseOut={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            {/* Star decoration on hover */}
            <div style={{ position: 'absolute', top: -10, right: -10, opacity: 0, transition: 'opacity 0.3s' }} className="stat-star">
              <Star size={40} fill="#FBBF24" color="#FBBF24" style={{ opacity: 0.2 }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: `linear-gradient(135deg, ${m.color}15, ${m.color}05)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: m.color,
                transition: 'all 0.2s'
              }}>
                <m.icon size={24} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {m.change && <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981' }}>{m.change}</span>}
                <TrendingUp size={14} color="#10B981" />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--gray-900)', marginBottom: 4, letterSpacing: '-0.5px' }}>{m.value}</div>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>{m.label}</div>
            <div style={{ fontSize: 11, color: m.color, marginTop: 8, fontWeight: 600 }}>{m.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24, marginBottom: 28 }}>
        {/* Bar Chart */}
        <div className="card" style={{ borderRadius: 16, padding: 0, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Activity size={18} color={PRIMARY} /> Lead Pipeline
              </h3>
              <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Status breakdown</p>
            </div>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 8 }}>
              <Filter size={18} />
            </button>
          </div>
          <div style={{ padding: '0 28px 28px' }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={statusDistribution} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={PRIMARY} stopOpacity={1}/>
                    <stop offset="100%" stopColor={PRIMARY} stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 13 }} />
                <Bar dataKey="value" fill="url(#barGrad)" radius={[8, 8, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="card" style={{ borderRadius: 16, padding: 0, border: '1px solid var(--gray-100)', overflow: 'hidden' }}>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-50)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <PieIcon size={18} color={PRIMARY} /> Sources
            </h3>
            <p style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 2 }}>Lead origin</p>
          </div>
          <div style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sourceData} innerRadius={55} outerRadius={75} paddingAngle={4} dataKey="value">
                  {sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={sourceColors[index % sourceColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ width: '100%', marginTop: 16 }}>
              {sourceData.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: sourceColors[i] }} />
                    <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{s.name}</span>
                  </div>
                  <span style={{ color: 'var(--gray-900)', fontWeight: 700 }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.8fr', gap: 24 }}>
        {/* Quick Actions & Batches */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Quick Actions with Interactive Elements */}
          <div className="card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative star */}
            <div style={{ position: 'absolute', top: 10, right: 10, opacity: 0.15 }}>
              <Star size={30} fill="#FBBF24" color="#FBBF24" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={18} color={PRIMARY} /> Quick Actions
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button onClick={() => navigate('/enrollment')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'white', border: '1px solid var(--gray-200)',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseOver={e => { e.currentTarget.style.borderColor = PRIMARY; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}05)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserPlus size={20} color={PRIMARY} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)', display: 'block' }}>Register Student</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Add new admission</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--gray-400)" />
              </button>
              <button onClick={() => navigate('/leads')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'white', border: '1px solid var(--gray-200)',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseOver={e => { e.currentTarget.style.borderColor = BLUE; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={20} color={BLUE} />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)', display: 'block' }}>View All Leads</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Manage prospects</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--gray-400)" />
              </button>
              <button onClick={() => navigate('/cohorts')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'white', border: '1px solid var(--gray-200)',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseOver={e => { e.currentTarget.style.borderColor = '#10B981'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #F0FDF4, #DCFCE7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Layers size={20} color="#10B981" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)', display: 'block' }}>Manage Batches</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Cohort scheduling</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--gray-400)" />
              </button>
              <button onClick={() => navigate('/assessment')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 16px', background: 'white', border: '1px solid var(--gray-200)',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s'
              }} onMouseOver={e => { e.currentTarget.style.borderColor = '#F59E0B'; e.currentTarget.style.transform = 'translateX(4px)'; }} onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--gray-200)'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ClipboardCheck size={20} color="#F59E0B" />
                  </div>
                  <div>
                    <span style={{ fontWeight: 600, color: 'var(--gray-700)', display: 'block' }}>CRI Screening</span>
                    <span style={{ fontSize: 11, color: 'var(--gray-400)' }}>Assessment tests</span>
                  </div>
                </div>
                <ChevronRight size={18} color="var(--gray-400)" />
              </button>
            </div>
          </div>

          {/* Batch Progress with Interactive Elements */}
          <div className="card" style={{ borderRadius: 16, padding: 24, border: '1px solid var(--gray-100)', position: 'relative', overflow: 'hidden' }}>
            {/* Decorative star */}
            <div style={{ position: 'absolute', top: 8, right: 8, opacity: 0.12 }}>
              <Star size={24} fill="#FBBF24" color="#FBBF24" />
            </div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar size={18} color={PRIMARY} /> Batch Capacity
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {cohorts.length > 0 ? cohorts.slice(0, 4).map((c, i) => {
                const enrollmentCount = c._count?.enrollments || 0;
                const fillPercent = Math.min(100, Math.round((enrollmentCount / c.capacity) * 100));
                const fillColor = fillPercent >= 80 ? '#10B981' : fillPercent >= 50 ? '#F59E0B' : PRIMARY;
                return (
                  <div key={c.cohortId} style={{ cursor: 'pointer', padding: 8, borderRadius: 8, transition: 'all 0.2s' }} onMouseOver={e => e.currentTarget.style.background = 'var(--gray-50)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, color: 'var(--gray-700)' }}>{c.name}</span>
                      <span style={{ color: fillColor, fontSize: 12, fontWeight: 600 }}>{fillPercent}%</span>
                    </div>
                    <div style={{ height: 8, background: 'var(--gray-100)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
                      <div style={{ width: `${fillPercent}%`, height: '100%', background: fillColor, borderRadius: 6, transition: 'width 0.5s ease' }} />
                      {fillPercent >= 80 && (
                        <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
                          <Award size={12} color="#10B981" />
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 6 }}>{enrollmentCount} / {c.capacity} students</div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)', fontSize: 13 }}>
                  <div style={{ marginBottom: 8, opacity: 0.5 }}><Layers size={32} /></div>
                  No batches yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Leads with Interactive Elements */}
        <div className="card" style={{ borderRadius: 16, padding: 0, border: '1px solid var(--gray-100)', overflow: 'hidden', position: 'relative' }}>
          {/* Decorative star */}
          <div style={{ position: 'absolute', top: 12, right: 12, opacity: 0.1 }}>
            <Star size={28} fill="#FBBF24" color="#FBBF24" />
          </div>
          <div style={{ padding: '24px 28px', borderBottom: '1px solid var(--gray-50)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--gray-900)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={18} color={PRIMARY} /> Recent Leads
            </h3>
            <button onClick={() => navigate('/leads')} style={{
              fontSize: 12, fontWeight: 600, color: PRIMARY, background: 'none', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, transition: 'all 0.2s'
            }} onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'} onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}>
              View All <ArrowRight size={14} />
            </button>
          </div>
          <div style={{ padding: '0 12px 12px' }}>
            {stats.recentLeads?.map((l, i) => (
              <div key={l.leadId} onClick={() => navigate(`/leads/${l.leadId}`)} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px',
                borderRadius: 12, cursor: 'pointer', transition: 'all 0.25s',
                marginBottom: 8, background: i % 2 === 0 ? '#F8FAFC' : 'white'
              }} onMouseOver={e => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.transform = 'translateX(4px)'; }}
                 onMouseOut={e => { e.currentTarget.style.background = i % 2 === 0 ? '#F8FAFC' : 'white'; e.currentTarget.style.transform = 'translateX(0)'; }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 12, background: `linear-gradient(135deg, ${PRIMARY}15, ${PRIMARY}05)`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color: PRIMARY, fontSize: 16,
                  transition: 'all 0.2s'
                }}>
                  {l.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--gray-900)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {l.name}
                    {l.status === 'ENROLLED' && <Award size={14} color="#10B981" />}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--gray-400)' }}>{l.mobile}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                    background: l.status === 'ENROLLED' ? '#F0FDF4' : l.status === 'ASSESSED' ? '#EFF6FF' : '#FEF3C7',
                    color: l.status === 'ENROLLED' ? '#10B981' : l.status === 'ASSESSED' ? BLUE : '#D97706',
                    display: 'inline-block'
                  }}>
                    {l.status}
                  </span>
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 4 }}>
                    {new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}