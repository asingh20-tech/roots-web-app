module.exports = {
  content: ["./src/**/*.{html,js,ts,jsx,tsx}"],
  corePlugins: {
    preflight: true,
  },
  theme: {
    extend: {
      // ROOTS brand tokens (landing page + create tree dialog).
      colors: {
        roots: {
          ink: "#2e3b2c",
          muted: "#7a6e5c",
          faint: "#b0a48e",
          line: "#c8bfa8",
          surface: "#ede8dc",
          canvas: "#f5f0e8",
          paper: "#faf8f4",
          forest: "#4a5e47",
          "forest-deep": "#3d4f3b",
          error: "#9b4a32",
        },
      },
      fontFamily: {
        display: ["Lora", "Georgia", "serif"],
        body: ["Inter", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
