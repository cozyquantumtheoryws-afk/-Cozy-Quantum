
import React from 'react';

interface Props {
    stories: Record<number, string>;
    covers: Record<number, string>;
}

const GithubSync: React.FC<Props> = ({ stories, covers }) => {
  return (
    <div className="bg-gray-900 text-white p-6 rounded-3xl shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold font-mono text-sm uppercase tracking-widest text-gray-400">System Log</h2>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-bold text-green-500">ONLINE</span>
        </div>
      </div>
      <div className="font-mono text-xs space-y-2 text-gray-400">
        <p>&gt; Initializing sync protocol...</p>
        <p>&gt; Connected to repository: <span className="text-white">waveform-handyman</span></p>
        <p>&gt; Stories buffered: <span className="text-amber-400">{Object.keys(stories).length}</span></p>
        <p>&gt; Covers cached: <span className="text-amber-400">{Object.keys(covers).length}</span></p>
      </div>
      <button className="w-full mt-6 bg-gray-800 hover:bg-gray-700 text-white py-3 rounded-xl font-bold text-sm transition-colors border border-gray-700">
        Push to Archive
      </button>
    </div>
  );
};

export default GithubSync;
