import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import { ArrowLeft, Send, CreditCard, Download, CheckCircle, ClipboardList, Users, UserCheck, FileText, Shield, GraduationCap, BarChart3, HelpCircle, Briefcase, Globe, Info, ExternalLink, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const FLOW_STEPS = [
  { key: 'new', label: 'Enrollment', icon: FileText },
  { key: 'assessment_sent', label: 'Screening', icon: ClipboardList },
  { key: 'assessed', label: 'CRI Result', icon: BarChart3 },
  { key: 'counseled', label: 'Counselor', icon: Users },
  { key: 'parent_aligned', label: 'Parent', icon: UserCheck },
  { key: 'commitment_accepted', label: 'Commitment', icon: Shield },
  { key: 'enrolled', label: 'Payment', icon: CreditCard },
];

const STATUS_ORDER = ['new', 'assessment_sent', 'assessed', 'counseled', 'parent_aligned', 'commitment_accepted', 'enrolled'];

const CRI_SECTIONS = [
  { id: 'section1', title: 'Communication Skills', questions: ['How comfortable are you speaking in English?', 'How often do you speak with strangers in professional settings?', 'Have you done any public speaking or group discussions?', 'Rate your ability to explain things clearly to others.'] },
  { id: 'section2', title: 'BFSI Aptitude', questions: ['Do you know the difference between a savings account and a current account?', 'Have you ever worked in banking, insurance, or finance?', 'Can you calculate simple interest mentally?', 'What is KYC?'] },
  { id: 'section3', title: 'Professional Discipline', questions: ['How punctual are you on average?', 'Do you follow a daily routine or schedule?', 'How rarely do you miss deadlines?', 'Rate your ability to follow instructions carefully.'] },
  { id: 'section4', title: 'Learning Agility', questions: ['How quickly do you learn new software or tools?', 'How well do you respond when given constructive feedback?', 'Have you ever taken an online course or certification?', 'Do you ask questions when you don\'t understand something?'] },
  { id: 'section5', title: 'Career Clarity & Professionalism', questions: ['Do you have a clear idea of the role you want in 2 years?', 'How motivated are you to work in the BFSI sector?', 'What drives you most in your career?', 'Have you done any job research before applying?'] },
  { id: 'section6', title: 'Interview Confidence', questions: ['Have you attended formal interviews before?', 'How confident are you in group interview settings?', 'Can you talk about yourself for 2 minutes comfortably?'] },
];

function getStepIndex(status) {
  const i = STATUS_ORDER.indexOf(status);
  return i >= 0 ? i : 0;
}

export default function LeadDetail() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showDetails, setShowDetails] = useState(false);
  const [counselorNotes, setCounselorNotes] = useState('');
  const [parentStatus, setParentStatus] = useState('NOT_CONTACTED');
  const [parentNotes, setParentNotes] = useState('');
  const [partners, setPartners] = useState([]);
  const [editingPartner, setEditingPartner] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const navigate = useNavigate();

  const fetchLead = () => { 
    api.get(`/leads/${id}`).then(r => { 
      setLead(r.data); 
      autoTab(r.data); 
      setSelectedPartnerId(r.data.partnerId || ''); 
    }).catch(() => toast.error('Lead not found')).finally(() => setLoading(false)); 
  };

  useEffect(() => { 
    fetchLead(); 
    api.get('/partners', { params: { active: true } }).then(r => setPartners(r.data));
  }, [id]);

  const autoTab = (l) => {
    const s = l.status;
    if (s === 'new') setActiveTab('info');
    else if (s === 'assessment_sent') setActiveTab('screening');
    else if (s === 'assessed') setActiveTab('cri');
    else if (s === 'counseled') setActiveTab('counselor');
    else if (s === 'parent_aligned') setActiveTab('parent');
    else if (s === 'commitment_accepted') setActiveTab('commitment');
    else if (s === 'enrolled') setActiveTab('payment');
  };

  const updateStatus = async (status) => {
    try { await api.patch(`/leads/${id}`, { status }); toast.success(`Status → ${status.replace(/_/g, ' ')}`); fetchLead(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const sendAssessment = async () => {
    try { await api.post(`/leads/${id}/send-assessment`); toast.success('Assessment link sent!'); fetchLead(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const updatePartner = async () => {
    try {
      await api.patch(`/leads/${id}`, { partner_id: selectedPartnerId || null });
      toast.success('Partner updated successfully');
      setEditingPartner(false);
      fetchLead();
    } catch (err) { toast.error('Failed to update partner'); }
  };

  const downloadApplication = async () => {
    try {
      const res = await api.get(`/leads/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${lead.name}_Application.pdf`);
      document.body.appendChild(link);
      link.click();
    } catch (err) { toast.error('Failed to generate PDF'); }
  };

  if (loading) return <div className="page-loader"><span className="spinner spinner-dark" /></div>;
  if (!lead) return <div className="empty-state"><h3>Lead not found</h3></div>;

  const currentStep = getStepIndex(lead.status);
  const assessment = lead.assessment;
  const chartData = assessment ? [
    { name: 'Comm', score: Number(assessment.commScore), fill: '#6B1EA2' },
    { name: 'BFSI', score: Number(assessment.bfsiScore), fill: '#6B1EA2' },
    { name: 'Discipline', score: Number(assessment.disciplineScore), fill: '#6B1EA2' },
    { name: 'Agility', score: Number(assessment.agilityScore), fill: '#6B1EA2' },
    { name: 'Career', score: Number(assessment.professionalismScore), fill: '#6B1EA2' },
    { name: 'Confidence', score: Number(assessment.confidenceScore), fill: '#6B1EA2' },
  ] : [];

  const getAnswerText = (val) => {
    if (val === 4) return 'Excellent / Strongly Agree';
    if (val === 3) return 'Good / Agree';
    if (val === 2) return 'Average / Neutral';
    if (val === 1) return 'Fair / Disagree';
    return 'Poor / Strongly Disagree';
  };

  return (
    <div className="animate-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <button className="btn btn-secondary btn-sm" onClick={() => navigate('/leads')}><ArrowLeft size={16} /> Back to Leads</button>
        <button className="btn btn-outline btn-sm" onClick={downloadApplication}><Download size={16} /> Download Full Application</button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800 }}>{lead.name}</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>{lead.mobile} • {lead.courseName || lead.city || ''}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className={`badge badge-${lead.status}`} style={{ fontSize: 14, padding: '6px 16px' }}>{lead.status.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Flow Stepper */}
      <div style={{ display: 'flex', gap: 2, marginBottom: 24, overflowX: 'auto', padding: '0 0 8px' }}>
        {FLOW_STEPS.map((s, i) => {
          const done = i <= currentStep;
          const active = i === currentStep;
          return (
            <div key={s.key} onClick={() => i <= currentStep && setActiveTab(['info','screening','cri','counselor','parent','commitment','payment'][i])} style={{
              flex: 1, minWidth: 90, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '10px 6px',
              background: active ? 'var(--primary)' : done ? 'var(--primary-dark)' : 'white',
              color: done ? 'white' : 'var(--gray-400)',
              border: `1.5px solid ${active ? 'var(--primary)' : done ? 'var(--primary-dark)' : 'var(--gray-200)'}`,
              borderRadius: 'var(--radius)', cursor: done ? 'pointer' : 'default', transition: 'all 0.2s', fontSize: 10, fontWeight: 600, textAlign: 'center',
            }}>
              {done && !active ? <CheckCircle size={16} /> : <s.icon size={16} />}
              {s.label}
            </div>
          );
        })}
      </div>

      {/* TAB: Info */}
      {activeTab === 'info' && (
        <div className="animate-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Basic Info */}
          <div className="card">
            <div className="card-header">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} /> Basic Information</h2>
              {lead.status === 'new' && <button className="btn btn-primary btn-sm" onClick={sendAssessment}><Send size={14} /> Send Screening Link</button>}
            </div>
            <div className="card-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
                {[
                  ['Course', lead.courseName], ['Branch', lead.branch], ['Timing', lead.timing], ['Form No', lead.enrolmentFormNo],
                  ['Batch', lead.cohort?.name || lead.enrollment?.cohort?.name || '—'],
                  ['Father', lead.fatherName], ['Father Occupation', lead.fatherOccupation], ['Gender', lead.gender], ['Category', lead.category],
                  ['DOB', lead.dateOfBirth ? new Date(lead.dateOfBirth).toLocaleDateString('en-IN') : null], ['Age', lead.age],
                  ['City', lead.city], ['State', lead.state], ['Source', lead.source], ['Counselor', lead.counselor?.name],
                ].map(([l, v]) => (
                  <div key={l}><div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div><div style={{ fontSize: 14, fontWeight: 600 }}>{v || '—'}</div></div>
                ))}
                
                {/* Partner Section */}
                <div style={{ border: '1.5px solid var(--primary-100)', padding: 12, borderRadius: 12, background: 'var(--primary-50)' }}>
                  <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, marginBottom: 6, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    PARTNER REFERENCE
                    {!editingPartner && <button className="btn btn-sm" style={{ padding: '2px 8px', fontSize: 10, background: 'var(--primary)', color: 'white' }} onClick={() => setEditingPartner(true)}>Change</button>}
                  </div>
                  {editingPartner ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <select className="form-select" style={{ fontSize: 12, padding: '4px 8px' }} value={selectedPartnerId} onChange={e => setSelectedPartnerId(e.target.value)}>
                        <option value="">No Partner</option>
                        {partners.map(p => <option key={p.partnerId} value={p.partnerId}>{p.name}</option>)}
                      </select>
                      <button className="btn btn-sm btn-success" onClick={updatePartner}>Save</button>
                    </div>
                  ) : (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-900)' }}>{lead.partner?.name || 'No Partner Assigned'}</div>
                  )}
                </div>
              </div>
              {lead.address && <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--gray-100)' }}><div style={{ fontSize: 11, color: 'var(--gray-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 4 }}>Full Address</div><div style={{ fontSize: 14 }}>{lead.address}</div></div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Education Info */}
            <div className="card">
              <div className="card-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><GraduationCap size={18} /> Education Details</h2></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Exam</th><th>Subject/Degree</th><th>Year</th><th>%</th></tr></thead>
                  <tbody>
                    {lead.educationDetails?.length > 0 ? lead.educationDetails.map((e, i) => (
                      <tr key={i}><td>{e.exam}</td><td style={{ fontWeight: 600 }}>{e.degree}</td><td>{e.dateOfPassing}</td><td style={{ fontWeight: 700 }}>{e.percentage}</td></tr>
                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>Not provided</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Work Experience */}
            <div className="card">
              <div className="card-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Briefcase size={18} /> Work Experience</h2></div>
              <div className="card-body">
                {lead.workExperience?.length > 0 ? lead.workExperience.map((w, i) => (
                  <div key={i} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: i < lead.workExperience.length - 1 ? '1px solid var(--gray-100)' : 'none' }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{w.designation} at {w.employer}</div>
                    <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Period: {w.period} | Reason for leaving: {w.reasonLeaving}</div>
                    <div style={{ fontSize: 13, marginTop: 4 }}>Duties: {w.duties}</div>
                  </div>
                )) : <div className="empty-state"><p>No work experience</p></div>}
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Languages */}
            <div className="card">
              <div className="card-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Globe size={18} /> Languages Known</h2></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Language</th><th>Read</th><th>Write</th><th>Speak</th></tr></thead>
                  <tbody>
                    {lead.languagesKnown?.length > 0 ? lead.languagesKnown.map((l, i) => (
                      <tr key={i}><td style={{ fontWeight: 600 }}>{l.language}</td><td>{l.read ? '✅' : '—'}</td><td>{l.write ? '✅' : '—'}</td><td>{l.speak ? '✅' : '—'}</td></tr>
                    )) : <tr><td colSpan="4" style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>Not provided</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Reference Friends */}
            <div className="card">
              <div className="card-header"><h2 style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Users size={18} /> References</h2></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Name</th><th>Mobile</th><th>Location</th></tr></thead>
                  <tbody>
                    {lead.referenceFriends?.length > 0 ? lead.referenceFriends.map((f, i) => (
                      <tr key={i}><td style={{ fontWeight: 600 }}>{f.name}</td><td>{f.mobile}</td><td>{f.location}</td></tr>
                    )) : <tr><td colSpan="3" style={{ textAlign: 'center', padding: 20, color: 'var(--gray-400)' }}>No references</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Screening */}
      {activeTab === 'screening' && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Student Screening</h2></div>
          <div className="card-body">
            {assessment ? (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <CheckCircle size={48} color="var(--primary)" style={{ marginBottom: 12 }} />
                <h3 style={{ color: 'var(--primary)' }}>Screening Completed</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>CRI Score has been generated. Click "CRI Result" to view.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={() => setActiveTab('cri')}>View CRI Result <ChevronRight size={16} /></button>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: 20 }}>
                <ClipboardList size={48} color="var(--primary-200)" style={{ marginBottom: 12 }} />
                <h3>Screening Pending</h3>
                <p style={{ color: 'var(--gray-500)', marginTop: 8 }}>Student needs to complete the screening assessment.</p>
                <div style={{ background: 'var(--primary-50)', padding: 16, borderRadius: 'var(--radius)', marginTop: 16, fontSize: 14, wordBreak: 'break-all' }}>
                  <strong>Assessment Link:</strong><br />
                  <a href={`${window.location.origin}/assess/${lead.leadId}`} target="_blank" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 8 }}>
                    Open Assessment <ExternalLink size={14} />
                  </a>
                </div>
                {lead.status === 'new' && <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={sendAssessment}><Send size={14} /> Send Screening Link</button>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: CRI Result */}
      {activeTab === 'cri' && (
        <div className="animate-in">
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header"><h2>CRI Result — Career Readiness Index</h2>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-sm btn-outline" onClick={() => setShowDetails(!showDetails)}><HelpCircle size={14} /> {showDetails ? 'Hide Q&A' : 'View Detailed Q&A'}</button>
                {assessment?.scorecardPdfUrl && <a href={`http://localhost:4000${assessment.scorecardPdfUrl}`} target="_blank" className="btn btn-sm btn-outline"><Download size={14} /> Download PDF</a>}
                {lead.status === 'assessed' && <button className="btn btn-primary btn-sm" onClick={() => { updateStatus('counseled'); setActiveTab('counselor'); }}>Counseling <ChevronRight size={14} /></button>}
              </div>
            </div>
            <div className="card-body">
              {assessment ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 32, marginBottom: 24, flexWrap: 'wrap' }}>
                    <div style={{ textAlign: 'center', minWidth: 140 }}>
                      <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--primary)' }}>{Number(assessment.overallCri).toFixed(1)}</div>
                      <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Overall CRI Score</div>
                      <span className={`badge badge-${assessment.band?.toLowerCase().replace(/ /g, '-')}`} style={{ marginTop: 8, fontSize: 14, padding: '6px 16px', background: 'var(--primary)', color: 'white' }}>{assessment.band}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 300 }}>
                      <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 11 }} /><Tooltip />
                          <Bar dataKey="score" radius={[6, 6, 0, 0]}>{chartData.map((e, i) => <Cell key={i} fill={e.fill} />)}</Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </>
              ) : <div className="empty-state"><p>CRI not yet generated.</p></div>}
            </div>
          </div>

          {/* Detailed Q&A Results */}
          {showDetails && assessment?.answers && (
            <div className="animate-in">
              {CRI_SECTIONS.map((section, sIdx) => {
                const sectionAnswers = assessment.answers[`section${sIdx + 1}_answers`] || [];
                return (
                  <div key={section.id} className="card" style={{ marginBottom: 16, border: '1px solid var(--primary-100)' }}>
                    <div className="card-header" style={{ background: 'var(--primary-50)', padding: '12px 20px' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary-900)' }}>{sIdx + 1}. {section.title}</h3>
                    </div>
                    <div className="card-body" style={{ padding: '0 20px' }}>
                      {section.questions.map((q, qIdx) => (
                        <div key={qIdx} style={{ padding: '16px 0', borderBottom: qIdx === section.questions.length - 1 ? 'none' : '1px solid var(--gray-100)' }}>
                          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-800)', marginBottom: 8 }}>{qIdx + 1}. {q}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', background: 'var(--primary-50)', padding: '4px 12px', borderRadius: 6 }}>
                              Score: {sectionAnswers[qIdx] || 0} / 4
                            </div>
                            <div style={{ fontSize: 13, color: 'var(--gray-600)' }}>
                              Response: <span style={{ fontWeight: 600 }}>{getAnswerText(sectionAnswers[qIdx])}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB: Counselor Review */}
      {activeTab === 'counselor' && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Counselor Review</h2>
            {lead.status === 'counseled' && <button className="btn btn-primary btn-sm" onClick={() => { updateStatus('parent_aligned'); setActiveTab('parent'); }}>Parent Alignment <ChevronRight size={14} /></button>}
          </div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Counselor Notes</label>
              <textarea className="form-textarea" rows={3} value={counselorNotes} onChange={e => setCounselorNotes(e.target.value)} placeholder="Add observations..." />
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => updateStatus('counseled')}>Save Notes</button>
          </div>
        </div>
      )}

      {/* TAB: Parent Alignment */}
      {activeTab === 'parent' && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Parent Alignment</h2>
            {lead.status === 'parent_aligned' && <button className="btn btn-primary btn-sm" onClick={() => { updateStatus('commitment_accepted'); setActiveTab('commitment'); }}>Commitment <ChevronRight size={14} /></button>}
          </div>
          <div className="card-body">
            <div className="form-group"><label className="form-label">Parent Status</label>
              <div className="radio-group">
                {['NOT_CONTACTED', 'CONTACTED', 'ALIGNED', 'REJECTED'].map(s => (
                  <button key={s} className={`btn btn-sm ${parentStatus === s ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setParentStatus(s)}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Commitment */}
      {activeTab === 'commitment' && (
        <div className="card animate-in" style={{ marginBottom: 20 }}>
          <div className="card-header"><h2>Commitment Agreement</h2>
            {['parent_aligned', 'commitment_accepted'].includes(lead.status) && !lead.enrollment && (
              <button className="btn btn-primary btn-sm" onClick={() => navigate(`/leads/${id}/payment/new`)}><CreditCard size={14} /> Proceed to Payment</button>
            )}
          </div>
          <div className="card-body">
            <div style={{ background: 'var(--primary-50)', padding: 20, borderRadius: 'var(--radius)' }}>
              <p>Student has agreed to all terms and conditions of the course. Commitment was accepted by the counselor after successful parent alignment.</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Payment */}
      {activeTab === 'payment' && (
        <div className="animate-in">
          {lead.enrollment?.payments?.length > 0 ? (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header"><h2>Payment History</h2></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Amount</th><th>Mode</th><th>Receipt</th><th>Date</th></tr></thead>
                  <tbody>
                    {lead.enrollment.payments.map(p => (
                      <tr key={p.paymentId}>
                        <td style={{ fontWeight: 700 }}>₹{Number(p.amountPaid).toLocaleString('en-IN')}</td>
                        <td>{p.paymentMode}</td>
                        <td>{p.receiptNumber}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : <div className="card"><div className="card-body"><p>No payments yet.</p></div></div>}
          
          {lead.status === 'enrolled' && (
            <div className="card" style={{ background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', color: 'white', textAlign: 'center', padding: 40 }}>
              <GraduationCap size={48} style={{ marginBottom: 16, opacity: 0.8 }} />
              <h2>Enrollment Confirmed!</h2>
              <p style={{ opacity: 0.8, marginTop: 8 }}>Student is successfully enrolled in {lead.enrollment?.cohort?.name || 'the batch'}.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
