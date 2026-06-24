import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

export default function SettingsPanel({ onClose }) {
  const { user, logout, updateUser } = useAuth();
  const { theme, themeName, setThemeName, themes } = useTheme();
  const [bio, setBio] = useState(user.bio || '');
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const saveBio = async () => {
    try {
      const { data } = await axios.put('http://localhost:5000/api/users/profile/update', { bio }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      updateUser({ bio: data.bio });
      setSaved(true); setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
  };

  const uploadAvatar = async (e) => {
    const file = e.target.files[0]; if (!file) return;
    setUploading(true);
    const fd = new FormData(); fd.append('avatar', file);
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/avatar', fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
    } catch (e) { console.error(e); }
    setUploading(false); e.target.value = '';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: theme.bgSecondary, borderRadius: '20px', width: '100%', maxWidth: '440px', maxHeight: '88vh', overflowY: 'auto', border: `1px solid ${theme.border}` }} onClick={e => e.stopPropagation()}>

        <div style={{ padding: '20px 24px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.text, margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '1.4rem' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '28px' }}>

          {/* Profile section */}
          <div>
            <p style={{ color: theme.textMuted, fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', margin: '0 0 16px' }}>PROFILE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                <Avatar user={user} size={70} />
                <div style={{
                  position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.45)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s',
                }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <span style={{ fontSize: '1.4rem' }}>{uploading ? '⏳' : '📷'}</span>
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={uploadAvatar} />
              </div>
              <div>
                <p style={{ color: theme.text, fontWeight: '700', margin: '0 0 4px', fontSize: '1.05rem' }}>{user.username}</p>
                <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.78rem' }}>Tap photo to change</p>
              </div>
            </div>
            <textarea rows={2} value={bio} onChange={e => setBio(e.target.value)} placeholder="Add a bio…"
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            <button onClick={saveBio}
              style={{ marginTop: '10px', padding: '10px 22px', borderRadius: '10px', border: 'none', background: theme.accent, color: theme.bubbleText, fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saved ? '✓ Saved!' : 'Save Bio'}
            </button>
          </div>

          {/* Theme section */}
          <div>
            <p style={{ color: theme.textMuted, fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', margin: '0 0 14px' }}>THEME</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.entries(themes).map(([key, t]) => (
                <div key={key} onClick={() => setThemeName(key)} style={{
                  padding: '14px', borderRadius: '14px', background: t.bg, cursor: 'pointer',
                  border: `2px solid ${themeName === key ? t.accent : 'rgba(255,255,255,0.06)'}`,
                  transition: 'border 0.2s',
                }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                    {[t.accent, t.bubble, t.bgSecondary].map((c, i) => (
                      <div key={i} style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: i === 2 ? `1px solid ${t.border}` : 'none' }} />
                    ))}
                  </div>
                  <p style={{ color: t.text, margin: 0, fontSize: '0.85rem', fontWeight: '600' }}>{t.emoji} {t.name}</p>
                  {themeName === key && <p style={{ color: t.accent, margin: '3px 0 0', fontSize: '0.72rem' }}>● Active</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '20px' }}>
            <button onClick={logout} style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,80,80,0.25)', background: 'rgba(255,80,80,0.08)', color: '#ff6b6b', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
