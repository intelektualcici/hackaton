import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        mediterranean: {
          sunsetGold: "#F4B24A",
          adriaticBlue: "#2F8FA3",
          limestone: "#F6F2EA",
          charcoal: "#111512",
        },
        sand: {
          50: "#F6F2EA",
          100: "#EDE5D9",
          200: "#D8CDBF",
        },
        sea: {
          50: "#EAF4F6",
          100: "#D6E9ED",
          500: "#2F8FA3",
          600: "#267A8C",
          700: "#1E6070",
        },
        sun: {
          100: "#FCEED8",
          200: "#F8D79E",
          400: "#F4B24A",
          500: "#F4B24A",
          600: "#C98620",
        },
        navy: {
          900: "#111512",
          800: "#1D241F",
          700: "#343C36",
        },
      },
      boxShadow: {
        card: "0 18px 50px rgba(17, 21, 18, 0.12)",
        lift: "0 22px 55px rgba(47, 143, 163, 0.2)",
      },
      fontFamily: {
        heading: ["Manrope", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
