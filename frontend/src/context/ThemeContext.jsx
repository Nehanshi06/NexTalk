import { createContext, useContext, useState, useEffect } from 'react';

export const themes = {
  limeSprout: {
    name: 'Lime Sprout', emoji: '🌿',
    accent: '#e4fd97', accentDark: '#c5e070', accentRgb: '228,253,151',
    bg: '#2d3e2c', bgSecondary: '#385036', bgTertiary: '#223321', bgCard: '#3a5238',
    text: '#f0ffe0', textSecondary: '#b8d4a8', textMuted: '#7a9e70',
    bubble: '#e4fd97', bubbleText: '#1a2e19',
    otherBubble: '#3a5238', otherBubbleText: '#f0ffe0',
    border: 'rgba(228,253,151,0.12)', inputBg: '#223321',
    storyRing: 'linear-gradient(45deg, #e4fd97, #7ec850)',
  },
  midnight: {
    name: 'Midnight', emoji: '🌙',
    accent: '#818cf8', accentDark: '#6366f1', accentRgb: '129,140,248',
    bg: '#0f0f1a', bgSecondary: '#1a1a2e', bgTertiary: '#0a0a14', bgCard: '#1e1e35',
    text: '#e8e8ff', textSecondary: '#9090c0', textMuted: '#505080',
    bubble: '#818cf8', bubbleText: '#ffffff',
    otherBubble: '#1e1e35', otherBubbleText: '#e8e8ff',
    border: 'rgba(129,140,248,0.12)', inputBg: '#0a0a14',
    storyRing: 'linear-gradient(45deg, #818cf8, #c084fc)',
  },
  roseGold: {
    name: 'Rose Gold', emoji: '🌸',
    accent: '#f9a8d4', accentDark: '#ec4899', accentRgb: '249,168,212',
    bg: '#1a0a14', bgSecondary: '#2a1020', bgTertiary: '#120709', bgCard: '#30152a',
    text: '#ffe4f0', textSecondary: '#c490a8', textMuted: '#7a4060',
    bubble: '#f9a8d4', bubbleText: '#1a0a14',
    otherBubble: '#30152a', otherBubbleText: '#ffe4f0',
    border: 'rgba(249,168,212,0.12)', inputBg: '#120709',
    storyRing: 'linear-gradient(45deg, #f9a8d4, #fb7185)',
  },
  ocean: {
    name: 'Ocean', emoji: '🌊',
    accent: '#38bdf8', accentDark: '#0ea5e9', accentRgb: '56,189,248',
    bg: '#030f1a', bgSecondary: '#0a1f30', bgTertiary: '#020c14', bgCard: '#0e2840',
    text: '#e0f4ff', textSecondary: '#6aabcc', textMuted: '#2e6080',
    bubble: '#38bdf8', bubbleText: '#030f1a',
    otherBubble: '#0e2840', otherBubbleText: '#e0f4ff',
    border: 'rgba(56,189,248,0.12)', inputBg: '#020c14',
    storyRing: 'linear-gradient(45deg, #38bdf8, #818cf8)',
  },
  ember: {
    name: 'Ember', emoji: '🔥',
    accent: '#fb923c', accentDark: '#ea580c', accentRgb: '251,146,60',
    bg: '#1a0800', bgSecondary: '#2a1200', bgTertiary: '#120500', bgCard: '#301800',
    text: '#fff0e0', textSecondary: '#c47840', textMuted: '#7a3800',
    bubble: '#fb923c', bubbleText: '#1a0800',
    otherBubble: '#301800', otherBubbleText: '#fff0e0',
    border: 'rgba(251,146,60,0.12)', inputBg: '#120500',
    storyRing: 'linear-gradient(45deg, #fb923c, #f43f5e)',
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('nt_theme') || 'limeSprout');
  const theme = themes[themeName] || themes.limeSprout;

  useEffect(() => {
    localStorage.setItem('nt_theme', themeName);
    const r = document.documentElement;
    Object.entries(theme).forEach(([k, v]) => {
      if (typeof v === 'string') r.style.setProperty(`--${k}`, v);
    });
    r.style.setProperty('--bg', theme.bg);
  }, [themeName, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
