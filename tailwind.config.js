/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f172a', // Slate 900
        surface: '#1e293b', // Slate 800
        primary: '#8b5cf6', // Violet 500
        'primary-hover': '#7c3aed', // Violet 600
        secondary: '#ec4899', // Pink 500
        accent: '#06b6d4', // Cyan 500
        success: '#10b981', // Emerald 500
        warning: '#f59e0b', // Amber 500
        error: '#ef4444', // Red 500
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
      },
    },
  },
  plugins: [],
}
