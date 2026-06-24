import { createContext, useContext, useState, useEffect } from 'react';

const themes = {
  limeSprout: {
    name: 'Lime Sprout',
    accent: '#e4fd97',
    accentDark: '#c8e870',
    bg: '#2d3e2c',
    bgSecondary: '#3a4f38',
    bgTertiary: '#1e2e1d',
    text: '#e4fd97',
    textSecondary: '#a8c4a6',
    textMuted: '#6b8a69',
    bubble: '#e4fd97',
    bubbleText: '#2d3e2c',
    otherBubble: '#3a4f38',
    otherBubbleText: '#e4fd97',
    border: '#3a4f38',
    inputBg: '#1e2e1d',
  },
  midnight: {
    name: 'Midnight Blue',
    accent: '#7c8ff7',
    accentDark: '#5a6fe0',
    bg: '#0d0f1a',
    bgSecondary: '#161929',
    bgTertiary: '#0a0c14',
    text: '#e8eaff',
    textSecondary: '#8b8fa8',
    textMuted: '#4a4d66',
    bubble: '#7c8ff7',
    bubbleText: '#ffffff',
    otherBubble: '#1e2138',
    otherBubbleText: '#e8eaff',
    border: '#1e2138',
    inputBg: '#0a0c14',
  },
  roseGold: {
    name: 'Rose Gold',
    accent: '#f4a7b9',
    accentDark: '#e07d9a',
    bg: '#1a0d12',
    bgSecondary: '#2a1520',
    bgTertiary: '#110809',
    text: '#fde8ed',
    textSecondary: '#c4858f',
    textMuted: '#7a4550',
    bubble: '#f4a7b9',
    bubbleText: '#1a0d12',
    otherBubble: '#2a1520',
    otherBubbleText: '#fde8ed',
    border: '#2a1520',
    inputBg: '#110809',
  },
  ocean: {
    name: 'Ocean',
    accent: '#64d8f0',
    accentDark: '#3ab8d4',
    bg: '#050f1a',
    bgSecondary: '#0d1e2e',
    bgTertiary: '#030c14',
    text: '#d0f4ff',
    textSecondary: '#6a9fb5',
    textMuted: '#2e5a72',
    bubble: '#64d8f0',
    bubbleText: '#050f1a',
    otherBubble: '#0d1e2e',
    otherBubbleText: '#d0f4ff',
    border: '#0d1e2e',
    inputBg: '#030c14',
  },
  ember: {
    name: 'Ember',
    accent: '#ff8c42',
    accentDark: '#e06820',
    bg: '#150a00',
    bgSecondary: '#261500',
    bgTertiary: '#0e0700',
    text: '#ffe8cc',
    textSecondary: '#c47a40',
    textMuted: '#7a4010',
    bubble: '#ff8c42',
    bubbleText: '#150a00',
    otherBubble: '#261500',
    otherBubbleText: '#ffe8cc',
    border: '#261500',
    inputBg: '#0e0700',
  },
};

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => localStorage.getItem('ntTheme') || 'limeSprout');
  const theme = themes[themeName] || themes.limeSprout;

  useEffect(() => {
    localStorage.setItem('ntTheme', themeName);
    const root = document.documentElement;
    Object.entries(theme).forEach(([key, val]) => {
      if (typeof val === 'string') root.style.setProperty(`--${key}`, val);
    });
  }, [themeName, theme]);

  return (
    <ThemeContext.Provider value={{ theme, themeName, setThemeName, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
