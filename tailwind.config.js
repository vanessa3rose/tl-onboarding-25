/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "theme-orange1": "var(--theme-orange1)",
        "theme-orange2": "var(--theme-orange2)",
        "theme-mint": "var(--theme-mint)",
        "theme-pine": "var(--theme-pine)",
        "theme-navy1": "var(--theme-navy1)",
        "theme-navy2": "var(--theme-navy2)",
        "theme-gray1": "var(--theme-gray1)",
        "theme-gray2": "var(--theme-gray2)",
        "theme-gray3": "var(--theme-gray3)",
        "theme-charcoal": "var(--theme-charcoal)",
      },
    },
  },
  plugins: [],
};
