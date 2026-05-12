import type { Config } from 'tailwindcss'

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#38bdf8',
          hover: '#0284c7',
        },
        surface: {
          DEFAULT: '#1e293b',
          light: '#334155',
        },
        background: '#0f172a',
      },
    },
  },
  plugins: [],
} satisfies Config