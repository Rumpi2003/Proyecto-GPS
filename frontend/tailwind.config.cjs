module.exports = {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Los colores exactos de U-STAY
        ustay: {
          blue: '#2b82ea',       // El azul del Navbar y del título principal
          'blue-dark': '#1a6fd3',// Azul más oscuro para los botones/hovers
          bg: '#e3effd',         // El fondo celeste suave exterior
          card: '#f4f7fc',       // El fondo gris/azul de las tarjetas de universidades
          text: '#1e293b',       // Texto principal (slate-800)
          muted: '#64748b',      // Texto secundario (slate-500)
        },
        danger: {
          low: '#fef2f2',     // Rojo ultra claro (ideal para el fondo de una tarjeta de alerta)
          DEFAULT: '#ef4444', // Rojo estándar (para textos de error, iconos y botones)
          hover: '#dc2626',   // Rojo más oscuro (para cuando pasas el mouse por encima)
        },
      },
      borderRadius: {
        // El gran panel blanco central del mockup tiene esquinas muy redondeadas
        'panel': '28px',
        // Las fotos laterales y las tarjetas de las universidades
        'ustay-card': '18px',
      },
      boxShadow: {
        // Un sombreado muy sutil para que el panel flote sobre el fondo celeste
        'soft': '0 4px 20px -2px rgba(43, 130, 234, 0.08)',
      }
    },
  },
  plugins: [],
};