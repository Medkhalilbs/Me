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
      },
      colors: {
        'accent-blue': 'var(--accent-blue)',
        'accent-purple': 'var(--accent-purple)',
        'bg-primary': 'var(--bg)',
        'bg-secondary': 'var(--bg-secondary)',
        'bg-card': 'var(--bg-card)',
        'bg-glass': 'var(--bg-glass)',
        'text-primary': 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
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
        glow: '0 0 20px var(--accent-glow-blue)',
      },
      backgroundImage: {
        gradient: 'var(--gradient)',
        'gradient-text': 'var(--gradient-text)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.7s ease both',
        'fade-in-down': 'fadeInDown 0.6s ease both',
        'fade-in': 'fadeIn 0.6s ease both',
        'pulse-logo': 'pulse-logo 1s ease-in-out infinite alternate',
        'loading-fill': 'loading-fill 1.4s ease forwards',
        blink: 'blink 2s ease-in-out infinite',
        'glow-pulse': 'glow-pulse 4s ease-in-out infinite alternate',
        'bounce-down': 'bounce-down 1.5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2.5s ease-in-out infinite',
        'spin-slow': 'spin 8s linear infinite',
      },
    },
  },
  plugins: [],
}
