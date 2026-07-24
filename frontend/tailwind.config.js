/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1320px" },
    },
    extend: {
      colors: {
        cream: "var(--cream)",
        "cream-deep": "var(--cream-deep)",
        paper: "var(--paper)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        muted: "var(--muted)",
        line: "var(--line)",
        sage: "var(--sage)",
        "sage-deep": "var(--sage-deep)",
        plum: "var(--plum)",
        accent: "var(--accent)",
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Hanken Grotesk', 'sans-serif'],
      },
      letterSpacing: { tightest: '-0.04em' },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
