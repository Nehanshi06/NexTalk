import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

export default function PeopleList({ onStartChat }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { onlineUsers } = useSocket();
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => setPeople(r.data)).catch(console.error);
  }, []);

  const startChat = async (userId) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/conversations/open', { userId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      onStartChat(data);
    } catch (e) { console.error(e); }
  };

  return (
    <div style={{ padding: '12px 0' }}>
      <p style={{ color: theme.textMuted, fontSize: '0.72rem', fontWeight: '700', letterSpacing: '0.07em', padding: '0 16px 10px', margin: 0 }}>SUGGESTED PEOPLE</p>
      {people.map(p => {
        const online = onlineUsers[p._id] ?? p.isOnline;
        return (
          <div key={p._id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px' }}>
            <Avatar user={p} size={46} showOnline isOnline={online} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ color: theme.text, fontWeight: '600', margin: 0, fontSize: '0.92rem' }}>{p.username}</p>
              <p style={{ color: online ? '#22c55e' : theme.textMuted, margin: 0, fontSize: '0.75rem' }}>
                {online ? 'Active now' : 'Offline'}
              </p>
            </div>
            <button onClick={() => startChat(p._id)} style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none',
              background: theme.accent, color: theme.bubbleText,
              fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer', flexShrink: 0,
            }}>Message</button>
          </div>
        );
      })}
      {people.length === 0 && (
        <p style={{ color: theme.textMuted, fontSize: '0.85rem', padding: '16px', textAlign: 'center' }}>
          No other users yet. Share NexTalk with friends!
        </p>
      )}
    </div>
  );
}
