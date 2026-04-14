import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const ThemeContext = createContext();

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }) {
  const [themePref, setThemePref] = useState(() => localStorage.getItem('redo-theme') || 'light');

  const resolvedTheme = themePref === 'auto' ? getSystemTheme() : themePref;

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  useEffect(() => {
    if (themePref !== 'auto') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => document.documentElement.setAttribute('data-theme', getSystemTheme());
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [themePref]);

  const changeTheme = useCallback((t) => {
    setThemePref(t);
    localStorage.setItem('redo-theme', t);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: themePref, resolvedTheme, setTheme: changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
