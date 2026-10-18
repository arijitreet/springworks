/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1A24",
        "ink-soft": "#53636E",
        paper: "#EAEFF2",
        surface: "#FFFFFF",
        line: "#D3DDE2",
        water: {
          DEFAULT: "#0B6E8C",
          bright: "#16A3C7",
          deep: "#074C62",
        },
        good: "#1F9D6B",
        warn: "#B9821A",
        crit: "#C0433B",
      },
      fontFamily: {
        display: ['"Archivo"', "system-ui", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "10px",
      },
      boxShadow: {
        panel: "0 1px 0 rgba(14,26,36,0.04), 0 1px 2px rgba(14,26,36,0.06)",
      },
    },
  },
  plugins: [],
};
