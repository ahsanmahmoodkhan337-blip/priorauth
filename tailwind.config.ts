import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FFFFFF',
        'bg-secondary': '#F7F8FA',
        'bg-navy': '#0B1F3A',
        'bg-card': '#FFFFFF',
        'accent-gold': '#FAD23B',
        'accent-blue': '#1E5CD4',
        'accent-cyan': '#1E5CD4', // Maps to blue for backward compat
        'heading-navy': '#0D0F67',
        'status-green': '#00E676',
        'status-orange': '#FF9100',
        'status-red': '#FF1744',
        'text-primary': '#111827',
        'text-secondary': '#69727D',
        'border-light': '#E5E7EB',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'Inter', 'system-ui', 'sans-serif'],
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
