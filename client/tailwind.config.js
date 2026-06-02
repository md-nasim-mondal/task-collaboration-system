/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border-color))",
        input: "hsl(var(--border-color))",
        ring: "hsl(var(--primary))",
        background: "hsl(var(--bg-primary))",
        foreground: "hsl(var(--text-primary))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: "hsl(var(--text-secondary))",
        "secondary-bg": "hsl(var(--bg-secondary))",
        muted: "hsl(var(--text-muted))",
        accent: {
          DEFAULT: "hsl(var(--accent))",
        },
      },
    },
  },
  plugins: [],
}
