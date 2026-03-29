/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#E8621A",
        secondary: "#C9963B",
        accent: "#F9874A",
        surface: "#1A1208",
        surface2: "#2A1B0E",
        card: "#2B1D11",
        hover: "#3A2818",
        "text-primary": "#FDF6EC",
        "text-secondary": "#CDBDA8",
        "text-disabled": "#8C7A63"
      }
    }
  },
  plugins: []
}
