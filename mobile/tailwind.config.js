/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./index.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        "bg-dark": "#1B262C",
        "bg-card": "#0F4C75",
        "brand-primary": "#3282B8",
        "text-light": "#BBE1FA",
      },
    },
  },
  plugins: [],
};
