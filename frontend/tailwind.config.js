/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0d0f1a',
        card: '#141728',
        border: '#252a45',
        'border-light': '#2e3558',
        primary: {
          DEFAULT: '#6366f1',
          hover: '#5558e8',
          light: '#818cf8',
        },
        accent: {
          DEFAULT: '#22d3ee',
          hover: '#06b6d4',
        },
        muted: '#64748b',
        subtle: '#94a3b8',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
}
