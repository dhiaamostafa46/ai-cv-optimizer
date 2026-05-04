import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366f1',
          hover: '#4f46e5',
        },
        secondary: '#64748b',
        background: '#0f172a',
        surface: 'rgba(255, 255, 255, 0.03)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
        text: {
          primary: '#f8fafc',
          secondary: '#94a3b8',
        },
        success: '#10b981',
      },
      fontFamily: {
        arabic: ['Tajawal', 'sans-serif'],
        english: ['Outfit', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config