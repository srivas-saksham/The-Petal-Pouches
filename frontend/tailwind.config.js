/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        // small brand palette example — tweak to your brand
        "tpp-pink": "#FF6FA3",
        "tpp-pastel": "#FFF1F6",
        "tpp-accent": "#7C4DFF"
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial"],
      },
      borderRadius: {
        "lg-soft": "1.25rem"
      }
    }
  },
  plugins: [
    // add plugin references here if you install them later
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
  ]
}
