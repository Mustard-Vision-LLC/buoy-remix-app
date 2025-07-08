import type { Config } from "tailwindcss";

export default {
  content: [
    "./blocks/**/*.liquid",
    "./snippets/**/*.liquid",
    "./assets/tailwind.css",
  ],
  safelist: ["border-solid", "shadow-black", "text-white"],
  theme: {
    extend: {},
  },
  corePlugins: {
    preflight: false, // VERY IMPORTANT to prevent overriding merchant styles
  },
  // prefix: "bw-",
  plugins: [],
} satisfies Config;
