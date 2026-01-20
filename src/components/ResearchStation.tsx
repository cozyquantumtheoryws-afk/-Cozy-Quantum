
import React from 'react';

const ResearchStation: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm">
      <h2 className="text-xl font-bold text-amber-900 mb-4 serif">Research Station</h2>
      <div className="space-y-4">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <h3 className="font-bold text-blue-900 text-sm mb-1">Active Scans</h3>
          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <div className="h-full bg-blue-600 w-2/3"></div>
          </div>
          <p className="text-xs text-blue-700 mt-2">Scanning local reality coherence...</p>
        </div>
        <div className="grid grid-cols-2 gap-4">
             <div className="bg-purple-50 p-4 rounded-xl text-center">
                <span className="text-2xl block mb-1">⚛️</span>
                <span className="text-xs font-bold text-purple-900">Quantum Flux</span>
             </div>
             <div className="bg-green-50 p-4 rounded-xl text-center">
                <span className="text-2xl block mb-1">🔋</span>
                <span className="text-xs font-bold text-green-900">Ether Levels</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchStation;
