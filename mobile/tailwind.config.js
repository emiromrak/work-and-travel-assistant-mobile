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
        "bg-card-alt": "#0F3460",
        "bg-surface": "#162D3E",
        "bg-input": "#152238",
        "brand-primary": "#3282B8",
        "text-light": "#BBE1FA",
        "border-subtle": "#3282B830",
        "border-focus": "#3282B8",
      },
    },
  },
  plugins: [],
};
