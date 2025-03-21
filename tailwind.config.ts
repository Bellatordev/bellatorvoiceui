
import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        agent: {
          background: "hsl(var(--agent-background))",
          foreground: "hsl(var(--agent-foreground))",
          primary: "hsl(var(--agent-primary))",
          secondary: "hsl(var(--agent-secondary))",
          accent: "hsl(var(--agent-accent))",
          yellow: "hsl(var(--agent-yellow))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["Poppins", ...fontFamily.sans],
        serif: ["Playfair Display", ...fontFamily.serif],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "wave-1": {
          "0%, 100%": { height: "8px" },
          "50%": { height: "16px" }
        },
        "wave-2": {
          "0%, 100%": { height: "8px" },
          "25%": { height: "24px" },
          "75%": { height: "12px" }
        },
        "wave-3": {
          "0%, 100%": { height: "8px" },
          "25%": { height: "32px" },
          "50%": { height: "16px" },
          "75%": { height: "24px" }
        },
        "wave-4": {
          "0%, 100%": { height: "8px" },
          "33%": { height: "16px" },
          "66%": { height: "24px" }
        },
        "wave-5": {
          "0%, 100%": { height: "8px" },
          "50%": { height: "20px" }
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "wave-1": "wave-1 1.2s infinite ease-in-out",
        "wave-2": "wave-2 1.3s infinite ease-in-out",
        "wave-3": "wave-3 1.5s infinite ease-in-out",
        "wave-4": "wave-4 1.4s infinite ease-in-out",
        "wave-5": "wave-5 1.1s infinite ease-in-out"
      },
      boxShadow: {
        'glow': '0 0 15px 2px rgba(139, 92, 246, 0.3)',
        'glow-sm': '0 0 10px 1px rgba(139, 92, 246, 0.2)',
        'glow-yellow': '0 0 15px 2px rgba(250, 204, 21, 0.3)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
