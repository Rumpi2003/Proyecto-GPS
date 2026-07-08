import React from 'react';
import { Link } from 'react-router-dom';
import casaSvg from "../assets/iconos/casa.svg?raw";

export const BarraInferior = () => {
  const casaIcono = casaSvg
    .replace(/^.*?(<svg)/i, "$1")
    .replace("<svg", '<svg fill="#B6D5FE" width="28" height="28"');

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/60 py-2">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-center lg:justify-between">
        
        {/* Logo de U-STAY — solo en desktop */}
        <div className="hidden lg:block text-ustay-blue font-black italic tracking-tighter text-2xl select-none">
          U-STAY
        </div>

        {/* Casa de navegación — solo en mobile, centrada */}
        <Link
          to="/"
          className="lg:hidden active:scale-90 transition-transform leading-none"
          aria-label="Volver al inicio"
          dangerouslySetInnerHTML={{ __html: casaIcono }}
        />

      </div>
    </footer>
  );
};