import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import ConversationList from '../components/ConversationList';
import ChatWindow from '../components/ChatWindow';
import SettingsPanel from '../components/SettingsPanel';

export default function ChatPage() {
  const { theme } = useTheme();
  const [activeConvo, setActiveConvo] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: theme.bg, fontFamily: "'Inter', sans-serif" }}>
      <ConversationList
        activeConvoId={activeConvo?._id}
        onSelectConvo={setActiveConvo}
        onOpenSettings={() => setShowSettings(true)}
      />
      <ChatWindow conversation={activeConvo} />
      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </div>
  );
}
