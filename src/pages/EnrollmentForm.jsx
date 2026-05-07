import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import api from '../api';
import toast from 'react-hot-toast';
import { UserPlus, ChevronRight, ChevronLeft, BookOpen, User, Phone, GraduationCap, Briefcase, Globe, MessageSquare, Users, CheckCircle } from 'lucide-react';

const schema = yup.object({
  name: yup.string().min(3).max(100).required('Name is required'),
  mobile: yup.string().matches(/^\d{10}$/, 'Must be 10 digits').required('Mobile is required'),
});

// Courses, branches, timings are now fetched dynamically from cohorts (Batch Management)
const CATEGORIES = ['BC', 'MBC', 'SC', 'ST', 'GEN'];
const STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Other'];
const SOURCES = ['Just Dial', 'Sulekha', 'Website', 'Newspapers', 'Banners', 'Pamphlet', 'Posters', 'Reference', 'Partner', 'Others'];

const STEPS = [
  { icon: BookOpen, label: 'Course Info' },
  { icon: User, label: 'Personal Details' },
  { icon: Phone, label: 'Contact' },
  { icon: GraduationCap, label: 'Education' },
  { icon: Briefcase, label: 'Work Experience' },
  { icon: Globe, label: 'Languages' },
  { icon: MessageSquare, label: 'Preferences' },
  { icon: Users, label: 'References' },
];

