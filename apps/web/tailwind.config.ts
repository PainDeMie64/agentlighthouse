import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#141821",
        harbor: "#0f766e",
        signal: "#eab308",
        paper: "#f7f6f1"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(20, 24, 33, 0.10)"
      }
    }
  },
  plugins: []
};

export default config;
