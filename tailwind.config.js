/**
 * OnlyTime Tailwind config (supports dark and light modes).
 * Tailwind v4 can run without a config, but we keep it explicit for this MVP.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono'],
      },
      colors: {
        // Semantic colors using CSS variables
        'page': 'var(--bg-page)',
        'card': {
          DEFAULT: 'var(--bg-card)',
          hover: 'var(--bg-card-hover)',
        },
        'input': {
          DEFAULT: 'var(--bg-input)',
          focus: 'var(--bg-input-focus)',
        },
        'primary': {
          DEFAULT: 'var(--text-primary)',
          inverse: 'var(--text-inverse)',
          fg: 'var(--text-inverse)',  // Alias for text on primary backgrounds
        },
        'secondary': 'var(--text-secondary)',
        'tertiary': 'var(--text-tertiary)',
        'border': {
          DEFAULT: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
          focus: 'var(--border-focus)',
        },
        'accent': {
          DEFAULT: 'var(--accent)',
          hover: 'var(--accent-hover)',
          text: 'var(--accent-text)',
        },
        'success': {
          DEFAULT: 'var(--success)',
          bg: 'var(--success-bg)',
          text: 'var(--success-text)',
        },
        'warning': {
          DEFAULT: 'var(--warning)',
          bg: 'var(--warning-bg)',
          text: 'var(--warning-text)',
        },
        'danger': {
          DEFAULT: 'var(--danger)',
          bg: 'var(--danger-bg)',
          text: 'var(--danger-text)',
        },
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
