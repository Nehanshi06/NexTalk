import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';

export default function ChatWindow({ conversation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);

  const other = conversation?.participants?.find(p => p._id !== user._id);
  const convoId = conversation?._id;

  useEffect(() => {
    if (!convoId) return;
    fetchMessages();
    socket?.emit('join-conversation', convoId);
    socket?.emit('mark-seen', { conversationId: convoId, userId: user._id });
    return () => socket?.emit('leave-conversation', convoId);
  }, [convoId]);

  useEffect(() => {
    if (!socket) return;
    socket.on('receive-message', (msg) => {
      if (msg.conversationId === convoId || msg.conversationId?._id === convoId) {
        setMessages(prev => [...prev, msg]);
        socket.emit('mark-seen', { conversationId: convoId, userId: user._id });
      }
    });
    socket.on('user-typing', ({ username }) => setTypingUser(username));
    socket.on('user-stop-typing', () => setTypingUser(''));
    socket.on('messages-seen', ({ conversationId }) => {
      if (conversationId === convoId) {
        setMessages(prev => prev.map(m => ({ ...m, seen: true })));
      }
    });
    return () => {
      socket.off('receive-message');
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('messages-seen');
    };
  }, [socket, convoId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUser]);

  const fetchMessages = async () => {
    try {
      const { data } = await axios.get(`http://localhost:5000/api/messages/${convoId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setMessages(data);
    } catch (e) { console.error(e); }
  };

  const sendMessage = async (imageUrl = '') => {
    if (!text.trim() && !imageUrl) return;
    socket?.emit('send-message', { conversationId: convoId, senderId: user._id, text: text.trim(), image: imageUrl });
    socket?.emit('stop-typing', { conversationId: convoId });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { conversationId: convoId, username: user.username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket?.emit('stop-typing', { conversationId: convoId }), 1500);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await axios.post('http://localhost:5000/api/messages/upload-image', fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      await sendMessage(data.imageUrl);
    } catch (e) { console.error(e); }
    setUploading(false);
    e.target.value = '';
  };

  const formatTime = (date) => new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const isOnline = onlineUsers[other?._id] ?? other?.isOnline;

  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: theme.bgTertiary }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>💬</div>
          <p style={{ color: theme.text, fontSize: '1.1rem', fontWeight: '600', margin: 0 }}>Your Messages</p>
          <p style={{ color: theme.textMuted, fontSize: '0.88rem', marginTop: '8px' }}>Search for someone to start a conversation</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bgTertiary }} onClick={() => showEmoji && setShowEmoji(false)}>

      {/* Header */}
      <div style={{ padding: '14px 20px', borderBottom: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Avatar user={other} size={42} showOnline isOnline={isOnline} />
        <div>
          <p style={{ color: theme.text, fontWeight: '700', margin: 0, fontSize: '1rem' }}>{other?.username}</p>
          <p style={{ color: isOnline ? '#22c55e' : theme.textMuted, margin: 0, fontSize: '0.78rem' }}>
            {isOnline ? 'Active now' : other?.lastSeen ? `Last seen ${new Date(other.lastSeen).toLocaleDateString()}` : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {messages.map((msg, i) => {
          const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
          const isLast = i === messages.length - 1;
          return (
            <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', marginBottom: '2px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                {!isOwn && <Avatar user={other} size={28} />}
                <div>
                  {msg.image && (
                    <img src={msg.image} alt="shared" style={{ maxWidth: '240px', maxHeight: '300px', borderRadius: '16px', display: 'block', objectFit: 'cover', marginBottom: msg.text ? '6px' : '0' }} />
                  )}
                  {msg.text && (
                    <div style={{
                      padding: '10px 16px', borderRadius: '20px',
                      borderBottomRightRadius: isOwn ? '4px' : '20px',
                      borderBottomLeftRadius: isOwn ? '20px' : '4px',
                      background: isOwn ? theme.bubble : theme.otherBubble,
                      color: isOwn ? theme.bubbleText : theme.otherBubbleText,
                      maxWidth: '320px', wordBreak: 'break-word', fontSize: '0.93rem', lineHeight: '1.4',
                    }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '3px', paddingRight: isOwn ? '0' : '36px', paddingLeft: isOwn ? '36px' : '0', justifyContent: isOwn ? 'flex-end' : 'flex-start' }}>
                <span style={{ color: theme.textMuted, fontSize: '0.68rem' }}>{formatTime(msg.createdAt)}</span>
                {isOwn && isLast && <span style={{ color: theme.textMuted, fontSize: '0.68rem' }}>{msg.seen ? '✓✓' : '✓'}</span>}
              </div>
            </div>
          );
        })}
        {typingUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <Avatar user={other} size={28} />
            <div style={{ background: theme.otherBubble, padding: '10px 16px', borderRadius: '20px', borderBottomLeftRadius: '4px' }}>
              <span style={{ color: theme.textMuted, fontSize: '0.85rem', fontStyle: 'italic' }}>{typingUser} is typing…</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Emoji Picker */}
      {showEmoji && (
        <div style={{ position: 'absolute', bottom: '80px', right: '20px', zIndex: 100 }} onClick={e => e.stopPropagation()}>
          <EmojiPicker onEmojiClick={(e) => setText(prev => prev + e.emoji)} theme="dark" height={380} width={320} />
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', alignItems: 'center', gap: '10px', position: 'relative' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
        <button onClick={() => fileRef.current?.click()} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: theme.textMuted, padding: '4px', opacity: uploading ? 0.4 : 1 }} title="Send image">
          {uploading ? '⏳' : '📷'}
        </button>
        <button onClick={(e) => { e.stopPropagation(); setShowEmoji(!showEmoji); }} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.3rem', color: theme.textMuted, padding: '4px' }} title="Emoji">
          😊
        </button>
        <input
          style={{ flex: 1, padding: '11px 16px', borderRadius: '24px', border: `1px solid ${theme.border}`, background: theme.bgSecondary, color: theme.text, fontSize: '0.93rem', outline: 'none' }}
          placeholder={`Message ${other?.username}...`}
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button
          onClick={() => sendMessage()}
          disabled={!text.trim()}
          style={{ background: text.trim() ? theme.accent : theme.bgSecondary, border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: text.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'background 0.2s', flexShrink: 0 }}
        >
          <span style={{ color: text.trim() ? theme.bubbleText : theme.textMuted }}>➤</span>
        </button>
      </div>
    </div>
  );
}
