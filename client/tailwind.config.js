/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        primary: "#04585c",
        "primary-dark": "#023133",
        secondary: "#F4FCFC",
        black: "#081e24",
        white: "#ffffff",
        gray: "#758185",
        "gray-light": "#A9B2B5",
        line: "#DCE7E7",
      },
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Inter"', "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },

  plugins: [],
};
