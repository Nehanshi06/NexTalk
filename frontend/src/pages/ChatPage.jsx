import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import SettingsPanel from '../components/SettingsPanel';

export default function ChatPage() {
  const { theme } = useTheme();
  const [activeConvo, setActiveConvo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [newMsgTick, setNewMsgTick] = useState(0);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg, fontFamily: "'Inter', sans-serif" }}>
      <Sidebar
        activeConvoId={activeConvo?._id}
        onSelectConvo={setActiveConvo}
        onOpenSettings={() => setShowSettings(true)}
        newMsgConvoId={newMsgTick}
      />
      <ChatWindow
        conversation={activeConvo}
        onNewMessage={() => setNewMsgTick(t => t + 1)}
      />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
