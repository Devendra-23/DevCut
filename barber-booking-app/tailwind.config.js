/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        "icy-blue": "#F2F7FB",
        "deep-navy": "#0A1930",
        "muted-blue": "#4A6277",
        "soft-pink": "#FF7B93",
        "vibrant-pink": "#FF5A7A",
        lavender: "#B588D6",
      },
      boxShadow: {
        "pink-glow": "0 8px 32px -8px rgba(255, 90, 122, 0.5)",
        "glass-panel": "0 8px 32px 0 rgba(10, 25, 48, 0.05)",
      },
      animation: {
        "border-spin": "border-spin 4s linear infinite",
      },
      keyframes: {
        "border-spin": {
          "100%": { transform: "rotate(-360deg)" },
        },
      },
    },
  },
  plugins: [],
};
