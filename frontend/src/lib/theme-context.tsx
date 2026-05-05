'use client';

import { createContext, useContext, useEffect, useSyncExternalStore } from 'react';

type Theme = 'dark' | 'light';

const THEME_STORAGE_KEY = 'affinity-theme';
const THEME_CHANGE_EVENT = 'affinity-theme-change';

const ThemeContext = createContext<{ theme: Theme; toggle: () => void }>({
  theme: 'dark',
  toggle: () => {}
});

function getStoredTheme(): Theme {
  return localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function getServerTheme(): Theme {
  return 'dark';
}

function subscribeToThemeChanges(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getStoredTheme,
    getServerTheme
  );

  function applyTheme(next: Theme) {
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  function toggle() {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_STORAGE_KEY, next);
    applyTheme(next);
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
