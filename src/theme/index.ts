export const theme = {
  colors: {
    background: '#FFFFFF',
    surface: '#F8FAF9',
    primary: '#14B87A',
    primaryDark: '#0F8B5A',
    textPrimary: '#17342A',
    textSecondary: '#5E6D66',
    border: '#E4ECE8',
    success: '#1E9E63',
    warning: '#D98C24'
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 18,
    pill: 999
  },
  typography: {
    h1: 28,
    h2: 22,
    h3: 18,
    body: 15,
    caption: 13
  }
} as const;

export type AppTheme = typeof theme;
