/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Formal palette: deep navy ground, ivory type, muted brass accent.
        navy: {
          DEFAULT: '#0f1b2d',
          deep: '#0b1524',
          ink: '#0a1220',
          glow: '#22406a',
        },
        gold: {
          DEFAULT: '#c8a96a',
          soft: '#e3cf9f',
        },
        cream: '#f4f1eb',
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', 'sans-serif'],
        serif: ['"Instrument Serif"', 'Georgia', 'serif'],
      },
      maxWidth: {
        page: '84rem',
      },
    },
  },
  plugins: [],
};
