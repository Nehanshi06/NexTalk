import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/${isRegister ? 'register' : 'login'}`, { username, password });
      login(data); navigate('/');
    } catch (err) { setError(err.response?.data?.message || 'Something went wrong'); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 20px' }}>

        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💬</div>
          <h1 style={{ color: theme.accent, fontSize: '2.2rem', fontWeight: '800', margin: 0, letterSpacing: '-1px' }}>NexTalk</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '8px' }}>Chat with anyone, instantly</p>
        </div>

        <div style={{ background: theme.bgSecondary, borderRadius: '20px', padding: '32px', border: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.text, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 22px', textAlign: 'center' }}>
            {isRegister ? 'Create Account' : 'Welcome back'}
          </h2>
          {error && <div style={{ background: 'rgba(255,80,80,0.12)', border: '1px solid rgba(255,80,80,0.25)', color: '#ff7070', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>{error}</div>}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input style={{ padding: '13px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
              placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required minLength={3} />
            <input type="password" style={{ padding: '13px 16px', borderRadius: '12px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.95rem', outline: 'none', fontFamily: 'inherit' }}
              placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            <button type="submit" disabled={loading} style={{ padding: '14px', borderRadius: '12px', border: 'none', background: theme.accent, color: theme.bubbleText, fontWeight: '700', fontSize: '1rem', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1, fontFamily: 'inherit' }}>
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '18px', fontSize: '0.88rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={{ color: theme.accent, cursor: 'pointer', fontWeight: '700' }} onClick={() => { setIsRegister(!isRegister); setError(''); }}>
            {isRegister ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
