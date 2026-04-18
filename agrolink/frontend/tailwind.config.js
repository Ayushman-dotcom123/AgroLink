/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        grape: {
          DEFAULT: '#442B48',
          light: '#5a3a5f',
          dark: '#2e1d31',
          50: '#f5f0f6',
          100: '#e8dcea',
          200: '#d0b8d4',
          300: '#b08fb6',
          400: '#8a6290',
          500: '#442B48',
          600: '#3a2440',
          700: '#2e1d31',
          800: '#221525',
          900: '#160e18',
        },
        olive: {
          DEFAULT: '#98B06F',
          light: '#b6dc76',
          dark: '#726E60',
          50: '#f6f9f0',
          100: '#eaf2dc',
          200: '#d4e5b8',
          300: '#b6dc76',
          400: '#98B06F',
          500: '#7d9558',
          600: '#637a45',
          700: '#726E60',
          800: '#4a4a3e',
          900: '#2e2e28',
        },
        lime: {
          DEFAULT: '#DBFF76',
          soft: '#B6DC76',
          muted: '#98B06F',
          50: '#fafff0',
          100: '#f3ffd6',
          200: '#DBFF76',
          300: '#B6DC76',
          400: '#98B06F',
          500: '#7d9558',
        },
        dimgrey: '#726E60',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        hindi: ['Noto Sans Devanagari', 'sans-serif'],
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'sway': 'sway 2s ease-in-out infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        sway: {
          '0%, 100%': { transform: 'rotate(-2deg)' },
          '50%': { transform: 'rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
      },
      boxShadow: {
        'grape': '0 4px 24px rgba(68,43,72,0.15)',
        'olive': '0 4px 24px rgba(152,176,111,0.25)',
        'lime': '0 4px 24px rgba(219,255,118,0.3)',
      },
    },
  },
  plugins: [],
}
