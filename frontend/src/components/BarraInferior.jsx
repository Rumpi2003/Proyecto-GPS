import React from 'react';

export const BarraInferior = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200/60 py-4">
      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">
        
        {/* Logo de U-STAY */}
        <div className="text-ustay-blue font-black italic tracking-tighter text-2x1 select-none">
          U-STAY
        </div>

      </div>
    </footer>
  );
};