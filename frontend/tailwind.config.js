/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          DEFAULT: '#0D3321',
          mid: '#1A5C3A',
          light: '#2E7D52',
        },
        gold: {
          DEFAULT: '#C8963E',
          light: '#E8B86D',
          pale: '#FDF3E3',
        },
        stone: '#E8E4DC',
        slate: '#6B7280',
        ink: '#1C1C1C',
        'off-white': '#F8F6F2',
        charity: '#7C3AED',
        coral: {
          DEFAULT: '#FF7B6B',
          hover: '#FA6856'
        }
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        heading: ['"DM Serif Display"', 'Georgia', 'serif'],
        sans: ['"DM Sans"', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Courier New"', 'monospace'],
      },
      fontSize: {
        hero: ['6rem', { lineHeight: '1.05', fontWeight: '700' }],
        display: ['4rem', { lineHeight: '1.1', fontWeight: '700' }],
        h1: ['3rem', { lineHeight: '1.15', fontWeight: '600' }],
        h2: ['2rem', { lineHeight: '1.2', fontWeight: '600' }],
        h3: ['1.5rem', { lineHeight: '1.3', fontWeight: '500' }],
        h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '500' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        30: '7.5rem',
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '24px',
        '2xl': '32px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.06)',
        md: '0 4px 12px rgba(0,0,0,0.10), 0 2px 4px rgba(0,0,0,0.06)',
        lg: '0 10px 30px rgba(0,0,0,0.12), 0 4px 8px rgba(0,0,0,0.08)',
        xl: '0 20px 50px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.10)',
        gold: '0 8px 24px rgba(200,150,62,0.35)',
        card: '0 2px 20px rgba(13,51,33,0.08)',
        hero: '0 40px 80px rgba(13,51,33,0.30)',
      },
      backgroundImage: {
        'gradient-hero': 'linear-gradient(135deg, #0D3321 0%, #1A5C3A 60%, #2E7D52 100%)',
        'gradient-gold': 'linear-gradient(135deg, #C8963E 0%, #E8B86D 100%)',
        'gradient-light': 'linear-gradient(180deg, #FFFFFF 0%, #F8F6F2 100%)',
        'card-overlay': 'linear-gradient(180deg, transparent 40%, rgba(13,51,33,0.85) 100%)',
        'draw-glow': 'radial-gradient(ellipse at center, rgba(200,150,62,0.2) 0%, transparent 70%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'count-up': 'countUp 1.2s ease-out both',
        'spin-settle': 'spinSettle 0.8s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-in': 'slideIn 0.3s cubic-bezier(0.16,1,0.3,1) both',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(24px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        countUp: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        spinSettle: {
          from: { transform: 'translateY(-100%)' },
          to: { transform: 'translateY(0)' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
