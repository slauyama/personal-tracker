/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./node_modules/@slauyama/ui/dist/**/*.js"],
  darkMode: "media",
  theme: {
    extend: {
      fontFamily: {
        sans: ["Futura", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
