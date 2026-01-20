
import React from 'react';

const ArtieChat: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm h-full max-h-[600px] flex flex-col">
      <h2 className="text-xl font-bold text-amber-900 mb-4 serif">Ask Artie</h2>
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-xl p-4 mb-4">
        <p className="text-gray-500 italic text-sm">"Hey there. Something shifting in your living room? Let's take a look."</p>
      </div>
      <div className="flex gap-2">
        <input type="text" placeholder="Describe the glitch..." className="flex-1 p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-500" />
        <button className="bg-amber-800 text-white p-3 rounded-xl font-bold">Send</button>
      </div>
    </div>
  );
};

export default ArtieChat;
