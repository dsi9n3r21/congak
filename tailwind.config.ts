import type { Config } from "tailwindcss";

// Design direction: inspired by wau (traditional Malaysian kite) colors and
// paper-craft diamonds, not the generic cream/terracotta or dark/neon-green
// AI-default palettes. Numbers get a monospace treatment throughout, tying
// visually back to "congak" (mental arithmetic) — digits feel counted, not decorative.
// Purple (ungu) added later per Lynda's own reference design (mascot-led,
// game-like) — used for level/XP, Pintar chat, and selected states; kuning
// stays for CTAs and everyday warmth so the palette doesn't go all-purple.
const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    // Mobile-first: base styles target ~360px, breakpoints scale UP from there.
    screens: {
      sm: "480px",   // large phones
      md: "768px",   // tablets
      lg: "1024px",  // small laptops
      xl: "1280px",  // desktop
    },
    extend: {
      colors: {
        paper: "#FFFDF7",        // warm off-white, not the terracotta-cream default
        ink: "#1C2541",          // near-navy, used for all body text
        kuning: {                // marigold — primary brand / CTAs
          DEFAULT: "#F4A93B",
          dark: "#D98C1F",
          light: "#FCE3B4",
        },
        biru: {                  // kite-string blue — links, secondary actions
          DEFAULT: "#2E6F9E",
          dark: "#1F4E71",
          light: "#CFE4F2",
        },
        saga: {                  // kite red — errors, "needs improvement", alerts
          DEFAULT: "#E1543A",
          dark: "#B93F28",
          light: "#F9D9D0",
        },
        pandan: {                // success green — correct answers, mastery
          DEFAULT: "#3C9D6B",
          dark: "#2A7350",
          light: "#D3EEDF",
        },
        ungu: {                  // purple — primary brand accent (level/XP,
          DEFAULT: "#6D4AC4",    // Pintar chat, selected states), per Lynda's
          dark: "#4A2F8F",       // reference design; kuning stays for CTAs
          light: "#E7E0FA",      // that still want the marigold warmth
        },
      },
      fontFamily: {
        display: ["var(--font-baloo)", "system-ui", "sans-serif"],
        body: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        num: ["var(--font-jetbrains)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        kite: "1.25rem", // diamond-soft corners used across cards
      },
      boxShadow: {
        card: "0 2px 12px rgba(28,37,65,0.08)",
      },
    },
  },
  plugins: [],
};

export default config;
