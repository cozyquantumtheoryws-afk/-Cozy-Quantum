
import React from 'react';

const ResearchStation: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-xl overflow-hidden relative">
      <h2 className="text-xl font-bold text-amber-900 mb-4 serif relative z-10">Artie's Workbench</h2>
      
      {/* Interactive SVG Scene */}
      <div className="relative w-full aspect-video bg-amber-50 rounded-xl overflow-hidden border border-amber-200 shadow-inner">
        <svg className="w-full h-full" viewBox="0 0 800 500" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="skyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e0f2fe" />
              <stop offset="100%" stopColor="#bae6fd" />
            </linearGradient>
            <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7dd3fc" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            
            <style>{`
              @keyframes float { 0% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-5px) rotate(2deg); } 100% { transform: translateY(0px) rotate(0deg); } }
              @keyframes boatBob { 0% { transform: translateY(0px) rotate(-1deg); } 50% { transform: translateY(3px) rotate(1deg); } 100% { transform: translateY(0px) rotate(-1deg); } }
              @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes spin-reverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
              @keyframes steam { 0% { opacity: 0; transform: translateY(0) scale(0.5); } 50% { opacity: 0.6; } 100% { opacity: 0; transform: translateY(-20px) scale(1.5); } }
              @keyframes glowPulse { 0% { opacity: 0.8; } 50% { opacity: 0.4; } 100% { opacity: 0.8; } }
              
              .tool-hover { animation: float 4s ease-in-out infinite; transform-origin: center; cursor: pointer; }
              .boat { animation: boatBob 5s ease-in-out infinite; transform-origin: bottom center; }
              .gear-1 { transform-origin: 100px 100px; animation: spin 10s linear infinite; }
              .gear-2 { transform-origin: 160px 100px; animation: spin-reverse 10s linear infinite; }
              .steam-1 { animation: steam 3s ease-out infinite; animation-delay: 0s; }
              .steam-2 { animation: steam 3s ease-out infinite; animation-delay: 1.5s; }
              .quantum-glow { animation: glowPulse 2s ease-in-out infinite; }
            `}</style>
          </defs>

          {/* BACKGROUND: Wall & Window */}
          <rect x="0" y="0" width="800" height="500" fill="#fffbeb" /> {/* Cream Wall */}
          
          {/* Window Frame looking at Hex-Key Harbor */}
          <g transform="translate(450, 50)">
            <rect x="0" y="0" width="300" height="200" fill="#94a3b8" rx="4" />
            <rect x="10" y="10" width="280" height="180" fill="url(#skyGradient)" />
            {/* Water */}
            <rect x="10" y="120" width="280" height="70" fill="url(#waterGradient)" />
            
            {/* The Boat */}
            <g className="boat" transform="translate(140, 130)">
               <path d="M-20,0 L20,0 L15,10 L-15,10 Z" fill="#be185d" /> {/* Hull */}
               <path d="M0,0 L0,-25 L15,-10 Z" fill="#fb7185" /> {/* Sail */}
            </g>
            
            {/* Window Sash */}
            <rect x="145" y="10" width="10" height="180" fill="#94a3b8" />
            <rect x="10" y="95" width="280" height="10" fill="#94a3b8" />
          </g>

          {/* FOREGROUND: Desk Surface */}
          <rect x="0" y="300" width="800" height="200" fill="#78350f" /> {/* Oak Wood */}
          <rect x="0" y="300" width="800" height="10" fill="#451a03" opacity="0.3" /> {/* Shadow */}

          {/* ITEM: Steaming Coffee Mug */}
          <g transform="translate(650, 250)">
             <g className="steam-1">
               <path d="M10,-10 Q20,-30 10,-50" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" />
             </g>
             <g className="steam-2">
               <path d="M25,-10 Q35,-30 25,-50" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" />
             </g>
             <rect x="0" y="0" width="40" height="50" rx="5" fill="#1e3a8a" /> {/* Mug Body */}
             <path d="M40,10 Q50,10 50,25 Q50,40 40,40" stroke="#1e3a8a" strokeWidth="5" fill="none" /> {/* Handle */}
             <text x="5" y="30" fontSize="10" fill="#93c5fd" fontFamily="monospace">NASA</text>
          </g>

          {/* ITEM: New Books Stack (Near Boat View) */}
          <g transform="translate(580, 280) rotate(-5)">
            <rect x="0" y="0" width="60" height="15" fill="#be185d" rx="2" stroke="#831843" strokeWidth="1" />
            <text x="5" y="11" fontSize="6" fill="#fbcfe8" fontFamily="sans-serif" fontWeight="bold">TOAST</text>
          </g>
          <g transform="translate(585, 265) rotate(2)">
            <rect x="0" y="0" width="55" height="14" fill="#0f766e" rx="2" stroke="#134e4a" strokeWidth="1" />
             <text x="5" y="10" fontSize="6" fill="#ccfbf1" fontFamily="sans-serif" fontWeight="bold">GNOMES</text>
          </g>

          {/* ITEM: Quantum Gears (Toaster Parts?) */}
          <g transform="translate(50, 280)">
             <circle cx="100" cy="100" r="40" fill="#92400e" className="gear-1" stroke="#78350f" strokeWidth="2" strokeDasharray="10,5" />
             <circle cx="100" cy="100" r="15" fill="#fbbf24" />
             
             <circle cx="160" cy="100" r="30" fill="#b45309" className="gear-2" stroke="#78350f" strokeWidth="2" strokeDasharray="8,4" />
             <circle cx="160" cy="100" r="10" fill="#fbbf24" />
          </g>

          {/* ITEM: Floating Tools */}
          <g transform="translate(300, 350)" className="tool-hover" style={{animationDelay: '0s'}}>
             <rect x="0" y="0" width="120" height="10" fill="#64748b" rx="2" transform="rotate(-5)" /> {/* Wrench Handle */}
             <circle cx="0" cy="5" r="15" fill="#64748b" /> {/* Wrench Head */}
             <circle cx="0" cy="5" r="8" fill="#78350f" /> {/* Hole */}
          </g>

          <g transform="translate(450, 380)" className="tool-hover" style={{animationDelay: '1s'}}>
             <rect x="0" y="0" width="10" height="100" fill="#f59e0b" rx="2" transform="rotate(45)" /> {/* Screwdriver Handle */}
             <rect x="-2" y="-30" width="14" height="30" fill="#334155" transform="rotate(45)" /> {/* Shaft */}
          </g>

          {/* ITEM: Glowing Schematics */}
          <g transform="translate(150, 380) rotate(-10)">
             <rect x="0" y="0" width="120" height="80" fill="#fff" stroke="#94a3b8" />
             <path d="M10,10 L110,10 L110,70 L10,70 Z" fill="none" stroke="#3b82f6" strokeWidth="1" />
             <circle cx="60" cy="40" r="20" fill="none" stroke="#3b82f6" className="quantum-glow" />
             <path d="M60,20 L60,60 M40,40 L80,40" stroke="#3b82f6" strokeWidth="1" />
             <text x="20" y="75" fontSize="8" fill="#64748b" fontFamily="cursive">T-20 Timelines</text>
          </g>

        </svg>

        {/* CSS Overlay for Interactivity */}
        <div className="absolute top-4 left-4 bg-white/90 p-2 rounded-lg shadow-sm border border-amber-100">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span className="text-xs font-bold text-amber-900 uppercase">System Online</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchStation;
