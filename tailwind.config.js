/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        navy: {
          DEFAULT: '#4A7DBF',
          dark: '#4A7DBF',   /* dark mode accent */
          light: '#1B3A6B',  /* light mode accent */
          glow: 'rgba(74, 125, 191, 0.10)',
          subtle: 'rgba(74, 125, 191, 0.06)',
        },
        bronze: {
          DEFAULT: '#4A7DBF',
          dark: '#4A7DBF',   /* dark mode accent */
          light: '#1B3A6B',  /* light mode accent */
          glow: 'rgba(74, 125, 191, 0.10)',
          subtle: 'rgba(74, 125, 191, 0.06)',
        },
        surface: {
          primary: '#0A0E1A',   /* dark bg */
          secondary: '#111827', /* dark secondary */
          card: '#161D31',      /* dark card */
          hover: '#1E2740',     /* dark card hover */
        },
        surfaceLight: {
          primary: '#EDE9E0',   /* linen base */
          secondary: '#E5E0D6', /* linen secondary */
          card: '#FDFBF7',      /* cream card */
          hover: '#F7F3ED',     /* cream card hover */
        },
        /* CSS variable passthrough aliases */
        'bg-primary': 'var(--bg-primary)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'text-primary': 'var(--text-primary)',
        'text-muted': 'var(--text-muted)',
        'accent-navy': 'var(--accent-navy)',
        'accent-bronze': 'var(--accent-bronze)',
      },
      borderColor: {
        DEFAULT: 'var(--border)',
        hover: 'var(--border-hover)',
      },
      borderRadius: {
        card: 'var(--radius)',
      },
      transitionDuration: {
        DEFAULT: '300ms',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
        'navy': '0 0 20px rgba(74, 125, 191, 0.12)',
        'bronze': '0 0 20px rgba(74, 125, 191, 0.10)',
      },
      backgroundImage: {
        'signature': 'var(--gradient-signature)',
        'navy-btn': 'var(--gradient-navy)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease both',
        'fade-in-down': 'fadeInDown 0.6s ease both',
        'fade-in': 'fadeIn 0.6s ease both',
        'pulse-dot': 'pulseDot 2.5s ease-in-out infinite',
        blink: 'blink 1.2s ease-in-out infinite',
        'bounce-down': 'bounceDown 1.8s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
