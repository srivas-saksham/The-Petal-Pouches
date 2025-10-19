/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "tpp-pink": "#FF6FA3",
        "tpp-pastel": "#FFF1F6",
        "tpp-accent": "#7C4DFF"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
      },
      borderRadius: {
        "lg-soft": "1.25rem"
      }
    },
  },
  plugins: [],
}