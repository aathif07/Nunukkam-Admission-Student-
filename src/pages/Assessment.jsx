import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, Zap, Award, BookOpen, Clock, AlertCircle } from 'lucide-react';

const API = 'http://localhost:4000/api';
const LIKERT = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Always'];

export default function Assessment() {
  const { lead_id } = useParams();
  const [data, setData] = useState(null);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [band, setBand] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`${API}/assess/${lead_id}`)
      .then(r => { 
        setData(r.data); 
        const init = {}; 
        r.data.sections.forEach((s, i) => { init[i] = new Array(s.questions.length).fill(-1); }); 
        setAnswers(init); 
      })
      .catch(err => { 
        setError(err.response?.data?.error || 'Assessment not available'); 
        if (err.response?.data?.band) setBand(err.response.data.band); 
      });
  }, [lead_id]);

  if (error) return (
    <div className="public-page" style={{ background: 'linear-gradient(135deg, #4A148C 0%, #6B1EA2 100%)' }}>
      <div className="public-card" style={{ maxWidth: 480, textAlign: 'center', border: 'none' }}>
        <div className="public-header" style={{ padding: '40px 32px' }}>
          <AlertCircle size={48} style={{ marginBottom: 16, opacity: 0.8 }} />
          <h1 style={{ fontSize: 24 }}>Assessment Status</h1>
        </div>
        <div className="public-body" style={{ padding: '40px 32px' }}>
          <p style={{ color: 'var(--gray-600)', marginBottom: 24, fontSize: 16, lineHeight: 1.6 }}>{error}</p>
          {band && (
            <div style={{ background: 'var(--primary-50)', padding: 24, borderRadius: 20 }}>
              <div style={{ fontSize: 12, textTransform: 'uppercase', color: 'var(--primary)', fontWeight: 700, marginBottom: 8 }}>Final Result</div>
              <span className={`badge badge-${band.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 18, padding: '10px 24px' }}>{band}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!data) return (
    <div className="public-page" style={{ background: 'var(--primary-900)' }}>
      <div style={{ textAlign: 'center', color: 'white' }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 4, marginBottom: 16 }} />
        <p style={{ fontWeight: 600, letterSpacing: 1 }}>LOADING ASSESSMENT...</p>
      </div>
    </div>
  );

  if (done) return (
    <div className="public-page" style={{ background: 'linear-gradient(135deg, #1A0033 0%, #4A148C 100%)' }}>
      <div className="public-card" style={{ maxWidth: 500, textAlign: 'center', border: 'none' }}>
        <div className="public-header" style={{ background: 'transparent', color: 'var(--primary-900)', padding: '60px 32px 20px' }}>
          <div style={{ width: 80, height: 80, background: 'var(--primary-50)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
            <CheckCircle size={40} color="var(--primary)" />
          </div>
          <h1 style={{ fontSize: 28, color: 'var(--primary-900)' }}>Great Job, {data.studentName}!</h1>
        </div>
        <div className="public-body" style={{ padding: '0 40px 60px' }}>
          <p style={{ fontSize: 16, color: 'var(--gray-600)', marginBottom: 32, lineHeight: 1.6 }}>
            Your Career Readiness Assessment has been submitted successfully. Our lead counselor will review your profile and contact you within 24 hours.
          </p>
          {band && (
            <div style={{ background: 'var(--primary-50)', padding: 24, borderRadius: 24 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: 12 }}>Assessed Band</div>
              <span className={`badge badge-${band.toLowerCase().replace(/ /g, '-')}`} style={{ fontSize: 20, padding: '12px 32px', boxShadow: '0 10px 20px rgba(107, 30, 162, 0.2)' }}>{band}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // START SCREEN
  if (!started) return (
    <div className="public-page" style={{ background: 'linear-gradient(135deg, #4A148C 0%, #6B1EA2 100%)' }}>
      <div className="public-card" style={{ maxWidth: 540, overflow: 'hidden' }}>
        <div className="public-header" style={{ padding: '48px 32px', textAlign: 'center' }}>
          <div style={{ background: 'rgba(255,255,255,0.1)', padding: '12px 20px', borderRadius: 100, display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <ShieldCheck size={18} /> <span style={{ fontSize: 13, fontWeight: 600 }}>Official Assessment Platform</span>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8 }}>Hi {data.studentName}!</h1>
          <p style={{ opacity: 0.9 }}>Welcome to the Career Readiness Index (CRI) screening.</p>
        </div>
        <div className="public-body" style={{ padding: '40px 32px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
            <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 16 }}>
              <Clock size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>5-7 Mins</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Estimated time</div>
            </div>
            <div style={{ padding: 16, background: 'var(--gray-50)', borderRadius: 16 }}>
              <BookOpen size={20} color="var(--primary)" style={{ marginBottom: 8 }} />
              <div style={{ fontWeight: 700, fontSize: 14 }}>{data.sections.length} Sections</div>
              <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>Core modules</div>
            </div>
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gray-800)', marginBottom: 12 }}>Why take this assessment?</div>
            <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['Understand your career maturity', 'Get a detailed BFSI aptitude report', 'Unlock personalized counseling'].map((text, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 14, color: 'var(--gray-600)' }}>
                  <Zap size={16} color="var(--primary)" /> {text}
                </li>
              ))}
            </ul>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%', height: 60, fontSize: 18, background: 'var(--gradient)', color: 'white', boxShadow: '0 15px 30px rgba(107, 30, 162, 0.3)' }} onClick={() => setStarted(true)}>
            Start Assessment <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const section = data.sections[step];
  const currentAnswers = answers[step] || [];
  const allAnswered = currentAnswers.every(a => a >= 0);
  const isLast = step === data.sections.length - 1;

  const setAnswer = (qi, val) => { 
    setAnswers(prev => { 
      const copy = { ...prev }; 
      copy[step] = [...copy[step]]; 
      copy[step][qi] = val; 
      return copy; 
    }); 
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const body = {};
    data.sections.forEach((s, i) => { body[`section${i + 1}_answers`] = answers[i]; });
    try {
      const res = await axios.post(`${API}/assess/${lead_id}/submit`, body);
      setBand(res.data.band); setDone(true);
    } catch (err) { alert(err.response?.data?.error || 'Submit failed'); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="public-page" style={{ background: '#f8fafc' }}>
      <div className="public-card" style={{ maxWidth: 700, border: 'none', boxShadow: '0 40px 80px -20px rgba(0,0,0,0.1)' }}>
        <div style={{ height: 6, background: 'var(--gray-100)', width: '100%' }}>
          <div style={{ height: '100%', background: 'var(--primary)', width: `${((step + 1) / data.sections.length) * 100}%`, transition: 'width 0.5s ease' }} />
        </div>
        
        <div className="public-body" style={{ padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: 1.5, background: 'var(--primary-50)', padding: '4px 12px', borderRadius: 100 }}>Section {step + 1} of {data.sections.length}</span>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--gray-900)', marginTop: 8 }}>{section.title}</h2>
            </div>
            <Award size={32} color="var(--primary-100)" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {section.questions.map((q, qi) => (
              <div key={qi} className="animate-in" style={{ animationDelay: `${qi * 0.1}s` }}>
                <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 15, color: 'var(--gray-800)', lineHeight: 1.5 }}>
                  {qi + 1}. {q.text}
                </div>
                
                {q.type === 'likert' ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 }}>
                    {LIKERT.map((l, li) => (
                      <div key={li} 
                        className={`likert-option ${currentAnswers[qi] === li ? 'selected' : ''}`} 
                        onClick={() => setAnswer(qi, li)}
                        style={{ height: 'auto', padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: 4, background: currentAnswers[qi] === li ? 'var(--primary)' : 'white' }}
                      >
                        <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${currentAnswers[qi] === li ? 'white' : 'var(--gray-300)'}`, background: currentAnswers[qi] === li ? 'white' : 'transparent', marginBottom: 4 }} />
                        {l}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {q.options.map((o, oi) => {
                      const score = oi === 0 ? 4 : oi === 1 ? 3 : oi === 2 ? 2 : 1;
                      const active = currentAnswers[qi] === score;
                      return (
                        <div key={oi} 
                          className={`radio-option ${active ? 'selected' : ''}`} 
                          onClick={() => setAnswer(qi, score)} 
                          style={{ padding: '16px 20px', borderRadius: 16, background: active ? 'var(--primary-50)' : 'white', borderColor: active ? 'var(--primary)' : 'var(--gray-200)' }}
                        >
                          <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${active ? 'var(--primary)' : 'var(--gray-300)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {active && <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--primary)' }} />}
                          </div>
                          <span style={{ fontWeight: active ? 700 : 500, fontSize: 14 }}>{o}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 48, paddingTop: 32, borderTop: '1px solid var(--gray-100)' }}>
            <button className="btn btn-secondary btn-lg" onClick={() => setStep(s => s - 1)} disabled={step === 0} style={{ padding: '12px 24px' }}><ArrowLeft size={18} /> Back</button>
            {isLast ? (
              <button className="btn btn-primary btn-lg" onClick={handleSubmit} disabled={!allAnswered || submitting} style={{ padding: '12px 40px', background: 'var(--gradient)', color: 'white', boxShadow: '0 10px 20px rgba(107, 30, 162, 0.2)' }}>
                {submitting ? <span className="spinner" /> : <><CheckCircle size={18} /> Finish Assessment</>}
              </button>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={() => { setStep(s => s + 1); window.scrollTo(0, 0); }} disabled={!allAnswered} style={{ padding: '12px 40px', background: 'var(--gradient)', color: 'white', boxShadow: '0 10px 20px rgba(107, 30, 162, 0.2)' }}>
                Next Section <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
