const UserPresence = ({ isOnline }) => (
  <span
    style={{
      display: 'inline-block',
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      background: isOnline ? '#22c55e' : '#4b5563',
      flexShrink: 0,
    }}
    title={isOnline ? 'Online' : 'Offline'}
  />
);

export default UserPresence;
