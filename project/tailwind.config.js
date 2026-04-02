/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "sv-black": "#141414",
        "sv-dark": "#1F1F1F",
        "sv-card": "#2C2C2C",
        "sv-red": "#E50914",
        "sv-red-hover": "#B20710",
        "sv-text": "#FFFFFF",
        "sv-muted": "#B3B3B3",
        "sv-border": "#333333",
        "sv-primary": "#E50914",
        "sv-primary-hover": "#B20710",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
      },
      aspectRatio: {
        video: "16 / 9",
        poster: "2 / 3",
        backdrop: "16 / 6",
      },
      screens: {
        xs: "375px",
        sm: "640px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
    },
  },
  plugins: [],
};
