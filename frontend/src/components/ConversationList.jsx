import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

export default function ConversationList({ activeConvoId, onSelectConvo, onOpenSettings }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { onlineUsers } = useSocket();
  const [convos, setConvos] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchConvos();
  }, []);

  const fetchConvos = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/conversations', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setConvos(data);
    } catch (e) { console.error(e); }
  };

  const handleSearch = async (val) => {
    setSearch(val);
    if (!val.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/search?q=${val}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(data);
    } catch (e) { console.error(e); }
    setSearching(false);
  };

  const openConvo = async (userId) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/conversations/open', { userId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearch('');
      setSearchResults([]);
      onSelectConvo(data);
      fetchConvos();
    } catch (e) { console.error(e); }
  };

  const getOther = (convo) => convo.participants.find(p => p._id !== user._id);

  const formatTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div style={{ width: '320px', minWidth: '320px', height: '100vh', background: theme.bg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ padding: '20px 16px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={onOpenSettings}>
          <Avatar user={user} size={36} />
          <span style={{ color: theme.text, fontWeight: '700', fontSize: '1.1rem' }}>{user.username}</span>
        </div>
        <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '1.3rem', padding: '4px' }} title="Settings">⚙️</button>
      </div>

      {/* Search */}
      <div style={{ padding: '0 16px 12px' }}>
        <input
          style={{ width: '100%', padding: '10px 14px', borderRadius: '24px', border: `1px solid ${theme.border}`, background: theme.bgSecondary, color: theme.text, fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box' }}
          placeholder="Search people..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
      </div>

      {/* Search results */}
      {search && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searching && <p style={{ color: theme.textMuted, textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>Searching...</p>}
          {!searching && searchResults.length === 0 && (
            <p style={{ color: theme.textMuted, textAlign: 'center', padding: '20px', fontSize: '0.85rem' }}>No users found</p>
          )}
          {searchResults.map(u => (
            <div key={u._id} onClick={() => openConvo(u._id)}
              style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <Avatar user={u} size={46} showOnline isOnline={onlineUsers[u._id] ?? u.isOnline} />
              <div>
                <p style={{ color: theme.text, fontWeight: '600', margin: 0, fontSize: '0.95rem' }}>{u.username}</p>
                <p style={{ color: onlineUsers[u._id] ?? u.isOnline ? '#22c55e' : theme.textMuted, margin: 0, fontSize: '0.78rem' }}>
                  {onlineUsers[u._id] ?? u.isOnline ? 'Active now' : 'Offline'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Conversations */}
      {!search && (
        <>
          <p style={{ color: theme.textMuted, fontSize: '0.75rem', fontWeight: '700', letterSpacing: '0.06em', padding: '4px 16px 8px', margin: 0 }}>MESSAGES</p>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {convos.length === 0 && (
              <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>No conversations yet</p>
                <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginTop: '4px' }}>Search for someone to start chatting</p>
              </div>
            )}
            {convos.map(convo => {
              const other = getOther(convo);
              if (!other) return null;
              const isActive = convo._id === activeConvoId;
              const lastMsg = convo.lastMessage;
              return (
                <div key={convo._id} onClick={() => onSelectConvo(convo)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer', background: isActive ? theme.bgSecondary : 'transparent', transition: 'background 0.15s', borderLeft: isActive ? `3px solid ${theme.accent}` : '3px solid transparent' }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = theme.bgTertiary; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                >
                  <Avatar user={other} size={50} showOnline isOnline={onlineUsers[other._id] ?? other.isOnline} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: theme.text, fontWeight: '600', margin: 0, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{other.username}</p>
                      <span style={{ color: theme.textMuted, fontSize: '0.72rem', flexShrink: 0 }}>{formatTime(convo.lastMessageAt)}</span>
                    </div>
                    <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                      {lastMsg ? (lastMsg.sender?._id === user._id ? 'You: ' : '') + (lastMsg.image ? '📷 Photo' : lastMsg.text) : 'Say hello!'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
