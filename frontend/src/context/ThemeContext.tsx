import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { flushSync } from 'react-dom';

interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: (e?: React.MouseEvent) => void;
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

  const toggleTheme = useCallback((e?: React.MouseEvent) => {
    const newDark = !isDarkMode;

    // Pin the circle origin to where the user clicked (falls back to top-right)
    const x = e ? `${((e.clientX / window.innerWidth) * 100).toFixed(1)}%` : '95%';
    const y = e ? `${((e.clientY / window.innerHeight) * 100).toFixed(1)}%` : '4%';
    document.documentElement.style.setProperty('--vt-x', x);
    document.documentElement.style.setProperty('--vt-y', y);

    const apply = () => {
      // flushSync makes React render synchronously so the browser captures
      // the fully-updated DOM as the "new" snapshot — no half-rendered frames.
      flushSync(() => {
        document.documentElement.classList.toggle('dark', newDark);
        setIsDarkMode(newDark);
        localStorage.setItem('theme', newDark ? 'dark' : 'light');
      });
    };

    // View Transitions API: compositor-level crossfade — zero style recalc
    const docWithVT = document as Document & {
      startViewTransition?: (cb: () => void) => unknown;
    };
    if (docWithVT.startViewTransition) {
      docWithVT.startViewTransition(apply);
    } else {
      // Fallback: briefly enable a global color transition so the swap feels
      // smooth even on browsers without the View Transitions API.
      const root = document.documentElement;
      root.classList.add('theme-transitioning');
      apply();
      window.setTimeout(() => root.classList.remove('theme-transitioning'), 320);
    }
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
