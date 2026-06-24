import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const RoomList = ({ rooms, activeRoom, onSelectRoom, onRoomCreated, onLogout }) => {
  const { user } = useAuth();
  const [newRoom, setNewRoom] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newRoom.trim()) return;
    setCreating(true);
    try {
      const { data } = await axios.post(
        'http://localhost:5000/api/rooms',
        { name: newRoom.trim() },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      onRoomCreated(data);
      setNewRoom('');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not create room');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div style={styles.sidebar}>
      <div style={styles.header}>
        <span style={styles.appName}>💬 NexTalk</span>
        <button style={styles.logoutBtn} onClick={onLogout}>Exit</button>
      </div>

      <div style={styles.userInfo}>
        <div style={styles.avatar}>{user.username[0].toUpperCase()}</div>
        <span style={styles.username}>{user.username}</span>
      </div>

      <form onSubmit={handleCreate} style={styles.createForm}>
        <input
          style={styles.input}
          placeholder="New room name..."
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button style={styles.createBtn} type="submit" disabled={creating}>+</button>
      </form>

      <p style={styles.sectionLabel}>ROOMS</p>
      <div style={styles.roomList}>
        {rooms.length === 0 && (
          <p style={styles.empty}>No rooms yet. Create one above.</p>
        )}
        {rooms.map((room) => (
          <div
            key={room._id}
            style={{
              ...styles.roomItem,
              ...(activeRoom?._id === room._id ? styles.activeRoom : {}),
            }}
            onClick={() => onSelectRoom(room)}
          >
            <span style={styles.hash}>#</span>
            <span style={styles.roomName}>{room.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: '240px',
    minWidth: '240px',
    background: '#111318',
    borderRight: '1px solid #1e2130',
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    height: '100vh',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px',
    borderBottom: '1px solid #1e2130',
  },
  appName: { color: '#fff', fontWeight: '700', fontSize: '1rem' },
  logoutBtn: {
    background: 'none',
    border: '1px solid #2a2d3a',
    color: '#6b7280',
    borderRadius: '6px',
    padding: '4px 10px',
    cursor: 'pointer',
    fontSize: '0.8rem',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 16px',
    borderBottom: '1px solid #1e2130',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#6366f1',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  username: { color: '#d1d5db', fontSize: '0.9rem', fontWeight: '500' },
  createForm: {
    display: 'flex',
    gap: '6px',
    padding: '12px 16px',
    borderBottom: '1px solid #1e2130',
  },
  input: {
    flex: 1,
    padding: '7px 10px',
    borderRadius: '6px',
    border: '1px solid #2a2d3a',
    background: '#0f1117',
    color: '#fff',
    fontSize: '0.85rem',
    outline: 'none',
  },
  createBtn: {
    padding: '7px 12px',
    borderRadius: '6px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontSize: '1.1rem',
    cursor: 'pointer',
    fontWeight: '700',
  },
  sectionLabel: {
    color: '#4b5563',
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.08em',
    padding: '12px 16px 6px',
    margin: 0,
  },
  roomList: { flex: 1, overflowY: 'auto' },
  roomItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    cursor: 'pointer',
    borderRadius: '6px',
    margin: '2px 8px',
    color: '#6b7280',
    transition: 'background 0.15s',
  },
  activeRoom: { background: '#1e2130', color: '#fff' },
  hash: { fontSize: '1rem', fontWeight: '700' },
  roomName: { fontSize: '0.9rem' },
  empty: { color: '#4b5563', fontSize: '0.82rem', padding: '8px 16px' },
};

export default RoomList;
