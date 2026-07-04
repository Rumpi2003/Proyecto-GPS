import React from 'react';

export const TarjetaUniversidad = ({ nombre, direccion, logoUrl, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center gap-5 bg-ustay-card hover:bg-slate-200/60 p-4 rounded-ustay-card border border-slate-200/40 shadow-sm transition-all text-left group active:scale-[0.99]"
    >
      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center p-2.5 shadow-sm border border-slate-100 flex-shrink-0">
        <img 
          src={logoUrl} 
          alt={`Logo de ${nombre}`} 
          className="w-full h-full object-contain grayscale-[20%] group-hover:grayscale-0 transition-all"
        />
      </div>
      
      <div>
        <h4 className="text-lg font-bold text-ustay-text group-hover:text-ustay-blue transition-colors">
          {nombre}
        </h4>
        <p className="text-xs md:text-sm text-ustay-muted mt-0.5">
          {direccion}
        </p>
      </div>
    </button>
  );
};