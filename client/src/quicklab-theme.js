// quicklab-theme.js

export const colors = {
  primary: '#eab308', // yellow-500
  primaryDark: '#ca8a04', // yellow-600
  primaryLight: '#facc15', // yellow-400
  secondary: '#1e293b', // black-800
  accent: '#3b82f6', // blue-500
  accentDark: '#2563eb', // blue-600
  light: '#f8fafc', // slate-50
  dark: '#000000', // pure black
  darkSurface: '#0f172a', // slate-900
  success: '#22c55e', // green (from QuickMed)
  warning: '#f59e0b', // amber
  danger: '#ef4444', // red
  info: '#3b82f6', // blue
  text: {
    light: '#0f172a',
    dark: '#f8fafc',
    muted: {
      light: '#64748b',
      dark: '#94a3b8',
    },
  },
  border: {
    light: '#e2e8f0',
    dark: '#1e293b',
  },
};

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
};

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  yellow: '0 4px 14px 0 rgba(234, 179, 8, 0.39)', // yellow glow
  blue: '0 4px 14px 0 rgba(59, 130, 246, 0.39)', // blue glow
};

export const transitions = {
  fast: '150ms ease-in-out',
  normal: '200ms ease-in-out',
  slow: '300ms ease-in-out',
};

// Theme toggle functionality
export const initTheme = () => {
  const theme = localStorage.getItem('quicklab-theme') || 'light';
  document.documentElement.classList.toggle('dark', theme === 'dark');
  return theme;
};

export const toggleTheme = () => {
  const isDark = document.documentElement.classList.toggle('dark');
  localStorage.setItem('quicklab-theme', isDark ? 'dark' : 'light');
  return isDark ? 'dark' : 'light';
};

export const setTheme = (theme) => {
  document.documentElement.classList.toggle('dark', theme === 'dark');
  localStorage.setItem('quicklab-theme', theme);
};
