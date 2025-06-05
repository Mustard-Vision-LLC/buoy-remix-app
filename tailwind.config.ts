import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--primary)",
        secondary: "var(--secondary)",
        background: "var(--background)",
        text: "var(--color)",
        border: "var(--border)",
        muted: "var(--disabled)",
        disabled: "var(--disabled)",
        container: "var(--container)",
        success: "var(--success)",
        "success-100": "var(--success-accent)",
        danger: "var(--danger)",
        "danger-100": "var(--danger-accent)",
        chat: "var(--inner-background)",
        "chat-border": "var(--inner-border)",
      },
      fontFamily: {
        poppins: ["Poppins", "ui-sans-serif", "system-ui"],
        sans: ["Poppins", "Inter", "ui-sans-serif", "system-ui"],
      },
      fontSize: {
        xxs: ["0.625rem", { lineHeight: "0.875rem" }],
      },
      spacing: {
        25: "6.25rem",
        45: "11.25rem",
        47: "11.75rem",
        29: "7.25rem",
        50: "12.5rem",
        100: "25rem",
      },
      padding: {
        13: "3.25rem",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
