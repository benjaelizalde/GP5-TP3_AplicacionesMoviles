import { supabase } from '@/constants/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { useAuth } from './AuthContext';

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
  themePreference: 'system',
  setThemePreference: (_pref: 'light' | 'dark' | 'system') => {},
});

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<'light' | 'dark' | 'system'>('system');
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    (async () => {
      if (userId) {
        const { data } = await supabase
          .from('user_settings')
          .select('theme')
          .eq('user_id', userId)
          .single();
        if (data?.theme) {
          setThemePreferenceState(data.theme);
        }
      } else {
        const saved = await AsyncStorage.getItem(THEME_KEY);
        if (saved === 'dark' || saved === 'light' || saved === 'system') setThemePreferenceState(saved);
        else setThemePreferenceState('system');
      }
    })();
  }, [userId]);

  useEffect(() => {
    // Actualiza el modo real según la preferencia
    if (themePreference === 'system') {
      setMode(systemScheme === 'dark' ? 'dark' : 'light');
    } else {
      setMode(themePreference);
    }
  }, [themePreference, systemScheme]);

  const setThemePreference = async (pref: 'light' | 'dark' | 'system') => {
    setThemePreferenceState(pref);
    if (userId) {
      await supabase
        .from('user_settings')
        .upsert({ user_id: userId, theme: pref }, { onConflict: 'user_id' });
    } else {
      // Solo guarda en AsyncStorage si NO hay usuario
      await AsyncStorage.setItem(THEME_KEY, pref);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: themes[mode], mode, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);