export default function EnrollmentForm() {
  const [step, setStep] = useState(0);
  const [partners, setPartners] = useState([]);
  const [counselors, setCounselors] = useState([]);
  const [cohorts, setCohorts] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const source = watch('source');
  const selectedCourse = watch('course_name');
  const selectedBranch = watch('branch');
  const selectedTiming = watch('timing');

  // Derive dynamic options from cohorts
  const courses = [...new Set(cohorts.map(c => c.courseName).filter(Boolean))];
  const branches = [...new Set(cohorts.filter(c => !selectedCourse || c.courseName === selectedCourse).map(c => c.branch).filter(Boolean))];
  const timings = [...new Set(cohorts.filter(c => (!selectedCourse || c.courseName === selectedCourse) && (!selectedBranch || c.branch === selectedBranch)).map(c => c.timing).filter(Boolean))];
  const matchedCohort = cohorts.find(c => c.courseName === selectedCourse && c.branch === selectedBranch && c.timing === selectedTiming);

  // Form-number auto generation
  const [formNo] = useState(() => {
    const d = new Date();
    return `WSA-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`;
  });

  // Education rows
  const [eduRows, setEduRows] = useState([
    { exam: 'Graduation', degree: '', dateOfPassing: '', percentage: '', grade: '' },
    { exam: 'Post Graduation', degree: '', dateOfPassing: '', percentage: '', grade: '' },
    { exam: 'Others', degree: '', dateOfPassing: '', percentage: '', grade: '' },
  ]);

  // Work experience rows
  const [workRows, setWorkRows] = useState([
    { employer: '', designation: '', period: '', duties: '', reasonLeaving: '', yearOfService: '' },
  ]);

  // Languages
  const [languages, setLanguages] = useState([
    { language: 'Tamil', read: false, write: false, speak: false },
    { language: 'English', read: false, write: false, speak: false },
    { language: '', read: false, write: false, speak: false },
  ]);

  // Reference friends
  const [friends, setFriends] = useState([
    { name: '', mobile: '', qualification: '', location: '' },
    { name: '', mobile: '', qualification: '', location: '' },
    { name: '', mobile: '', qualification: '', location: '' },
  ]);

  // Message consent
  const [messageConsent, setMessageConsent] = useState(true);

  useEffect(() => {
    api.get('/cohorts').then(r => setCohorts(r.data)).catch(console.error);
    api.get('/auth/users', { params: { role: 'counselor' } }).then(r => setCounselors(r.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (source === 'Partner') api.get('/partners', { params: { active: true } }).then(r => setPartners(r.data)).catch(console.error);
  }, [source]);

  const updateEdu = (i, field, val) => { setEduRows(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateWork = (i, field, val) => { setWorkRows(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateLang = (i, field, val) => { setLanguages(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateFriend = (i, field, val) => { setFriends(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      const body = {
        ...data,
        enrolment_form_no: formNo,
        education_details: eduRows.filter(r => r.degree),
        work_experience: workRows.filter(r => r.employer),
        languages_known: languages.filter(r => r.language),
        reference_friends: friends.filter(r => r.name),
        message_consent: messageConsent,
        counselor_id: data.counselor_id,
        cohort_id: matchedCohort?.cohortId || null,
        declaration_place: data.declaration_place,
        declaration_date: new Date().toISOString(),
      };
      const res = await api.post('/leads', body);
      toast.success('Student registered successfully! Assessment link sent.');
      navigate(`/leads/${res.data.lead_id}`);
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed'); }
    finally { setSubmitting(false); }
  };

  const nextStep = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  return (
    <div>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg, var(--primary-900), var(--primary))', borderRadius: 'var(--radius-lg)', padding: '24px 32px', marginBottom: 24, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-brand)' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>📋 Student Enrolment Form</h1>
          <p style={{ opacity: 0.85, fontSize: 13 }}>We Shine Academy — Guiding you to get through</p>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600 }}>
          Form #{formNo}
        </div>
      </div>

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, overflowX: 'auto', padding: '0 0 8px' }}>
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => setStep(i)} style={{
            flex: '1', minWidth: 100, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '12px 8px',
            background: i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'white',
            color: i <= step ? 'white' : 'var(--gray-500)', border: `1.5px solid ${i === step ? 'var(--primary)' : i < step ? 'var(--success)' : 'var(--gray-200)'}`,
            borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s', fontSize: 11, fontWeight: 600,
          }}>
            <s.icon size={18} />
            {s.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="card">
          <div className="card-body" style={{ minHeight: 380 }}>

            {/* Step 0: Course Info */}
            {step === 0 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>📚 Course Information</h2>
                {courses.length === 0 && (
                  <div style={{ background: 'var(--warning-light)', border: '1.5px solid var(--warning)', padding: 16, borderRadius: 'var(--radius)', marginBottom: 16, fontSize: 13 }}>
                    ⚠️ <strong>No batches found.</strong> Please create a batch in <strong>Batch Management</strong> first to define available courses, branches, and timings.
                  </div>
                )}
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Course Name *</label>
                    <select className="form-select" {...register('course_name')} onChange={e => { setValue('course_name', e.target.value); setValue('branch', ''); setValue('timing', ''); }}>
                      <option value="">Select Course</option>
                      {courses.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Branch *</label>
                    <select className="form-select" {...register('branch')} disabled={!selectedCourse} onChange={e => { setValue('branch', e.target.value); setValue('timing', ''); }}>
                      <option value="">{selectedCourse ? 'Select Branch' : 'Select course first'}</option>
                      {branches.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Timing *</label>
                    <select className="form-select" {...register('timing')} disabled={!selectedBranch}>
                      <option value="">{selectedBranch ? 'Select Timing' : 'Select branch first'}</option>
                      {timings.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group"><label className="form-label">Assigned Counselor *</label>
                    <select className="form-select" {...register('counselor_id')} required><option value="">Select Counselor</option>{counselors.map(c => <option key={c.userId} value={c.userId}>{c.name}</option>)}</select>
                  </div>
                </div>
                {matchedCohort && (
                  <div style={{ background: 'var(--success-light)', border: '1.5px solid var(--success)', padding: 12, borderRadius: 'var(--radius)', marginTop: 8, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    ✅ <strong>Matched Batch:</strong> {matchedCohort.name} — Starts {new Date(matchedCohort.startDate).toLocaleDateString('en-IN')} ({matchedCohort._count?.enrollments || 0}/{matchedCohort.capacity} seats filled)
                  </div>
                )}
                {selectedCourse && selectedBranch && selectedTiming && !matchedCohort && (
                  <div style={{ background: 'var(--warning-light)', border: '1.5px solid var(--warning)', padding: 12, borderRadius: 'var(--radius)', marginTop: 8, fontSize: 13 }}>
                    ⚠️ No matching batch found for this combination. Student will be registered but not assigned to a batch.
                  </div>
                )}
              </div>
            )}

            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>👤 Personal Details</h2>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name *</label>
                    <input className={`form-input ${errors.name ? 'error' : ''}`} {...register('name')} placeholder="Enter student full name" />
                    {errors.name && <div className="form-error">{errors.name.message}</div>}
                  </div>
                  <div className="form-group"><label className="form-label">Father's Name</label>
                    <input className="form-input" {...register('father_name')} placeholder="Father's full name" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Father's Occupation</label>
                    <input className="form-input" {...register('father_occupation')} placeholder="Occupation" />
                  </div>
                  <div className="form-group"><label className="form-label">Date of Birth</label>
                    <input className="form-input" type="date" {...register('date_of_birth')} />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Address</label>
                  <textarea className="form-textarea" {...register('address')} rows={2} placeholder="Full address" />
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">State</label>
                    <select className="form-select" {...register('state')}><option value="">Select</option>{STATES.map(s => <option key={s}>{s}</option>)}</select>
                  </div>
                  <div className="form-group"><label className="form-label">City</label>
                    <input className="form-input" {...register('city')} placeholder="City" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Pin Code</label>
                    <input className="form-input" {...register('pin_code')} placeholder="600044" maxLength={6} />
                  </div>
                  <div className="form-group"><label className="form-label">Age</label>
                    <input className="form-input" type="number" {...register('age')} placeholder="Age" />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Gender</label>
                    <div className="radio-group">
                      {['Male', 'Female'].map(g => (
                        <label key={g} className={`radio-option ${watch('gender') === g ? 'selected' : ''}`}>
                          <input type="radio" value={g} {...register('gender')} style={{ display: 'none' }} />
                          {g === 'Male' ? '♂️' : '♀️'} {g}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="form-group"><label className="form-label">Category</label>
                    <div className="radio-group" style={{ flexWrap: 'wrap' }}>
                      {CATEGORIES.map(c => (
                        <label key={c} className={`radio-option ${watch('category') === c ? 'selected' : ''}`} style={{ minWidth: 60, textAlign: 'center', padding: '8px 12px' }}>
                          <input type="radio" value={c} {...register('category')} style={{ display: 'none' }} />
                          {c}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Contact Details */}
            {step === 2 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>📞 Contact Details</h2>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Mobile Number *</label>
                    <input className={`form-input ${errors.mobile ? 'error' : ''}`} {...register('mobile')} placeholder="10 digit mobile number" />
                    {errors.mobile && <div className="form-error">{errors.mobile.message}</div>}
                  </div>
                  <div className="form-group"><label className="form-label">Alternate Mobile</label>
                    <input className="form-input" {...register('alternate_mobile')} placeholder="Alternate number" />
                  </div>
                </div>
                <div className="form-group"><label className="form-label">Email ID</label>
                  <input className="form-input" type="email" {...register('email')} placeholder="student@email.com" />
                </div>
              </div>
            )}

            {/* Step 3: Education */}
            {step === 3 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>🎓 Educational Qualification</h2>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Exam</th><th>Degree / Subject</th><th>Date of Passing</th><th>% Marks</th><th>Grade</th></tr></thead>
                    <tbody>
                      {eduRows.map((r, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, fontSize: 13 }}>{r.exam}</td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={r.degree} onChange={e => updateEdu(i, 'degree', e.target.value)} placeholder="e.g. B.Com" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={r.dateOfPassing} onChange={e => updateEdu(i, 'dateOfPassing', e.target.value)} placeholder="2023" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={r.percentage} onChange={e => updateEdu(i, 'percentage', e.target.value)} placeholder="78%" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={r.grade} onChange={e => updateEdu(i, 'grade', e.target.value)} placeholder="First" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Step 4: Work Experience */}
            {step === 4 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>💼 Work Experience <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)' }}>(Start from present employer)</span></h2>
                {workRows.map((r, i) => (
                  <div key={i} style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)', marginBottom: 12, border: '1px solid var(--gray-200)' }}>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">Employer</label><input className="form-input" value={r.employer} onChange={e => updateWork(i, 'employer', e.target.value)} placeholder="Company name" /></div>
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">Designation</label><input className="form-input" value={r.designation} onChange={e => updateWork(i, 'designation', e.target.value)} placeholder="Role" /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">Period of Service</label><input className="form-input" value={r.period} onChange={e => updateWork(i, 'period', e.target.value)} placeholder="2 years" /></div>
                      <div className="form-group" style={{ marginBottom: 8 }}><label className="form-label">Reason for Leaving</label><input className="form-input" value={r.reasonLeaving} onChange={e => updateWork(i, 'reasonLeaving', e.target.value)} placeholder="Career growth" /></div>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Nature of Duties</label><input className="form-input" value={r.duties} onChange={e => updateWork(i, 'duties', e.target.value)} placeholder="Describe duties" /></div>
                  </div>
                ))}
                <button type="button" className="btn btn-sm btn-secondary" onClick={() => setWorkRows(p => [...p, { employer: '', designation: '', period: '', duties: '', reasonLeaving: '', yearOfService: '' }])}>+ Add More</button>
              </div>
            )}

            {/* Step 5: Languages */}
            {step === 5 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>🌐 Languages Known</h2>
                <div className="table-container">
                  <table>
                    <thead><tr><th>Language</th><th style={{ textAlign: 'center' }}>Read</th><th style={{ textAlign: 'center' }}>Write</th><th style={{ textAlign: 'center' }}>Speak</th></tr></thead>
                    <tbody>
                      {languages.map((l, i) => (
                        <tr key={i}>
                          <td>{i < 2 ? <span style={{ fontWeight: 600 }}>{l.language}</span> : <input className="form-input" style={{ padding: '6px 10px' }} value={l.language} onChange={e => updateLang(i, 'language', e.target.value)} placeholder="Other language" />}</td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" checked={l.read} onChange={e => updateLang(i, 'read', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} /></td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" checked={l.write} onChange={e => updateLang(i, 'write', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} /></td>
                          <td style={{ textAlign: 'center' }}><input type="checkbox" checked={l.speak} onChange={e => updateLang(i, 'speak', e.target.checked)} style={{ width: 18, height: 18, accentColor: 'var(--primary)' }} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn btn-sm btn-secondary" style={{ marginTop: 12 }} onClick={() => setLanguages(p => [...p, { language: '', read: false, write: false, speak: false }])}>+ Add Language</button>
              </div>
            )}

            {/* Step 6: Preferences (Source + Message + Declaration) */}
            {step === 6 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>📩 Preferences & Declaration</h2>

                <div className="form-group">
                  <label className="form-label">How did you know about We Shine Academy? *</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {SOURCES.map(s => (
                      <label key={s} className={`radio-option ${watch('source') === s ? 'selected' : ''}`} style={{ padding: '8px 14px', fontSize: 13 }}>
                        <input type="radio" value={s} {...register('source')} />{s}
                      </label>
                    ))}
                  </div>
                </div>

                {source === 'Partner' && (
                  <div className="form-group">
                    <label className="form-label">Partner Name</label>
                    <select className="form-select" {...register('partner_id')}><option value="">Select partner</option>{partners.map(p => <option key={p.partnerId} value={p.partnerId}>{p.name}</option>)}</select>
                  </div>
                )}

                <div style={{ padding: 16, background: 'var(--primary-50)', borderRadius: 'var(--radius)', border: '1.5px solid var(--primary-200)', marginBottom: 20 }}>
                  <label className="form-label" style={{ marginBottom: 8 }}>Would you like to receive messages & emails from our Academy?</label>
                  <div className="radio-group">
                    <label className={`radio-option ${messageConsent === true ? 'selected' : ''}`} onClick={() => setMessageConsent(true)}><input type="radio" readOnly checked={messageConsent === true} />✅ Yes, I Like it</label>
                    <label className={`radio-option ${messageConsent === false ? 'selected' : ''}`} onClick={() => setMessageConsent(false)}><input type="radio" readOnly checked={messageConsent === false} />❌ No, I Don't Like it</label>
                  </div>
                </div>

                <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 'var(--radius)', border: '1px solid var(--gray-200)' }}>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 12 }}><strong>Declaration:</strong> I hereby declare that all statements made in this application are true, complete and correct to the best of my knowledge.</p>
                  <div className="form-row">
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Place</label>
                      <input className="form-input" {...register('declaration_place')} placeholder="Chennai" />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}><label className="form-label">Date</label>
                      <input className="form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly style={{ background: 'var(--gray-100)' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 7: Reference Friends */}
            {step === 7 && (
              <div className="animate-in">
                <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20, color: 'var(--gray-800)' }}>👥 Reference Friends <span style={{ fontSize: 12, fontWeight: 400, color: 'var(--gray-400)' }}>(Refer your friends for this course)</span></h2>
                <div className="table-container">
                  <table>
                    <thead><tr><th>#</th><th>Friend Name</th><th>Mobile Number</th><th>Qualification</th><th>Location</th></tr></thead>
                    <tbody>
                      {friends.map((f, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, width: 40 }}>{i + 1}</td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={f.name} onChange={e => updateFriend(i, 'name', e.target.value)} placeholder="Name" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={f.mobile} onChange={e => updateFriend(i, 'mobile', e.target.value)} placeholder="Mobile" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={f.qualification} onChange={e => updateFriend(i, 'qualification', e.target.value)} placeholder="B.Com" /></td>
                          <td><input className="form-input" style={{ padding: '6px 10px', fontSize: 13 }} value={f.location} onChange={e => updateFriend(i, 'location', e.target.value)} placeholder="Chennai" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-100)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button type="button" className="btn btn-secondary" onClick={prevStep} disabled={step === 0}>
              <ChevronLeft size={16} /> Previous
            </button>
            <span style={{ fontSize: 13, color: 'var(--gray-400)', fontWeight: 500 }}>Step {step + 1} of {STEPS.length}</span>
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn btn-primary" onClick={nextStep}>
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button type="submit" className="btn btn-success btn-lg" disabled={submitting}>
                {submitting ? <span className="spinner" /> : <><CheckCircle size={18} /> Register Student</>}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
