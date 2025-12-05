import React from 'react';
import Icons from './Icon';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-slate-950 flex flex-col items-center justify-center text-white">
      
      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/20 blur-[120px]" />
        <div className="absolute top-[40%] left-[50%] transform -translate-x-1/2 w-[60%] h-[60%] rounded-full bg-slate-800/20 blur-[100px]" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03]" 
           style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '30px 30px' }}>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center text-center p-6 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
        
        <div className="mb-8 p-4 bg-white/5 rounded-full ring-1 ring-white/10 shadow-2xl backdrop-blur-sm">
          <Icons.Book size={48} className="text-blue-400" strokeWidth={1.5} />
        </div>

        <h1 className="text-5xl md:text-7xl font-serif font-bold mb-4 tracking-tight bg-gradient-to-br from-white via-white to-gray-400 bg-clip-text text-transparent drop-shadow-sm">
          Bíblia Sagrada
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide mb-12 max-w-md">
          Leitura, estudo e meditação com inteligência e simplicidade.
        </p>

        <button 
          onClick={onStart}
          className="group relative px-8 py-4 bg-white text-slate-950 font-semibold rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 transition-all duration-300 flex items-center gap-3"
        >
          <span>Iniciar Leitura</span>
          <Icons.ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          
          {/* Button Glow Effect */}
          <div className="absolute inset-0 rounded-full ring-2 ring-white/50 animate-pulse opacity-50"></div>
        </button>
      </div>

      {/* Footer Quote */}
      <div className="absolute bottom-8 z-10 text-center px-4 opacity-60">
        <p className="font-serif italic text-sm text-gray-500">
          "Lâmpada para os meus pés é tua palavra, e luz para o meu caminho."
        </p>
        <p className="text-[10px] uppercase tracking-widest text-gray-600 mt-2">Salmos 119:105</p>
      </div>
    </div>
  );
};

export default LandingPage;
