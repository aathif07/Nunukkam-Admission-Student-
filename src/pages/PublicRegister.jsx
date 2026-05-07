import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { UserPlus, ChevronRight, ChevronLeft, BookOpen, User, Phone, GraduationCap, Briefcase, Globe, MessageSquare, Users, CheckCircle } from 'lucide-react';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api' });
const schema = yup.object({ name: yup.string().min(3).max(100).required('Name is required'), mobile: yup.string().matches(/^\d{10}$/, 'Must be 10 digits').required('Mobile is required') });
const CATEGORIES = ['BC', 'MBC', 'SC', 'ST', 'GEN'];
const STATES = ['Tamil Nadu', 'Kerala', 'Karnataka', 'Andhra Pradesh', 'Telangana', 'Maharashtra', 'Delhi', 'Other'];
const SOURCES = ['Just Dial', 'Sulekha', 'Website', 'Newspapers', 'Banners', 'Pamphlet', 'Posters', 'Reference', 'Partner', 'Others'];
const STEPS = [
  { icon: BookOpen, label: 'Course Info' }, { icon: User, label: 'Personal Details' },
  { icon: Phone, label: 'Contact' }, { icon: GraduationCap, label: 'Education' },
  { icon: Briefcase, label: 'Work Experience' }, { icon: Globe, label: 'Languages' },
  { icon: MessageSquare, label: 'Preferences' }, { icon: Users, label: 'References' },
];

