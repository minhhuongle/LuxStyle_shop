import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'gold' | 'emerald' | 'sapphire' | 'ruby' | 'amethyst';

export interface AccentPalette {
  id: AccentColor;
  nameVi: string;
  nameEn: string;
  primary: string;
  secondary: string;
  glow: string;
  gradientClass: string;
  badgeGradientClass: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  hoverBorderClass: string;
  shadowClass: string;
  ringClass: string;
}

export const ACCENT_PALETTES: Record<AccentColor, AccentPalette> = {
  gold: {
    id: 'gold',
    nameVi: 'Vàng Hoàng Gia',
    nameEn: 'Imperial Gold',
    primary: '#d4af37',
    secondary: '#f7e7ce',
    glow: 'rgba(212, 175, 55, 0.35)',
    gradientClass: 'from-amber-600 via-amber-400 to-amber-200',
    badgeGradientClass: 'from-amber-500/20 via-amber-400/10 to-transparent',
    textClass: 'text-amber-400 dark:text-amber-400',
    bgClass: 'bg-amber-500 text-zinc-950',
    borderClass: 'border-amber-500/40',
    hoverBorderClass: 'hover:border-amber-400/80',
    shadowClass: 'shadow-amber-500/20',
    ringClass: 'focus:ring-amber-400/50',
  },
  emerald: {
    id: 'emerald',
    nameVi: 'Lục Bảo Quý Tộc',
    nameEn: 'Royal Emerald',
    primary: '#10b981',
    secondary: '#6ee7b7',
    glow: 'rgba(16, 185, 129, 0.35)',
    gradientClass: 'from-emerald-600 via-teal-400 to-emerald-200',
    badgeGradientClass: 'from-emerald-500/20 via-teal-400/10 to-transparent',
    textClass: 'text-emerald-400 dark:text-emerald-400',
    bgClass: 'bg-emerald-500 text-zinc-950',
    borderClass: 'border-emerald-500/40',
    hoverBorderClass: 'hover:border-emerald-400/80',
    shadowClass: 'shadow-emerald-500/20',
    ringClass: 'focus:ring-emerald-400/50',
  },
  sapphire: {
    id: 'sapphire',
    nameVi: 'Sapphire Huyền Bí',
    nameEn: 'Midnight Sapphire',
    primary: '#3b82f6',
    secondary: '#38bdf8',
    glow: 'rgba(59, 130, 246, 0.35)',
    gradientClass: 'from-blue-600 via-sky-400 to-indigo-200',
    badgeGradientClass: 'from-blue-500/20 via-sky-400/10 to-transparent',
    textClass: 'text-sky-400 dark:text-sky-400',
    bgClass: 'bg-sky-500 text-zinc-950',
    borderClass: 'border-sky-500/40',
    hoverBorderClass: 'hover:border-sky-400/80',
    shadowClass: 'shadow-sky-500/20',
    ringClass: 'focus:ring-sky-400/50',
  },
  ruby: {
    id: 'ruby',
    nameVi: 'Hồng Vàng & Ruby',
    nameEn: 'Rose Gold & Ruby',
    primary: '#f43f5e',
    secondary: '#fb7185',
    glow: 'rgba(244, 63, 94, 0.35)',
    gradientClass: 'from-rose-600 via-rose-400 to-amber-200',
    badgeGradientClass: 'from-rose-500/20 via-rose-400/10 to-transparent',
    textClass: 'text-rose-400 dark:text-rose-400',
    bgClass: 'bg-rose-500 text-white',
    borderClass: 'border-rose-500/40',
    hoverBorderClass: 'hover:border-rose-400/80',
    shadowClass: 'shadow-rose-500/20',
    ringClass: 'focus:ring-rose-400/50',
  },
  amethyst: {
    id: 'amethyst',
    nameVi: 'Thạch Anh Tím',
    nameEn: 'Royal Amethyst',
    primary: '#a855f7',
    secondary: '#c084fc',
    glow: 'rgba(168, 85, 247, 0.35)',
    gradientClass: 'from-purple-600 via-violet-400 to-fuchsia-200',
    badgeGradientClass: 'from-purple-500/20 via-violet-400/10 to-transparent',
    textClass: 'text-purple-400 dark:text-purple-400',
    bgClass: 'bg-purple-500 text-white',
    borderClass: 'border-purple-500/40',
    hoverBorderClass: 'hover:border-purple-400/80',
    shadowClass: 'shadow-purple-500/20',
    ringClass: 'focus:ring-purple-400/50',
  },
};

interface ThemeContextType {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  resolvedMode: 'dark' | 'light';
  accent: AccentColor;
  setAccent: (accent: AccentColor) => void;
  palette: AccentPalette;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

const THEME_MODE_KEY = 'luxestyle_theme_mode';
const THEME_ACCENT_KEY = 'luxestyle_theme_accent';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_MODE_KEY) as ThemeMode;
      return saved === 'dark' || saved === 'light' || saved === 'system' ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [accent, setAccentState] = useState<AccentColor>(() => {
    try {
      const saved = localStorage.getItem(THEME_ACCENT_KEY) as AccentColor;
      return saved && saved in ACCENT_PALETTES ? saved : 'gold';
    } catch {
      return 'gold';
    }
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Determine system preference
  const [systemIsDark, setSystemIsDark] = useState(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return true;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const listener = (e: MediaQueryListEvent) => setSystemIsDark(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, []);

  const resolvedMode: 'dark' | 'light' = useMemo(() => {
    if (mode === 'system') {
      return systemIsDark ? 'dark' : 'light';
    }
    return mode;
  }, [mode, systemIsDark]);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(THEME_MODE_KEY, newMode);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleMode = useCallback(() => {
    setMode(resolvedMode === 'dark' ? 'light' : 'dark');
  }, [resolvedMode, setMode]);

  const setAccent = useCallback((newAccent: AccentColor) => {
    setAccentState(newAccent);
    try {
      localStorage.setItem(THEME_ACCENT_KEY, newAccent);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const palette = useMemo(() => ACCENT_PALETTES[accent] || ACCENT_PALETTES.gold, [accent]);

  // Apply classes and CSS variables to root element
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light');
    root.classList.add(resolvedMode);
    root.setAttribute('data-theme', resolvedMode);
    root.setAttribute('data-accent', accent);

    // Dynamic CSS variables for luxury theming
    root.style.setProperty('--primary-accent', palette.primary);
    root.style.setProperty('--primary-glow', palette.glow);
    root.style.setProperty('--secondary-accent', palette.secondary);

    if (resolvedMode === 'dark') {
      root.style.colorScheme = 'dark';
      root.style.setProperty('--bg-main', '#090a10');
      root.style.setProperty('--bg-card', '#11131c');
      root.style.setProperty('--border-subtle', '#27272a');
      root.style.setProperty('--text-main', '#f9fafb');
      root.style.setProperty('--text-muted', '#9ca3af');
    } else {
      root.style.colorScheme = 'light';
      root.style.setProperty('--bg-main', '#f8f9fc');
      root.style.setProperty('--bg-card', '#ffffff');
      root.style.setProperty('--border-subtle', '#e5e7eb');
      root.style.setProperty('--text-main', '#111827');
      root.style.setProperty('--text-muted', '#6b7280');
    }
  }, [resolvedMode, accent, palette]);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      toggleMode,
      resolvedMode,
      accent,
      setAccent,
      palette,
      sidebarOpen,
      setSidebarOpen,
      toggleSidebar,
    }),
    [mode, setMode, toggleMode, resolvedMode, accent, setAccent, palette, sidebarOpen, setSidebarOpen, toggleSidebar]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
