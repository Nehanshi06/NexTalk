import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import Avatar from './Avatar';
import StoriesBar from './StoriesBar';

export default function ChatWindow({ conversation, onNewMessage }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { socket, onlineUsers } = useSocket();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typingUser, setTypingUser] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imgPreview, setImgPreview] = useState(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);
  const convoId = conversation?._id;
  const other = conversation?.participants?.find(p => p._id !== user._id);

  useEffect(() => {
    if (!convoId) return;
    fetchMessages();
    socket?.emit('join-conversation', convoId);
    socket?.emit('mark-seen', { conversationId: convoId, userId: user._id });
    return () => socket?.emit('leave-conversation', convoId);
  }, [convoId]);

  useEffect(() => {
    if (!socket) return;
    const onMsg = (msg) => {
      if (msg.conversationId === convoId || msg.conversationId?._id === convoId) {
        setMessages(p => [...p, msg]);
        socket.emit('mark-seen', { conversationId: convoId, userId: user._id });
        onNewMessage?.();
      }
    };
    socket.on('receive-message', onMsg);
    socket.on('user-typing', ({ username }) => setTypingUser(username));
    socket.on('user-stop-typing', () => setTypingUser(''));
    socket.on('messages-seen', ({ conversationId }) => {
      if (conversationId === convoId) setMessages(p => p.map(m => ({ ...m, seen: true })));
    });
    return () => {
      socket.off('receive-message', onMsg);
      socket.off('user-typing');
      socket.off('user-stop-typing');
      socket.off('messages-seen');
    };
  }, [socket, convoId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, typingUser]);

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
    setImgPreview(null);
    onNewMessage?.();
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    socket?.emit('typing', { conversationId: convoId, username: user.username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => socket?.emit('stop-typing', { conversationId: convoId }), 1500);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImgPreview({ file, url });
    e.target.value = '';
  };

  const sendImage = async () => {
    if (!imgPreview) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', imgPreview.file);
    try {
      const { data } = await axios.post('http://localhost:5000/api/messages/upload-image', fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      await sendMessage(data.imageUrl);
    } catch (e) { console.error(e); }
    setUploading(false);
  };

  const fmt = (d) => new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isOnline = onlineUsers[other?._id] ?? other?.isOnline;

  // Empty state
  if (!conversation) {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bgTertiary }}>
        <StoriesBar />
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '60px', marginBottom: '16px' }}>💬</div>
            <p style={{ color: theme.text, fontSize: '1.2rem', fontWeight: '700', margin: 0 }}>Your Messages</p>
            <p style={{ color: theme.textMuted, fontSize: '0.88rem', marginTop: '8px' }}>Go to People tab to start a conversation</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', background: theme.bgTertiary }} onClick={() => showEmoji && setShowEmoji(false)}>

      {/* Stories bar at top */}
      <StoriesBar />

      {/* Chat header */}
      <div style={{ padding: '12px 20px', borderBottom: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', alignItems: 'center', gap: '14px' }}>
        <Avatar user={other} size={42} showOnline isOnline={isOnline} />
        <div>
          <p style={{ color: theme.text, fontWeight: '700', margin: 0, fontSize: '1rem' }}>{other?.username}</p>
          <p style={{ color: isOnline ? '#22c55e' : theme.textMuted, margin: 0, fontSize: '0.75rem' }}>
            {isOnline ? 'Active now' : other?.lastSeen ? `Last seen ${new Date(other.lastSeen).toLocaleDateString()}` : 'Offline'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
        {messages.map((msg, i) => {
          const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
          const isLast = i === messages.length - 1;
          const showAvatar = !isOwn && (i === messages.length - 1 || messages[i + 1]?.sender?._id !== msg.sender?._id);
          return (
            <div key={msg._id} style={{ display: 'flex', flexDirection: 'column', alignItems: isOwn ? 'flex-end' : 'flex-start', marginBottom: '1px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                <div style={{ width: 28, flexShrink: 0 }}>
                  {showAvatar && !isOwn && <Avatar user={other} size={28} />}
                </div>
                <div style={{ maxWidth: '320px' }}>
                  {msg.image && (
                    <img src={msg.image} alt="shared"
                      style={{ maxWidth: '220px', maxHeight: '280px', borderRadius: '18px', display: 'block', objectFit: 'cover', marginBottom: msg.text ? '4px' : 0 }} />
                  )}
                  {msg.text && (
                    <div style={{
                      padding: '10px 16px', borderRadius: '22px',
                      borderBottomRightRadius: isOwn ? '4px' : '22px',
                      borderBottomLeftRadius: isOwn ? '22px' : '4px',
                      background: isOwn ? theme.bubble : theme.otherBubble,
                      color: isOwn ? theme.bubbleText : theme.otherBubbleText,
                      wordBreak: 'break-word', fontSize: '0.92rem', lineHeight: '1.45',
                    }}>
                      {msg.text}
                    </div>
                  )}
                </div>
              </div>
              {isLast && (
                <div style={{ display: 'flex', gap: '4px', marginTop: '3px', paddingLeft: isOwn ? 0 : '36px', paddingRight: isOwn ? '4px' : 0 }}>
                  <span style={{ color: theme.textMuted, fontSize: '0.67rem' }}>{fmt(msg.createdAt)}</span>
                  {isOwn && <span style={{ color: theme.textMuted, fontSize: '0.67rem' }}>{msg.seen ? '· Seen' : '· Sent'}</span>}
                </div>
              )}
            </div>
          );
        })}

        {typingUser && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Avatar user={other} size={28} />
            <div style={{ background: theme.otherBubble, padding: '10px 16px', borderRadius: '22px', borderBottomLeftRadius: '4px' }}>
              <span style={{ color: theme.textMuted, fontSize: '0.85rem' }}>
                <span style={{ letterSpacing: '2px' }}>• • •</span>
              </span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Image preview before sending */}
      {imgPreview && (
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={imgPreview.url} alt="preview" style={{ height: 60, width: 60, objectFit: 'cover', borderRadius: '8px' }} />
          <span style={{ color: theme.textSecondary, fontSize: '0.85rem', flex: 1 }}>Ready to send</span>
          <button onClick={sendImage} disabled={uploading} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', background: theme.accent, color: theme.bubbleText, fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}>
            {uploading ? 'Sending…' : 'Send'}
          </button>
          <button onClick={() => setImgPreview(null)} style={{ background: 'none', border: 'none', color: theme.textMuted, cursor: 'pointer', fontSize: '1.2rem' }}>✕</button>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div style={{ position: 'absolute', bottom: '72px', right: '20px', zIndex: 100 }} onClick={e => e.stopPropagation()}>
          <EmojiPicker onEmojiClick={e => setText(p => p + e.emoji)} theme="dark" height={360} width={300} />
        </div>
      )}

      {/* Input bar */}
      <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}`, background: theme.bg, display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />
        <button onClick={() => fileRef.current?.click()} title="Send image"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.35rem', color: theme.textMuted, padding: '4px', flexShrink: 0 }}>📷</button>
        <button onClick={e => { e.stopPropagation(); setShowEmoji(!showEmoji); }} title="Emoji"
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.35rem', color: theme.textMuted, padding: '4px', flexShrink: 0 }}>😊</button>
        <input
          style={{ flex: 1, padding: '11px 16px', borderRadius: '24px', border: `1px solid ${theme.border}`, background: theme.bgSecondary, color: theme.text, fontSize: '0.92rem', outline: 'none' }}
          placeholder={`Message ${other?.username || ''}…`}
          value={text}
          onChange={handleTyping}
          onKeyDown={handleKeyDown}
        />
        <button onClick={() => sendMessage()} disabled={!text.trim()}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', flexShrink: 0,
            background: text.trim() ? theme.accent : theme.bgSecondary,
            color: text.trim() ? theme.bubbleText : theme.textMuted,
            cursor: text.trim() ? 'pointer' : 'default', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s',
          }}>➤</button>
      </div>
    </div>
  );
}
