import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const THEME_KEY = 'APP_THEME';

const themes = {
  light: {
    background: '#fff',
    text: '#222',
    card: '#f5f5f5',
  },
  dark: {
    background: '#222',
    text: '#fff',
    card: '#333',
  },
};

const ThemeContext = createContext({
  theme: themes.light,
  mode: 'light',
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') setMode(saved);
    })();
  }, []);

  const toggleTheme = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    await AsyncStorage.setItem(THEME_KEY, newMode);
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);