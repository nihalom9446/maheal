import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Malayalam fonts — loaded via next/font
        manjari: ['var(--font-manjari)', 'sans-serif'],
        gayathri: ['var(--font-gayathri)', 'sans-serif'],
        // Sans serif UI font
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'Georgia', 'serif'],
        arabic: ["'Noto Naskh Arabic'", "'Traditional Arabic'", 'Amiri', 'serif'],
      },
      colors: {
        // MAHEALL Institutional Forest Palette
        brand: {
          primary: '#063F35',
          dark: '#022C27',
          secondary: '#0A5C4D',
          light: '#EBF4F1',
          border: '#D3E4DE',
        },
        // Legacy and portal color palette aliases
        masjid: {
          deepGreen: '#022C27',
          green: '#063F35',
          gold: '#C9A646',
          sand: '#FAF6EA',
          muted: '#64736F',
        },
        pearl: {
          50: '#F7F8F5',
          100: '#EFEFEA',
          200: '#E2E4DE',
          300: '#D1D5CD',
        },
        canvas: {
          DEFAULT: '#F7F8F5',
          bg: '#F7F8F5',
          muted: '#EFEFEA',
          subtle: '#FAFBF8',
        },
        'canvas-bg': '#F7F8F5',
        surface: {
          DEFAULT: '#FFFFFF',
          secondary: '#F9FAFB',
        },
        ink: {
          DEFAULT: '#102522',
          muted: '#64736F',
          subtle: '#8C9A96',
          inverse: '#FFFFFF',
        },
        accent: {
          gold: '#C9A646',
          goldDark: '#9E7E2C',
          goldLight: '#F7F1DE',
          goldSubtle: '#FAF6EA',
        },
        // Semantic status colors
        status: {
          success: '#0A7A56',
          successLight: '#E6F6F0',
          warning: '#B37D14',
          warningLight: '#FEF7E6',
          danger: '#B91C1C',
          dangerLight: '#FEECEC',
        },
      },
      boxShadow: {
        'fine': '0 1px 3px 0 rgba(16, 37, 34, 0.04), 0 1px 2px -1px rgba(16, 37, 34, 0.04)',
        'elevated': '0 4px 20px -2px rgba(16, 37, 34, 0.06)',
        'card': '0 2px 10px 0 rgba(16, 37, 34, 0.03)',
        'glass-card': '0 4px 20px -2px rgba(6, 63, 53, 0.06)',
        'modal': '0 20px 40px -8px rgba(2, 44, 39, 0.25)',
      },
      borderRadius: {
        'card': '16px',
        'pill': '9999px',
      },
    },
  },
  plugins: [],
} satisfies Config;