import { useTheme } from '../context/ThemeContext';

export default function Avatar({ user, size = 40, showOnline = false, isOnline = false }) {
  const { theme } = useTheme();
  const initials = user?.username?.slice(0, 2).toUpperCase() || '??';

  return (
    <div style={{ position: 'relative', display: 'inline-block', flexShrink: 0 }}>
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.username}
          style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', display: 'block' }}
        />
      ) : (
        <div style={{
          width: size, height: size, borderRadius: '50%',
          background: `linear-gradient(135deg, ${theme.accent}, ${theme.accentDark})`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: theme.bubbleText, fontWeight: '700', fontSize: size * 0.35,
          flexShrink: 0,
        }}>
          {initials}
        </div>
      )}
      {showOnline && (
        <span style={{
          position: 'absolute', bottom: 1, right: 1,
          width: size * 0.28, height: size * 0.28, borderRadius: '50%',
          background: isOnline ? '#22c55e' : '#4b5563',
          border: `2px solid ${theme.bg}`,
        }} />
      )}
    </div>
  );
}
