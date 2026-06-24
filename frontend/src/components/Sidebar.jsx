import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import PeopleList from './PeopleList';

export default function Sidebar({ activeConvoId, onSelectConvo, onOpenSettings, newMsgConvoId }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { onlineUsers } = useSocket();
  const [tab, setTab] = useState('chats'); // 'chats' | 'people'
  const [convos, setConvos] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => { fetchConvos(); }, [newMsgConvoId]);

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
    try {
      const { data } = await axios.get(`http://localhost:5000/api/users/search?q=${val}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearchResults(data);
    } catch (e) { console.error(e); }
  };

  const openConvo = async (userId) => {
    try {
      const { data } = await axios.post('http://localhost:5000/api/conversations/open', { userId }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSearch(''); setSearchResults([]);
      onSelectConvo(data);
      fetchConvos();
    } catch (e) { console.error(e); }
  };

  const getOther = (c) => c.participants.find(p => p._id !== user._id);

  const fmt = (d) => {
    if (!d) return '';
    const diff = Date.now() - new Date(d);
    if (diff < 60000) return 'now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
    return `${Math.floor(diff / 86400000)}d`;
  };

  return (
    <div style={{ width: '340px', minWidth: '340px', height: '100vh', background: theme.bg, borderRight: `1px solid ${theme.border}`, display: 'flex', flexDirection: 'column', fontFamily: "'Inter', sans-serif" }}>

      {/* Header */}
      <div style={{ padding: '18px 16px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: theme.accent, fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.5px' }}>NexTalk</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={onOpenSettings} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: theme.textMuted }}>⚙️</button>
          <Avatar user={user} size={32} onClick={onOpenSettings} />
        </div>
      </div>

      {/* Search */}
      <div style={{ padding: '4px 16px 12px' }}>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: theme.textMuted, fontSize: '0.9rem' }}>🔍</span>
          <input
            style={{ width: '100%', padding: '10px 14px 10px 36px', borderRadius: '24px', border: `1px solid ${theme.border}`, background: theme.bgSecondary, color: theme.text, fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box' }}
            placeholder="Search..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Search results overlay */}
      {search && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {searchResults.length === 0
            ? <p style={{ color: theme.textMuted, textAlign: 'center', padding: '24px', fontSize: '0.85rem' }}>No users found</p>
            : searchResults.map(u => (
              <div key={u._id} onClick={() => openConvo(u._id)}
                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = theme.bgSecondary}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <Avatar user={u} size={44} showOnline isOnline={onlineUsers[u._id] ?? u.isOnline} />
                <div>
                  <p style={{ color: theme.text, fontWeight: '600', margin: 0 }}>{u.username}</p>
                  <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.78rem' }}>{onlineUsers[u._id] ? 'Active now' : 'Offline'}</p>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Tabs */}
      {!search && (
        <>
          <div style={{ display: 'flex', borderBottom: `1px solid ${theme.border}`, margin: '0 16px' }}>
            {['chats', 'people'].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: '10px', background: 'none', border: 'none',
                borderBottom: tab === t ? `2px solid ${theme.accent}` : '2px solid transparent',
                color: tab === t ? theme.accent : theme.textMuted,
                fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', textTransform: 'capitalize',
                fontFamily: 'inherit',
              }}>{t === 'chats' ? '💬 Chats' : '👥 People'}</button>
            ))}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'chats' && (
              <>
                {convos.length === 0 && (
                  <div style={{ padding: '32px 16px', textAlign: 'center' }}>
                    <p style={{ color: theme.textMuted, fontSize: '0.9rem' }}>No conversations yet</p>
                    <p style={{ color: theme.textMuted, fontSize: '0.8rem', marginTop: '6px' }}>Go to People tab to start chatting</p>
                  </div>
                )}
                {convos.map(convo => {
                  const other = getOther(convo);
                  if (!other) return null;
                  const isActive = convo._id === activeConvoId;
                  const online = onlineUsers[other._id] ?? other.isOnline;
                  const lastMsg = convo.lastMessage;
                  return (
                    <div key={convo._id} onClick={() => onSelectConvo(convo)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px',
                        cursor: 'pointer', background: isActive ? theme.bgSecondary : 'transparent',
                        borderLeft: `3px solid ${isActive ? theme.accent : 'transparent'}`,
                        transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = theme.bgTertiary; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                      <Avatar user={other} size={50} showOnline isOnline={online} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <p style={{ color: theme.text, fontWeight: '600', margin: 0, fontSize: '0.93rem' }}>{other.username}</p>
                          <span style={{ color: theme.textMuted, fontSize: '0.7rem', flexShrink: 0 }}>{fmt(convo.lastMessageAt)}</span>
                        </div>
                        <p style={{ color: theme.textMuted, margin: 0, fontSize: '0.8rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '2px' }}>
                          {lastMsg ? (lastMsg.sender?._id === user._id ? 'You: ' : '') + (lastMsg.image ? '📷 Photo' : lastMsg.text) : 'Start a conversation'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {tab === 'people' && <PeopleList onStartChat={(convo) => { onSelectConvo(convo); setTab('chats'); fetchConvos(); }} />}
          </div>
        </>
      )}
    </div>
  );
}
