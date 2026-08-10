import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        base: {
          bg: "#0B0E14",
          surface: "#12161F",
          surface2: "#1A2029",
          border: "#242C39",
        },
        signal: {
          DEFAULT: "#5EEAD4",
          dim: "#2DD4BF",
          glow: "rgba(94, 234, 212, 0.35)",
        },
        amber: {
          DEFAULT: "#F5A623",
          dim: "#C9821B",
        },
        ink: {
          primary: "#E9EDF3",
          muted: "#8B95A5",
          faint: "#5A6478",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      keyframes: {
        "sonar-ping": {
          "0%": { transform: "scale(1)", opacity: "0.6" },
          "100%": { transform: "scale(2.4)", opacity: "0" },
        },
        "wave-bar": {
          "0%, 100%": { transform: "scaleY(0.3)" },
          "50%": { transform: "scaleY(1)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
      animation: {
        "sonar-ping": "sonar-ping 1.8s cubic-bezier(0.2, 0.6, 0.4, 1) infinite",
        "wave-bar": "wave-bar 1s ease-in-out infinite",
        "fade-up": "fade-up 0.5s ease-out forwards",
        "fade-in": "fade-in 0.4s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
