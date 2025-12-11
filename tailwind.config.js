/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette (60-30-10 rule)
        'carbon-base': '#2B2D33',     // Primary Base (60%) - Main backgrounds, navigation
        'slate-mist': '#E8EBF0',      // Secondary (30%) - Text content, secondary backgrounds
        'mint-pulse': '#72F5C9',      // Accent (10%) - CTAs, active states, highlights
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'DM Sans', 'sans-serif'],
      },
      fontSize: {
        // Mobile-first typography
        'body-mobile': '16px',
        'body-desktop': '18px',
        'secondary': '14px',
      },
      spacing: {
        // Base unit: 8px
        '18': '4.5rem',  // 72px
        '22': '5.5rem',  // 88px
        '26': '6.5rem',  // 104px
      },
      boxShadow: {
        'mint': '0 4px 16px rgba(114, 245, 201, 0.3)',
        'mint-lg': '0 8px 32px rgba(114, 245, 201, 0.4)',
        'dark': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'dark-lg': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      },
      backgroundImage: {
        'hero-pattern': "linear-gradient(to right bottom, rgba(43, 45, 51, 0.4), rgba(43, 45, 51, 0.5))",
      }
    },
  },
  plugins: [],
}
