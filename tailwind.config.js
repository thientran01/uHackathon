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
      colors: {
        // Muse design system — near-black surfaces + one cobalt accent.
        accent: { DEFAULT: '#3d63ff', hover: '#5577ff' },
        ink: { DEFAULT: '#101013', soft: '#17171b' },
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
