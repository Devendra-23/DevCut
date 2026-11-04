/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        "seal-blue": "#DBF2FC",
        "navy-blue": "#072D59",
        "crimson-pink": "#FD5988",
      },
      boxShadow: {
        "neon-glow": "0 0 25px 3px rgba(253, 89, 136, 0.4)",
        "glass-panel": "inset 0 1px 1px 0 rgba(255, 255, 255, 0.2)",
      },
      animation: {
        "border-spin": "border-spin 4s linear infinite",
      },
      keyframes: {
        "border-spin": {
          "100%": {
            transform: "rotate(-360deg)",
          },
        },
      },
    },
  },
  plugins: [],
};
