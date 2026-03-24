import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          600: "#3563e9",
          700: "#264bc2"
        }
      }
    }
  },
  plugins: []
};

export default config;
