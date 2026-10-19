/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Quiet Luxury Palette - V2
        ink: '#0E0D0C',
        espresso: '#1A1613',
        cocoa: '#2A231D',
        taupe: '#5C5247',
        stone: '#9A8F82',
        sand: '#CDBBA2',
        champagne: '#E8DCC4',
        ivory: '#F5EFE4',
        bone: '#FBF8F2',
        brass: '#B08D57',
        bronze: '#8A6B3F',
        gilt: '#D9BE85',
        // Amber remapping preserved for admin panel compatibility
        amber: {
          50: '#FAF3E0',
          100: '#F5E3B0',
          200: '#EFD8A0',
          300: '#E8CE8F',
          400: '#D9B86C',
          500: '#C9A24B',
          600: '#A88132',
          700: '#8F6B23',
          800: '#6B5019',
          900: '#4A3711',
          950: '#2A1F0A',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
