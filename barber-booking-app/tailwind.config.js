/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Outfit", "sans-serif"],
      },
      colors: {
        "saffron-cherry": "#6F0317",
        "rose-red": "#E52150",
        "sunshine-yellow": "#F4EB06",
        "warm-ivory": "#FAF8F5",
        cream: "#F6F2EB",
      },
      boxShadow: {
        "rose-glow": "0 8px 32px -8px rgba(229, 33, 80, 0.4)",
        "yellow-glow": "0 8px 32px -8px rgba(244, 235, 6, 0.3)",
        "glass-panel": "0 8px 32px 0 rgba(111, 3, 23, 0.08)",
      },
    },
  },
  plugins: [],
};
