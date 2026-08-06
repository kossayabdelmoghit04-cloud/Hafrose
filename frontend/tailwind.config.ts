import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        hafrose: {
          burgundy: {
            DEFAULT: '#8A1538',
            deep: '#5C061C',
            mid: '#720925',
            light: '#A32148',
          },
          rose: {
            DEFAULT: '#D9778F',
            soft: '#EAA2B1',
            powder: '#F8D7DA',
            blush: '#FDF2F4',
          },
          cream: {
            DEFAULT: '#FAF6F0',
            ivory: '#F5EFEB',
            warm: '#F0E8E1',
          },
          gold: {
            DEFAULT: '#D4AF37',
            light: '#E5C158',
            dark: '#C5A028',
          },
          charcoal: {
            DEFAULT: '#1A1A1A',
            deep: '#121212',
            muted: '#2D2D2D',
          },
        },
      },
      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
