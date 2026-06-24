import { useTheme } from '../context/ThemeContext';

export default function Avatar({ user, size = 40, showOnline = false, isOnline = false, storyRing = false, onClick }) {
  const { theme } = useTheme();
  const initials = (user?.username || '?').slice(0, 2).toUpperCase();

  return (
    <div onClick={onClick} style={{ position: 'relative', display: 'inline-flex', flexShrink: 0, cursor: onClick ? 'pointer' : 'default' }}>
      {storyRing && (
        <div style={{
          position: 'absolute', inset: -2.5, borderRadius: '50%',
          background: theme.storyRing, zIndex: 0,
        }} />
      )}
      <div style={{ position: 'relative', zIndex: 1, background: theme.bg, borderRadius: '50%', padding: storyRing ? 2.5 : 0 }}>
        {user?.avatar ? (
          <img src={user.avatar} alt={user?.username} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{
            width: size, height: size, borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: theme.bubbleText, fontWeight: '700', fontSize: size * 0.36, userSelect: 'none',
          }}>
            {initials}
          </div>
        )}
      </div>
      {showOnline && (
        <span style={{
          position: 'absolute', bottom: storyRing ? 4 : 1, right: storyRing ? 4 : 1, zIndex: 2,
          width: size * 0.27, height: size * 0.27, borderRadius: '50%',
          background: isOnline ? '#22c55e' : theme.textMuted,
          border: `2px solid ${theme.bg}`,
        }} />
      )}
    </div>
  );
}
