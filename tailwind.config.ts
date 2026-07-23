import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#060D1A',
        'bg-secondary': '#0A192F',
        'accent-cyan': '#00E5FF',
        'accent-gold': '#FFB800',
        'status-green': '#00E676',
        'status-orange': '#FF9100',
        'status-red': '#FF1744',
        'text-primary': '#F8FAFC',
        'text-secondary': '#94A3B8',
      },
      fontFamily: {
        sans: ['var(--font-plus-jakarta)', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'xl': '0.75rem',
      },
    },
  },
  plugins: [],
};

export default config;
