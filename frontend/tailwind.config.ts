import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        night: "#0c0612",
        plum: "#2a1040",
        ink: "#fff3ea",
        rose: "#ff7fa9",
        gold: "#f4c97a",
        violet: "#8a63d8",
        amber: "#ffb454",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 10px 40px rgba(255,127,169,0.35)",
        frame: "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(255,127,169,0.2)",
        "glow-lg": "0 0 60px rgba(244,201,122,0.45), 0 30px 60px rgba(0,0,0,0.5)",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        "glow-pulse": {
          "0%,100%": { opacity: "0.55", filter: "brightness(1)" },
          "50%": { opacity: "1", filter: "brightness(1.25)" },
        },
        breathe: {
          "0%,100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.035)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(18px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.2", transform: "scale(0.8)" },
          "50%": { opacity: "1", transform: "scale(1.15)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        float: "float 3.4s ease-in-out infinite",
        shimmer: "shimmer 6s linear infinite",
        "glow-pulse": "glow-pulse 2.6s ease-in-out infinite",
        breathe: "breathe 4.5s ease-in-out infinite",
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        twinkle: "twinkle 2.2s ease-in-out infinite",
        "spin-slow": "spin-slow 14s linear infinite",
      },
      transitionTimingFunction: {
        silk: "cubic-bezier(0.22, 1, 0.36, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
