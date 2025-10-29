import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        muted: 'var(--color-muted)',
        success: 'var(--color-success)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        
        // New color palette
        white: 'var(--color-white)',
        gray50: 'var(--color-gray50)',
        gray100: 'var(--color-gray100)',
        gray200: 'var(--color-gray200)',
        gray300: 'var(--color-gray300)',
        gray400: 'var(--color-gray400)',
        gray500: 'var(--color-gray500)',
        gray600: 'var(--color-gray600)',
        gray700: 'var(--color-gray700)',
        gray800: 'var(--color-gray800)',
        gray900: 'var(--color-gray900)',
        navy: 'var(--color-navy)',
        navyLight: 'var(--color-navy-light)',
        orange: 'var(--color-orange)',
        orangeLight: 'var(--color-orange-light)',
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        body: ['var(--font-body)'],
      },
      transitionTimingFunction: {
        smooth: 'var(--ease-smooth)',
      },
      transitionDuration: {
        fast: 'var(--duration-fast)',
        normal: 'var(--duration-normal)',
        slow: 'var(--duration-slow)',
        slower: 'var(--duration-slower)',
      },
      spacing: {
        // 8-pt scale
        '0': '0px',
        '1': '8px',
        '2': '16px',
        '3': '24px',
        '4': '32px',
        '5': '40px',
        '6': '48px',
        '7': '56px',
        '8': '64px',
        '9': '72px',
        '10': '80px',
        '11': '88px',
        '12': '96px',
      },
    },
  },
  plugins: [],
}

export default config
