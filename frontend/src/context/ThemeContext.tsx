import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
      // Apply synchronously to avoid flash-of-wrong-theme on initial render
      document.documentElement.classList.toggle('dark', dark);
      return dark;
    }
    return false;
  });

  useEffect(() => {
    // Sync localStorage only — dark class is managed directly in toggleTheme
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => {
    const newDark = !isDarkMode;
    // 1. Paint the transition rule first
    document.documentElement.classList.add('theme-transitioning');
    // 2. Double rAF guarantees the browser has computed+painted the transition
    //    rule before we switch the dark class — otherwise both happen in the
    //    same style recalc and the transition is skipped entirely.
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.documentElement.classList.toggle('dark', newDark);
        setIsDarkMode(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
        setTimeout(() => {
          document.documentElement.classList.remove('theme-transitioning');
        }, 350);
      });
    });
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
