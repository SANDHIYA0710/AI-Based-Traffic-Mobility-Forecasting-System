/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0B10",
        panel: "#12141C",
        panelraised: "#181B26",
        gridline: "#242838",
        hairline: "#2B2E3C",
        accent: "#C9A961",
        signal: "#3FA772",
        critical: "#C7554A",
        caution: "#D6A94F",
        ink: "#F1EDE3",
        muted: "#9C9789",
        faint: "#5C594E",
      },
      fontFamily: {
        display: ["Playfair Display", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      boxShadow: {
        console: "inset 0 0 0 1px #2B2E3C",
        glow: "0 0 18px rgba(201,169,97,0.28)",
        glowcaution: "0 0 14px rgba(214,169,79,0.3)",
        glowgreen: "0 0 14px rgba(63,167,114,0.3)",
        glowred: "0 0 14px rgba(199,85,74,0.32)",
        luxe: "0 8px 30px rgba(0,0,0,0.45)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        blip: {
          "0%, 100%": { opacity: 0.4 },
          "50%": { opacity: 1 },
        },
        scan: {
          "0%": { backgroundPosition: "0 0" },
          "100%": { backgroundPosition: "0 40px" },
        },
      },
      animation: {
        sweep: "sweep 4s linear infinite",
        blip: "blip 2.4s ease-in-out infinite",
        scan: "scan 3s linear infinite",
      },
    },
  },
  plugins: [],
};
