import { useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

export default function SettingsPanel({ onClose }) {
  const { user, logout, updateUser } = useAuth();
  const { theme, themeName, setThemeName, themes } = useTheme();
  const [bio, setBio] = useState(user.bio || '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const saveBio = async () => {
    setSaving(true);
    try {
      const { data } = await axios.put('http://localhost:5000/api/users/profile/update', { bio }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      updateUser({ bio: data.bio });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) { console.error(e); }
    setSaving(false);
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/avatar', fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
    } catch (e) { console.error(e); }
    setUploading(false);
    e.target.value = '';
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
      <div style={{ background: theme.bgSecondary, borderRadius: '20px', width: '100%', maxWidth: '420px', maxHeight: '90vh', overflowY: 'auto', border: `1px solid ${theme.border}` }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: `1px solid ${theme.border}` }}>
          <h2 style={{ color: theme.text, margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '1.4rem', lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Profile */}
          <div>
            <p style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em', margin: '0 0 14px' }}>PROFILE</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current?.click()}>
                <Avatar user={user} size={64} />
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.opacity = 1}
                  onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                  <span style={{ color: '#fff', fontSize: '1.2rem' }}>{uploading ? '⏳' : '📷'}</span>
                </div>
              </div>
              <div>
                <p style={{ color: theme.text, fontWeight: '700', margin: '0 0 4px', fontSize: '1rem' }}>{user.username}</p>
                <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.8rem' }}>Tap avatar to change photo</p>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} />
            </div>
            <textarea
              style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', border: `1px solid ${theme.border}`, background: theme.inputBg, color: theme.text, fontSize: '0.9rem', outline: 'none', resize: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }}
              rows={2}
              placeholder="Add a bio..."
              value={bio}
              onChange={e => setBio(e.target.value)}
            />
            <button onClick={saveBio} disabled={saving}
              style={{ marginTop: '10px', padding: '10px 20px', borderRadius: '10px', border: 'none', background: theme.accent, color: theme.bubbleText, fontWeight: '600', fontSize: '0.9rem', cursor: 'pointer' }}>
              {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Bio'}
            </button>
          </div>

          {/* Themes */}
          <div>
            <p style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em', margin: '0 0 14px' }}>THEME</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {Object.entries(themes).map(([key, t]) => (
                <div key={key} onClick={() => setThemeName(key)}
                  style={{ padding: '12px 14px', borderRadius: '12px', border: `2px solid ${themeName === key ? t.accent : theme.border}`, background: t.bg, cursor: 'pointer', transition: 'border 0.2s' }}>
                  <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent }} />
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.bgSecondary, border: `1px solid ${t.border}` }} />
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: t.bubble }} />
                  </div>
                  <p style={{ color: t.text, margin: 0, fontSize: '0.82rem', fontWeight: '600' }}>{t.name}</p>
                  {themeName === key && <p style={{ color: t.accent, margin: '2px 0 0', fontSize: '0.72rem' }}>Active</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Logout */}
          <div style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
            <button onClick={logout}
              style={{ width: '100%', padding: '12px', borderRadius: '10px', border: `1px solid rgba(255,80,80,0.3)`, background: 'rgba(255,80,80,0.1)', color: '#ff6b6b', fontWeight: '600', fontSize: '0.95rem', cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
