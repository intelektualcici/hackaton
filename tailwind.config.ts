import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: {
          50: "#fffaf1",
          100: "#f8edda",
          200: "#ead9be",
        },
        sea: {
          500: "#0e8fb4",
          600: "#08789c",
          700: "#075f7c",
        },
        sun: {
          400: "#f7b955",
          500: "#f59e32",
          600: "#dc7c16",
        },
        navy: {
          900: "#102033",
          800: "#172c42",
          700: "#25435f",
        },
      },
      boxShadow: {
        card: "0 18px 50px rgba(16, 32, 51, 0.12)",
        lift: "0 22px 55px rgba(8, 120, 156, 0.18)",
      },
      fontFamily: {
        heading: ["Manrope", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;
