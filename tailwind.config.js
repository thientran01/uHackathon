/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      // Muse design system — semantic tokens backed by CSS variables that
      // flip per theme. Light/dark values are defined in src/muse/muse.css
      // and toggled by useHostTheme() writing data-theme on [data-muse-ui].
      colors: {
        accent: {
          DEFAULT: 'rgb(var(--muse-accent) / <alpha-value>)',
          hover: 'rgb(var(--muse-accent-hover) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--muse-surface) / <alpha-value>)',
          soft: 'rgb(var(--muse-surface-soft) / <alpha-value>)',
          raised: 'rgb(var(--muse-surface-raised) / <alpha-value>)',
        },
        line: 'rgb(var(--muse-line) / <alpha-value>)',
        fg: {
          DEFAULT: 'rgb(var(--muse-fg) / <alpha-value>)',
          muted: 'rgb(var(--muse-fg-muted) / <alpha-value>)',
          faint: 'rgb(var(--muse-fg-faint) / <alpha-value>)',
        },
      },
      // Muse motion — applied per Emil Kowalski's principles:
      // ease-out for entrances, custom curve, under 300ms, start scale > 0.
      keyframes: {
        // Panel entrance: scales up from ~0.96 (never from 0) and rises a touch.
        // Paired with `origin-bottom-right` so it grows out of the FAB corner.
        'muse-panel-in': {
          '0%': { opacity: '0', transform: 'translateY(8px) scale(0.96)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // Step-to-step content swap (intent -> questions -> edit). A small rise
        // plus a clearing blur to smooth an otherwise abrupt content change.
        'muse-step-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)', filter: 'blur(2px)' },
          '100%': { opacity: '1', transform: 'translateY(0)', filter: 'blur(0)' },
        },
        // The "Applied" success moment — a rare, delightful beat, so it earns one.
        'muse-rise-in': {
          '0%': { opacity: '0', transform: 'translateY(6px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        // Panel exit — mirrors the entrance, ~20% faster (Emil: exits can be quicker).
        'muse-panel-out': {
          '0%': { opacity: '1', transform: 'translateY(0) scale(1)' },
          '100%': { opacity: '0', transform: 'translateY(6px) scale(0.97)' },
        },
      },
      animation: {
        // cubic-bezier ~ easeOutExpo (easings.co) — strong ease-out, feels snappy.
        'muse-panel': 'muse-panel-in 220ms cubic-bezier(0.16, 1, 0.3, 1)',
        'muse-step': 'muse-step-in 160ms cubic-bezier(0.16, 1, 0.3, 1)',
        'muse-rise': 'muse-rise-in 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        'muse-panel-out': 'muse-panel-out 170ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
}
