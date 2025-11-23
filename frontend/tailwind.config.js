/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'tpppink': '#d95669',           // Primary accents, buttons, active states
        'tpppeach': '#F7E1D7',          // Backgrounds, card surfaces
        'tppgrey': '#DEDBD2',           // Table rows, dividers, borders
        'tppmint': '#B0C4B1',           // Success badges, positive indicators
        'tppslate': '#4A5759'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 8px rgba(74, 87, 89, 0.08)',
        'card': '0 4px 12px rgba(74, 87, 89, 0.06)',
        'hover': '0 8px 16px rgba(74, 87, 89, 0.12)',
      },
      borderRadius: {
        'DEFAULT': '0.5rem',
        'card': '0.75rem',
        'pill': '9999px',
      },
      spacing: {
        'sidebar': '16rem',      // 256px sidebar width
        'topbar': '4rem',        // 64px topbar height
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-in': 'slideIn 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
      transitionProperty: {
        'width': 'width',
        'spacing': 'margin, padding',
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    function({ addUtilities }) {
      const newUtilities = {
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#DEDBD2 transparent',
        },
        '.scrollbar-none': {
          'scrollbar-width': 'none',
          '-ms-overflow-style': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.glass': {
          'background': 'rgba(247, 225, 215, 0.8)',
          'backdrop-filter': 'blur(10px)',
          '-webkit-backdrop-filter': 'blur(10px)',
        },
      };
      addUtilities(newUtilities);
    },
  ],
}