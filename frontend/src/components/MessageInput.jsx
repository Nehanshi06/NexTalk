import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const MessageInput = ({ activeRoom }) => {
  const [text, setText] = useState('');
  const { user } = useAuth();
  const { socket } = useSocket();
  const typingTimeout = useRef(null);

  const handleSend = (e) => {
    e.preventDefault();
    if (!text.trim() || !activeRoom) return;

    socket.emit('send-message', {
      content: text.trim(),
      senderId: user._id,
      roomId: activeRoom._id,
    });

    socket.emit('stop-typing', { roomId: activeRoom._id });
    setText('');
  };

  const handleTyping = (e) => {
    setText(e.target.value);
    if (!activeRoom) return;

    socket.emit('typing', { roomId: activeRoom._id, username: user.username });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('stop-typing', { roomId: activeRoom._id });
    }, 1500);
  };

  return (
    <form onSubmit={handleSend} style={styles.form}>
      <input
        style={styles.input}
        placeholder={activeRoom ? `Message #${activeRoom.name}` : 'Select a room first'}
        value={text}
        onChange={handleTyping}
        disabled={!activeRoom}
      />
      <button style={styles.button} type="submit" disabled={!text.trim() || !activeRoom}>
        Send
      </button>
    </form>
  );
};

const styles = {
  form: {
    display: 'flex',
    gap: '10px',
    padding: '16px 20px',
    borderTop: '1px solid #1e2130',
    background: '#13151f',
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '10px',
    border: '1px solid #2a2d3a',
    background: '#1a1d27',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
  },
  button: {
    padding: '12px 22px',
    borderRadius: '10px',
    border: 'none',
    background: '#6366f1',
    color: '#fff',
    fontWeight: '600',
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
};

export default MessageInput;
