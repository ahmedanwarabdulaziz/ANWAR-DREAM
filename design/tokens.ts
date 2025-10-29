// Design tokens for luxury rewards app
export const tokens = {
  colors: {
    // Core brand colors - White theme with navy and orange
    white: '#FFFFFF',
    gray50: '#F9FAFB',
    gray100: '#F3F4F6',
    gray200: '#E5E7EB',
    gray300: '#D1D5DB',
    gray400: '#9CA3AF',
    gray500: '#6B7280',
    gray600: '#4B5563',
    gray700: '#374151',
    gray800: '#1F2937',
    gray900: '#111827',
    
    // Brand colors
    navy: '#1E3A8A', // Navy blue
    navyLight: '#3B82F6', // Lighter navy
    orange: '#F97316', // Orange
    orangeLight: '#FB923C', // Lighter orange
    
    // Semantic colors
    primary: '#1E3A8A', // Navy blue
    secondary: '#F97316', // Orange
    background: '#FFFFFF',
    surface: '#F9FAFB',
    muted: '#6B7280',
    success: '#16A34A',
    error: '#DC2626',
    warning: '#F59E0B',
  },
  
  radius: {
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    '2xl': '24px',
  },
  
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  },
  
  motion: {
    ease: 'cubic-bezier(0.33, 1, 0.68, 1)',
    durations: {
      fast: '150ms',
      normal: '250ms',
      slow: '400ms',
      slower: '600ms',
    },
  },
  
  spacing: {
    // 8-pt scale
    0: '0px',
    1: '8px',
    2: '16px',
    3: '24px',
    4: '32px',
    5: '40px',
    6: '48px',
    7: '56px',
    8: '64px',
    9: '72px',
    10: '80px',
    11: '88px',
    12: '96px',
  },
} as const

export type Tokens = typeof tokens
