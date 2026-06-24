import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Avatar from './Avatar';

export default function StoriesBar({ onAddStory }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [storyGroups, setStoryGroups] = useState([]);
  const [viewing, setViewing] = useState(null); // { group, storyIndex }
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { fetchStories(); }, []);

  const fetchStories = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/stories', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setStoryGroups(data);
    } catch (e) { console.error(e); }
  };

  const openStory = (group) => {
    setViewing({ group, storyIndex: 0 });
    setProgress(0);
    startTimer(group, 0);
  };

  const startTimer = (group, idx) => {
    clearInterval(timerRef.current);
    setProgress(0);
    let p = 0;
    timerRef.current = setInterval(() => {
      p += 2;
      setProgress(p);
      if (p >= 100) {
        clearInterval(timerRef.current);
        const next = idx + 1;
        if (next < group.stories.length) {
          setViewing({ group, storyIndex: next });
          startTimer(group, next);
        } else {
          setViewing(null);
        }
      }
    }, 100);
  };

  const closeStory = () => { clearInterval(timerRef.current); setViewing(null); };

  const handleAddStory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('image', file);
    try {
      await axios.post('http://localhost:5000/api/stories', fd, {
        headers: { Authorization: `Bearer ${user.token}`, 'Content-Type': 'multipart/form-data' },
      });
      fetchStories();
      if (onAddStory) onAddStory();
    } catch (e) { console.error(e); }
    e.target.value = '';
  };

  const myGroup = storyGroups.find(g => g.user._id === user._id);

  return (
    <>
      <div style={{ display: 'flex', gap: '16px', padding: '16px 16px 12px', overflowX: 'auto', borderBottom: `1px solid ${theme.border}` }}>
        {/* Add Story */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => fileRef.current?.click()}>
          <div style={{ position: 'relative' }}>
            <Avatar user={user} size={56} storyRing={!!myGroup} />
            <div style={{
              position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: '50%',
              background: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `2px solid ${theme.bg}`, fontSize: '12px', color: theme.bubbleText, fontWeight: '700',
            }}>+</div>
          </div>
          <span style={{ color: theme.textSecondary, fontSize: '0.72rem', fontWeight: '500' }}>Your story</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAddStory} />
        </div>

        {/* Other users' stories */}
        {storyGroups.filter(g => g.user._id !== user._id).map(group => (
          <div key={group.user._id} onClick={() => openStory(group)}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0 }}>
            <Avatar user={group.user} size={56} storyRing />
            <span style={{ color: theme.textSecondary, fontSize: '0.72rem', fontWeight: '500', maxWidth: 60, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.user.username}</span>
          </div>
        ))}
      </div>

      {/* Story viewer overlay */}
      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={closeStory}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '400px', height: '100vh', maxHeight: '700px' }}
            onClick={e => e.stopPropagation()}>

            {/* Progress bars */}
            <div style={{ position: 'absolute', top: 12, left: 12, right: 12, display: 'flex', gap: '4px', zIndex: 10 }}>
              {viewing.group.stories.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, background: 'rgba(255,255,255,0.3)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: '#fff', width: i < viewing.storyIndex ? '100%' : i === viewing.storyIndex ? `${progress}%` : '0%', transition: 'width 0.1s linear' }} />
                </div>
              ))}
            </div>

            {/* User info */}
            <div style={{ position: 'absolute', top: 24, left: 12, display: 'flex', alignItems: 'center', gap: '10px', zIndex: 10 }}>
              <Avatar user={viewing.group.user} size={36} />
              <span style={{ color: '#fff', fontWeight: '600', fontSize: '0.9rem' }}>{viewing.group.user.username}</span>
            </div>

            {/* Close */}
            <button onClick={closeStory} style={{ position: 'absolute', top: 24, right: 12, background: 'none', border: 'none', color: '#fff', fontSize: '1.5rem', cursor: 'pointer', zIndex: 10 }}>✕</button>

            {/* Story image */}
            <img
              src={viewing.group.stories[viewing.storyIndex]?.image}
              alt="story"
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }}
            />
          </div>
        </div>
      )}
    </>
  );
}
