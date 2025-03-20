
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
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
        playfair: ["'Playfair Display'", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        agent: {
          background: "white",
          foreground: "hsl(240, 6%, 10%)",
          primary: "hsl(240, 60%, 59%)",
          secondary: "hsl(240, 55%, 92%)",
          accent: "hsl(240, 55%, 92%)",
        },
        premium: {
          accent: "#9b87f5",
          secondary: "#7E69AB",
          light: "#D6BCFA",
          dark: "#1A1F2C",
        },
        yellows: {
          soft: "#FEF7CD",
          muted: "#F9E48B",
          accent: "#F5CB5C",
          deep: "#F0B429",
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
      backgroundImage: {
        'gradient-premium-light': 'linear-gradient(135deg, #D6BCFA, #9b87f5, #7E69AB, #D6BCFA)',
        'gradient-premium-dark': 'linear-gradient(135deg, #1A1F2C, #403E43, #6E59A5, #1A1F2C)',
        'gradient-yellow': 'linear-gradient(135deg, #FEF7CD, #F9E48B, #F5CB5C, #F0B429)',
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
