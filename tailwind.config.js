/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{njk,html,js}", "./js/**/*.js"],
  theme: {
    extend: {
      colors: {
        primary: "#F59E0B",
        secondary: "#1e3a5f",
        navy: "#2c3e50",
        orange: {
          DEFAULT: "#F59E0B",
          600: "#d97706",
        },
      },
    },
  },
  plugins: [],
};