export default function PublicRegister() {
  const [step, setStep] = useState(0);
  const [cohorts, setCohorts] = useState([]);
  const [partners, setPartners] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({ resolver: yupResolver(schema) });
  const source = watch('source');
  const selectedCourse = watch('course_name');
  const selectedBranch = watch('branch');
  const selectedTiming = watch('timing');

  const courses = [...new Set(cohorts.map(c => c.courseName).filter(Boolean))];
  const branches = [...new Set(cohorts.filter(c => !selectedCourse || c.courseName === selectedCourse).map(c => c.branch).filter(Boolean))];
  const timings = [...new Set(cohorts.filter(c => (!selectedCourse || c.courseName === selectedCourse) && (!selectedBranch || c.branch === selectedBranch)).map(c => c.timing).filter(Boolean))];
  const matchedCohort = cohorts.find(c => c.courseName === selectedCourse && c.branch === selectedBranch && c.timing === selectedTiming);

  const [formNo] = useState(() => { const d = new Date(); return `WSA-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}-${Math.floor(1000+Math.random()*9000)}`; });
  const [eduRows, setEduRows] = useState([{ exam: 'Graduation', degree: '', dateOfPassing: '', percentage: '', grade: '' }, { exam: 'Post Graduation', degree: '', dateOfPassing: '', percentage: '', grade: '' }, { exam: 'Others', degree: '', dateOfPassing: '', percentage: '', grade: '' }]);
  const [workRows, setWorkRows] = useState([{ employer: '', designation: '', period: '', duties: '', reasonLeaving: '', yearOfService: '' }]);
  const [languages, setLanguages] = useState([{ language: 'Tamil', read: false, write: false, speak: false }, { language: 'English', read: false, write: false, speak: false }, { language: '', read: false, write: false, speak: false }]);
  const [friends, setFriends] = useState([{ name: '', mobile: '', qualification: '', location: '' }, { name: '', mobile: '', qualification: '', location: '' }, { name: '', mobile: '', qualification: '', location: '' }]);
  const [messageConsent, setMessageConsent] = useState(true);

  useEffect(() => {
    API.get('/public/cohorts').then(r => setCohorts(r.data)).catch(console.error);
  }, []);
  useEffect(() => {
    if (source === 'Partner') API.get('/public/partners').then(r => setPartners(r.data)).catch(console.error);
  }, [source]);

  const updateEdu = (i, field, val) => { setEduRows(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateWork = (i, field, val) => { setWorkRows(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateLang = (i, field, val) => { setLanguages(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };
  const updateFriend = (i, field, val) => { setFriends(prev => { const c = [...prev]; c[i] = { ...c[i], [field]: val }; return c; }); };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      await API.post('/public/register', {
        ...data, enrolment_form_no: formNo, education_details: eduRows.filter(r => r.degree),
        work_experience: workRows.filter(r => r.employer), languages_known: languages.filter(r => r.language),
        reference_friends: friends.filter(r => r.name), message_consent: messageConsent,
        declaration_place: data.declaration_place, declaration_date: new Date().toISOString(),
      });
      setSubmitted(true);
      toast.success('Registration submitted successfully!');
    } catch (err) { toast.error(err.response?.data?.error || 'Registration failed. Please try again.'); }
    finally { setSubmitting(false); }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #f8f4ff 0%, #ede8ff 100%)', padding: 20 }}>
        <Toaster position="top-center" />
        <div style={{ textAlign: 'center', maxWidth: 500, background: 'white', padding: 48, borderRadius: 24, boxShadow: '0 20px 60px rgba(106,28,154,0.12)' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #16a34a, #22c55e)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}><CheckCircle size={40} color="white" /></div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1f2937', marginBottom: 12 }}>Registration Successful! 🎉</h1>
          <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.6, marginBottom: 24 }}>Thank you for registering with <strong>Nunukkam Academy</strong>. Our counselor will contact you shortly to guide you through the next steps.</p>
          <div style={{ background: '#f3f4f6', padding: 16, borderRadius: 12, fontSize: 13, color: '#4b5563' }}>
            <strong>Reference No:</strong> {formNo}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f4ff 0%, #ede8ff 100%)', padding: '24px 16px' }}>
      <Toaster position="top-center" />
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, background: 'white', padding: '12px 28px', borderRadius: 60, boxShadow: '0 4px 20px rgba(106,28,154,0.1)', marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #6A1C9A, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><UserPlus size={18} color="white" /></div>
            <span style={{ fontSize: 18, fontWeight: 800, color: '#6A1C9A' }}>Nunukkam Academy</span>
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: '#1f2937', marginBottom: 4 }}>Student Registration Form</h1>
          <p style={{ fontSize: 14, color: '#6b7280' }}>Complete all steps to register for your desired program</p>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '0 8px' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, cursor: 'pointer' }} onClick={() => setStep(i)}>
              <div style={{ height: 4, borderRadius: 4, background: i <= step ? 'linear-gradient(90deg, #6A1C9A, #8B5CF6)' : '#e5e7eb', transition: 'all 0.3s' }} />
              <div style={{ fontSize: 10, fontWeight: 600, color: i <= step ? '#6A1C9A' : '#9ca3af', textAlign: 'center', marginTop: 6, display: 'none' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ background: 'white', borderRadius: 20, boxShadow: '0 8px 40px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '28px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', gap: 12 }}>
              {(() => { const Icon = STEPS[step].icon; return <div style={{ width: 40, height: 40, borderRadius: 12, background: 'linear-gradient(135deg, #6A1C9A, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon size={20} color="white" /></div>; })()}
              <div><h2 style={{ fontSize: 18, fontWeight: 700, color: '#1f2937', margin: 0 }}>{STEPS[step].label}</h2><p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>Step {step + 1} of {STEPS.length}</p></div>
            </div>
            <div style={{ padding: '28px 32px', minHeight: 320 }}>

              {/* Step 0: Course */}
              {step === 0 && (<div className="animate-in">
                {courses.length === 0 && <div style={{ background: '#fef9c3', border: '1px solid #fbbf24', padding: 12, borderRadius: 10, marginBottom: 16, fontSize: 13 }}>⚠️ No courses available yet. Contact the academy for assistance.</div>}
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Course Name *</label>
                    <select className="form-select" {...register('course_name')} onChange={e => { setValue('course_name', e.target.value); setValue('branch', ''); setValue('timing', ''); }}><option value="">Select Course</option>{courses.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  </div>
                  <div className="form-group"><label className="form-label">Branch *</label>
                    <select className="form-select" {...register('branch')} disabled={!selectedCourse} onChange={e => { setValue('branch', e.target.value); setValue('timing', ''); }}><option value="">{selectedCourse ? 'Select Branch' : 'Select course first'}</option>{branches.map(b => <option key={b} value={b}>{b}</option>)}</select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Timing *</label>
                    <select className="form-select" {...register('timing')} disabled={!selectedBranch}><option value="">{selectedBranch ? 'Select Timing' : 'Select branch first'}</option>{timings.map(t => <option key={t} value={t}>{t}</option>)}</select>
                  </div>
                  <div className="form-group" />
                </div>
                {matchedCohort && <div style={{ background: '#dcfce7', border: '1px solid #22c55e', padding: 12, borderRadius: 10, marginTop: 8, fontSize: 13 }}>✅ <strong>Batch:</strong> {matchedCohort.name} — Starts {new Date(matchedCohort.startDate).toLocaleDateString('en-IN')}</div>}
              </div>)}

              {/* Step 1: Personal */}
              {step === 1 && (<div className="animate-in">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" {...register('name')} placeholder="Enter your full name" />{errors.name && <span className="form-error">{errors.name.message}</span>}</div>
                  <div className="form-group"><label className="form-label">Father's Name</label><input className="form-input" {...register('father_name')} placeholder="Father's name" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Father's Occupation</label><input className="form-input" {...register('father_occupation')} /></div>
                  <div className="form-group"><label className="form-label">Date of Birth</label><input type="date" className="form-input" {...register('date_of_birth')} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Gender</label><select className="form-select" {...register('gender')}><option value="">Select</option><option>Male</option><option>Female</option><option>Other</option></select></div>
                  <div className="form-group"><label className="form-label">Category</label><select className="form-select" {...register('category')}><option value="">Select</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></div>
                </div>
              </div>)}

              {/* Step 2: Contact */}
              {step === 2 && (<div className="animate-in">
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Mobile Number *</label><input className="form-input" {...register('mobile')} placeholder="10-digit mobile" />{errors.mobile && <span className="form-error">{errors.mobile.message}</span>}</div>
                  <div className="form-group"><label className="form-label">Alternate Mobile</label><input className="form-input" {...register('alternate_mobile')} /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">Email</label><input type="email" className="form-input" {...register('email')} placeholder="your@email.com" /></div>
                  <div className="form-group"><label className="form-label">City</label><input className="form-input" {...register('city')} placeholder="Chennai" /></div>
                </div>
                <div className="form-row">
                  <div className="form-group"><label className="form-label">State</label><select className="form-select" {...register('state')}><option value="">Select</option>{STATES.map(s => <option key={s}>{s}</option>)}</select></div>
                  <div className="form-group"><label className="form-label">Pin Code</label><input className="form-input" {...register('pin_code')} placeholder="600045" /></div>
                </div>
                <div className="form-group"><label className="form-label">Full Address</label><textarea className="form-input" {...register('address')} rows={2} placeholder="Door No, Street, Area..." /></div>
              </div>)}

              {/* Step 3: Education */}
              {step === 3 && (<div className="animate-in">
                <div className="table-container"><table><thead><tr><th>Exam</th><th>Degree / Subject</th><th>Year</th><th>%</th><th>Grade</th></tr></thead>
                <tbody>{eduRows.map((r, i) => (<tr key={i}><td style={{fontWeight:600,fontSize:12}}>{r.exam}</td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={r.degree} onChange={e => updateEdu(i,'degree',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13,width:80}} value={r.dateOfPassing} onChange={e => updateEdu(i,'dateOfPassing',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13,width:60}} value={r.percentage} onChange={e => updateEdu(i,'percentage',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13,width:70}} value={r.grade} onChange={e => updateEdu(i,'grade',e.target.value)} /></td></tr>))}</tbody></table></div>
              </div>)}

              {/* Step 4: Work */}
              {step === 4 && (<div className="animate-in">
                {workRows.map((w, i) => (<div key={i} style={{padding:16,background:'#f9fafb',borderRadius:12,marginBottom:12}}>
                  <div className="form-row"><div className="form-group"><label className="form-label">Employer</label><input className="form-input" value={w.employer} onChange={e => updateWork(i,'employer',e.target.value)} /></div><div className="form-group"><label className="form-label">Designation</label><input className="form-input" value={w.designation} onChange={e => updateWork(i,'designation',e.target.value)} /></div></div>
                  <div className="form-row"><div className="form-group"><label className="form-label">Period</label><input className="form-input" value={w.period} onChange={e => updateWork(i,'period',e.target.value)} /></div><div className="form-group"><label className="form-label">Duties</label><input className="form-input" value={w.duties} onChange={e => updateWork(i,'duties',e.target.value)} /></div></div>
                </div>))}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setWorkRows(p => [...p, {employer:'',designation:'',period:'',duties:'',reasonLeaving:'',yearOfService:''}])}>+ Add More</button>
              </div>)}

              {/* Step 5: Languages */}
              {step === 5 && (<div className="animate-in">
                <div className="table-container"><table><thead><tr><th>Language</th><th>Read</th><th>Write</th><th>Speak</th></tr></thead>
                <tbody>{languages.map((l, i) => (<tr key={i}><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={l.language} onChange={e => updateLang(i,'language',e.target.value)} placeholder="Language" /></td>
                  <td style={{textAlign:'center'}}><input type="checkbox" checked={l.read} onChange={e => updateLang(i,'read',e.target.checked)} /></td>
                  <td style={{textAlign:'center'}}><input type="checkbox" checked={l.write} onChange={e => updateLang(i,'write',e.target.checked)} /></td>
                  <td style={{textAlign:'center'}}><input type="checkbox" checked={l.speak} onChange={e => updateLang(i,'speak',e.target.checked)} /></td></tr>))}</tbody></table></div>
              </div>)}

              {/* Step 6: Preferences */}
              {step === 6 && (<div className="animate-in">
                <div className="form-group"><label className="form-label">How did you know about us? *</label>
                  <div style={{display:'flex',flexWrap:'wrap',gap:8}}>{SOURCES.map(s => (<label key={s} className={`radio-option ${watch('source')===s?'selected':''}`} style={{padding:'8px 14px',fontSize:13}}><input type="radio" value={s} {...register('source')} />{s}</label>))}</div>
                </div>
                {source === 'Partner' && <div className="form-group"><label className="form-label">Partner</label><select className="form-select" {...register('partner_id')}><option value="">Select</option>{partners.map(p => <option key={p.partnerId} value={p.partnerId}>{p.name}</option>)}</select></div>}
                <div style={{padding:16,background:'#faf5ff',borderRadius:12,border:'1px solid #e9d5ff',marginBottom:16}}>
                  <label className="form-label" style={{marginBottom:8}}>Would you like to receive messages & emails?</label>
                  <div className="radio-group"><label className={`radio-option ${messageConsent===true?'selected':''}`} onClick={() => setMessageConsent(true)}><input type="radio" readOnly checked={messageConsent===true} />✅ Yes</label><label className={`radio-option ${messageConsent===false?'selected':''}`} onClick={() => setMessageConsent(false)}><input type="radio" readOnly checked={messageConsent===false} />❌ No</label></div>
                </div>
                <div style={{padding:16,background:'#f9fafb',borderRadius:12,border:'1px solid #e5e7eb'}}>
                  <p style={{fontSize:13,color:'#4b5563',marginBottom:12}}><strong>Declaration:</strong> I hereby declare that all statements made in this application are true, complete and correct to the best of my knowledge.</p>
                  <div className="form-row"><div className="form-group" style={{marginBottom:0}}><label className="form-label">Place</label><input className="form-input" {...register('declaration_place')} placeholder="Chennai" /></div><div className="form-group" style={{marginBottom:0}}><label className="form-label">Date</label><input className="form-input" type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly style={{background:'#f3f4f6'}} /></div></div>
                </div>
              </div>)}

              {/* Step 7: References */}
              {step === 7 && (<div className="animate-in">
                <p style={{fontSize:13,color:'#6b7280',marginBottom:16}}>Refer friends who might be interested (optional)</p>
                <div className="table-container"><table><thead><tr><th>#</th><th>Name</th><th>Mobile</th><th>Qualification</th><th>Location</th></tr></thead>
                <tbody>{friends.map((f, i) => (<tr key={i}><td style={{fontWeight:600,width:40}}>{i+1}</td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={f.name} onChange={e => updateFriend(i,'name',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={f.mobile} onChange={e => updateFriend(i,'mobile',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={f.qualification} onChange={e => updateFriend(i,'qualification',e.target.value)} /></td><td><input className="form-input" style={{padding:'6px 10px',fontSize:13}} value={f.location} onChange={e => updateFriend(i,'location',e.target.value)} /></td></tr>))}</tbody></table></div>
              </div>)}
            </div>

            {/* Navigation */}
            <div style={{ padding: '16px 32px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(s => Math.max(s-1,0))} disabled={step===0}><ChevronLeft size={16} /> Previous</button>
              <span style={{ fontSize: 13, color: '#9ca3af' }}>Step {step+1} of {STEPS.length}</span>
              {step < STEPS.length - 1 ? (
                <button type="button" className="btn btn-primary" onClick={() => setStep(s => Math.min(s+1,STEPS.length-1))}>Next <ChevronRight size={16} /></button>
              ) : (
                <button type="submit" className="btn btn-primary btn-lg" disabled={submitting} style={{ background: 'linear-gradient(135deg, #6A1C9A, #8B5CF6)', borderRadius: 14 }}>
                  {submitting ? <span className="spinner" /> : <><CheckCircle size={18} /> Submit Registration</>}
                </button>
              )}
            </div>
          </div>
        </form>
        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 12, color: '#9ca3af' }}>© {new Date().getFullYear()} Nunukkam Academy — Powered by EIS Platform</p>
      </div>
    </div>
  );
}
