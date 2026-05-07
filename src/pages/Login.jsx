import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="public-page">
      <div className="public-card" style={{ maxWidth: 420 }}>
        <div className="public-header">
          <h1>Nunukkam EIS</h1>
          <p>Employability Intelligence Stack</p>
        </div>
        <div className="public-body">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="animate-in" style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 14, marginBottom: 20, fontSize: 13, fontWeight: 600, border: '1px solid var(--danger)' }}>
                 ⚠️ {error}
              </div>
            )}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Email Address</label>
              <input className="form-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@weshine.com" required style={{ height: 50, borderRadius: 12 }} />
            </div>
            <div className="form-group" style={{ marginBottom: 32 }}>
              <label className="form-label" style={{ fontWeight: 700 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required style={{ height: 50, borderRadius: 12, paddingRight: 50 }} />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', padding: 8 }}>
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary btn-lg" style={{ width: '100%', height: 54, borderRadius: 14, fontWeight: 800, background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))' }} disabled={loading}>
              {loading ? <span className="spinner" /> : <><LogIn size={20} /> Sign In to Command Center</>}
            </button>
          </form>
          <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: 'var(--gray-500)', fontWeight: 500 }}>
            System Access: <span style={{ color: 'var(--primary)', fontWeight: 700 }}>admin@weshine.com</span> / <span style={{ color: 'var(--primary)', fontWeight: 700 }}>password123</span>
          </p>
        </div>
      </div>
    </div>
  );
}
