/**
 * OnlyTime Tailwind config (dark-mode-only UI).
 * Tailwind v4 can run without a config, but we keep it explicit for this MVP.
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono'],
      },
    },
  },
  plugins: [],
}
