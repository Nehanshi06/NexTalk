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
    e.preventDefault();
    setError('');
    setLoading(true);
    const url = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const { data } = await axios.post(`http://localhost:5000${url}`, { username, password });
      login(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bg }}>
      <div style={{ width: '100%', maxWidth: '360px', padding: '0 20px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>💬</div>
          <h1 style={{ color: theme.accent, fontSize: '2rem', fontWeight: '700', margin: 0, letterSpacing: '-0.5px' }}>NexTalk</h1>
          <p style={{ color: theme.textMuted, fontSize: '0.85rem', marginTop: '6px' }}>Connect with anyone, instantly</p>
        </div>

        {/* Card */}
        <div style={{ background: theme.bgSecondary, borderRadius: '16px', padding: '28px', border: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.text, fontSize: '1.1rem', fontWeight: '600', margin: '0 0 20px', textAlign: 'center' }}>
            {isRegister ? 'Create Account' : 'Sign In'}
          </h2>

          {error && (
            <div style={{ background: 'rgba(255,80,80,0.15)', border: '1px solid rgba(255,80,80,0.3)', color: '#ff6b6b', padding: '10px 14px', borderRadius: '10px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <input
              style={{ padding: '13px 16px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.95rem', outline: 'none' }}
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required minLength={3}
            />
            <input
              style={{ padding: '13px 16px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.95rem', outline: 'none' }}
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required minLength={6}
            />
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '13px', borderRadius: '10px', border: 'none', background: theme.accent, color: theme.bubbleText, fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer', marginTop: '4px', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Toggle */}
        <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <span style={{ color: theme.accent, cursor: 'pointer', fontWeight: '600' }} onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? 'Sign in' : 'Sign up'}
          </span>
        </p>
      </div>
    </div>
  );
}
