import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    screens: {
      xs: '480px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
    },
    extend: {
      colors: {
        // ── 1. Rose Principal (Couleur de marque HAFROSE) ─────────────────
        rose: {
          50: '#FDF7F8',
          100: '#FBF0F2',
          200: '#F6DFE4',
          300: '#EEBFCA',
          400: '#E297A9',
          500: '#D9778F', // Main Rose Accent
          600: '#C45772',
          700: '#A53E58',
          800: '#89344A',
          900: '#732F41',
        },

        // ── 2. Bordeaux (Luxe & Élégance Majeure) ───────────────────────────
        burgundy: {
          50: '#F8F1F3',
          100: '#F0E0E5',
          200: '#DFC2CB',
          300: '#C79BA9',
          400: '#AC6D81',
          500: '#8A1538', // Main Burgundy Brand
          600: '#7B1231',
          700: '#670E28',
          800: '#560E23', // Deep Luxury Burgundy
          900: '#480F20',
          950: '#2D0512',
        },

        // ── 3. Crème & Blanc Cassé (Fondations Visuelles) ─────────────────
        cream: {
          50: '#FFFFFF',  // Pure White
          100: '#FAF6F0', // Main Background Cream
          200: '#F5EFEB', // Soft Ivory Layer
          300: '#F0E8E1', // Warm Sand Layer
          400: '#E4D9CE',
          500: '#D5C5B6',
          600: '#BDB0A3',
          700: '#9B8E82',
          800: '#7A6F65',
          900: '#5E544C',
        },

        // ── 4. Or Champagne (Accents Luxury) ────────────────────────────────
        gold: {
          50: '#FCFBF5',
          100: '#FAF6E6',
          200: '#F2E8C4',
          300: '#E6D494',
          400: '#DDBE65',
          500: '#D4AF37', // Main Metallic Champagne Gold
          600: '#B89228',
          700: '#93701E',
          800: '#77571E',
          900: '#64471D',
        },

        // ── 5. Neutres (Gris Clair à Noir Profond) ─────────────────────────
        neutral: {
          50: '#FAFAFA',
          100: '#F4F4F5', // Light Gray Border & Subtle Surface
          200: '#E4E4E7', // Muted Divider
          300: '#D4D4D8', // Form Input Border
          400: '#A1A1AA', // Placeholder Text
          500: '#71717A', // Secondary Muted Text
          600: '#52525B', // Body Text Muted
          700: '#3F3F46', // Subheadings
          800: '#27272A', // Main Headings Text
          900: '#18181B', // Deep Charcoal
          950: '#09090B', // Pure Noir Luxury
        },

        // ── 6. Couleurs Système & Feedback ─────────────────────────────────
        success: {
          50: '#F0FDF4',
          100: '#DCFCE7',
          500: '#16A34A',
          600: '#15803D',
          700: '#166534',
        },
        warning: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          500: '#D97706',
          600: '#B45309',
          700: '#92400E',
        },
        error: {
          50: '#FEF2F2',
          100: '#FEE2E2',
          500: '#DC2626',
          600: '#B91C1C',
          700: '#991B1B',
        },
        info: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          500: '#2563EB',
          600: '#1D4ED8',
          700: '#1E40AF',
        },
      },

      fontFamily: {
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },

      fontSize: {
        'display-2xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }], // 72px
        'display-xl': ['3.75rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],   // 60px
        'display-lg': ['3rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],    // 48px
        h1: ['2.25rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],             // 36px
        h2: ['1.875rem', { lineHeight: '1.25', letterSpacing: '-0.01em' }],           // 30px
        h3: ['1.5rem', { lineHeight: '1.3', letterSpacing: '0em' }],                  // 24px
        h4: ['1.25rem', { lineHeight: '1.35', letterSpacing: '0em' }],                 // 20px
        h5: ['1.125rem', { lineHeight: '1.4', letterSpacing: '0em' }],                 // 18px
        h6: ['1rem', { lineHeight: '1.45', letterSpacing: '0em' }],                    // 16px
        'body-lg': ['1.125rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],       // 18px
        'body-base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.01em' }],        // 16px
        'body-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.01em' }],       // 14px
        caption: ['0.75rem', { lineHeight: '1.4', letterSpacing: '0.05em' }],         // 12px
        badge: ['0.6875rem', { lineHeight: '1', letterSpacing: '0.1em' }],            // 11px
      },

      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.02em',
        tight: '-0.01em',
        normal: '0em',
        wide: '0.05em',
        wider: '0.1em',
        widest: '0.2em',
        luxury: '0.15em',
        'luxury-wide': '0.25em',
      },

      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '26': '6.5rem',
        '30': '7.5rem',
      },

      boxShadow: {
        'hafrose-xs': '0 1px 2px 0 rgba(26, 26, 26, 0.03)',
        'hafrose-sm': '0 2px 8px 0 rgba(26, 26, 26, 0.04)',
        'hafrose-md': '0 4px 16px -2px rgba(26, 26, 26, 0.06), 0 2px 4px -2px rgba(26, 26, 26, 0.02)',
        'hafrose-lg': '0 12px 32px -4px rgba(26, 26, 26, 0.08), 0 4px 8px -2px rgba(26, 26, 26, 0.03)',
        'hafrose-xl': '0 24px 48px -12px rgba(26, 26, 26, 0.12)',
        'hafrose-hover': '0 12px 28px -6px rgba(138, 21, 56, 0.12), 0 4px 12px -2px rgba(26, 26, 26, 0.04)',
        'hafrose-card': '0 1px 3px 0 rgba(26, 26, 26, 0.04), 0 10px 24px -5px rgba(26, 26, 26, 0.05)',
        'hafrose-modal': '0 20px 60px -10px rgba(0, 0, 0, 0.25)',
        'hafrose-glow': '0 0 20px 2px rgba(212, 175, 55, 0.25)',
        'hafrose-inner': 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.04)',
      },

      borderRadius: {
        none: '0px',
        xs: '2px',
        sm: '4px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
        '3xl': '24px',
        full: '9999px',
      },

      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 1, 0.5, 1)',
        'luxury-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'luxury-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },

      transitionDuration: {
        '150': '150ms',
        '250': '250ms',
        '350': '350ms',
        '500': '500ms',
        '700': '700ms',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },

      animation: {
        'fade-in': 'fadeIn 250ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'fade-out': 'fadeOut 200ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'slide-up': 'slideUp 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'slide-down': 'slideDown 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'slide-left': 'slideLeft 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'slide-right': 'slideRight 350ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        'scale-up': 'scaleUp 250ms cubic-bezier(0.25, 1, 0.5, 1) forwards',
        shimmer: 'shimmer 1.8s infinite',
        float: 'float 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
