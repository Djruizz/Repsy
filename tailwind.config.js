/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './components/**/*.{vue,js,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './composables/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#080b10',
          900: '#0b0f14',
          850: '#0e141b',
          800: '#121a24',
          750: '#172029',
          700: '#1d2733',
          600: '#2a3644',
          500: '#3a4858',
          400: '#586a7D'
        },
        lime: {
          DEFAULT: '#c6f135',
          400: '#d4f56b',
          500: '#c6f135',
          600: '#a9d10f',
          700: '#84a50c'
        },
        ember: {
          DEFAULT: '#ff7a45',
          500: '#ff7a45',
          600: '#f05d23'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace']
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      boxShadow: {
        glow: '0 0 0 1px rgba(198,241,53,0.15), 0 8px 30px -12px rgba(198,241,53,0.25)',
        card: '0 1px 0 0 rgba(255,255,255,0.04) inset, 0 12px 40px -24px rgba(0,0,0,0.8)'
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.95)', opacity: '0.7' },
          '70%': { transform: 'scale(1.3)', opacity: '0' },
          '100%': { opacity: '0' }
        }
      },
      animation: {
        'fade-up': 'fade-up 0.3s ease-out both',
        'pulse-ring': 'pulse-ring 1.8s ease-out infinite'
      }
    }
  },
  plugins: []
}
