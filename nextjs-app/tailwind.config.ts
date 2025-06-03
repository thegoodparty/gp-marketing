import type { Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./sanity/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      boxShadow: {
        layer: "0 35px 60px -15px rgba(0,0,0,0.3)",
      },
    },
  },
  plugins: [typography],
};

export default config;
