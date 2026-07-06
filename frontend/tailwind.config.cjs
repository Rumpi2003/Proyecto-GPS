module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ustay: {
          blue: "#2b82ea",
          "blue-dark": "#1a6fd3",
          "light-border": "#B6D5FE",
          bg: "#e3effd",
          card: "#f4f7fc",
          text: "#1e293b",
          muted: "#64748b",
        },
        danger: {
          low: "#fef2f2",
          DEFAULT: "#ef4444",
          hover: "#dc2626",
        },
        type: {
          title: "#2563EB",
          subtitle: "#1F2937",
          body: "#6B7280",
        },
      },
      borderRadius: {
        panel: "28px",
        "ustay-card": "18px",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(43, 130, 234, 0.08)",
      },
      fontFamily: {
        poppins: ["Poppins", "sans-serif"],
      },
      fontSize: {
        titulo: ["30px", { fontWeight: 600, lineHeight: "1.2" }],
        subtitulo: ["22px", { fontWeight: 400, lineHeight: "1.3" }],
        texto: ["18px", { lineHeight: "1.5" }],
      },
    },
  },
  plugins: [],
};
