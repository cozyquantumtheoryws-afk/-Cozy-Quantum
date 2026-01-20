import React, { useState } from 'react';
import { BOOKS } from '../constants';
import type { Book } from '../types';

export const MarketingDashboard: React.FC = () => {
  const [selectedBook, setSelectedBook] = useState<Book>(BOOKS[0]);
  const [platform, setPlatform] = useState<'tiktok' | 'instagram' | 'twitter'>('tiktok');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateContent = async () => {
    setLoading(true);
    // In a real app, this would call Gemini. For now, we mock the "Agentic Marketing" generation
    // based on our deep knowledge of the books.
    
    await new Promise(r => setTimeout(r, 1500)); // Fake think time

    let content = "";
    const hook = selectedBook.problem.split(',')[0]; // Simple extraction
    
    if (platform === 'tiktok') {
        content = `🎬 **Video Concept: The Glitch Reaction**
        
[Visual: Camera point of view, shaking slightly. Sound: "Oh no, oh no" trending audio or LoFi beat.]

**On Screen Text:** "When ${hook.toLowerCase()}..."

[Cut to: You/Actor holding a wrench, looking exhausted but smiling.]

**On Screen Text:** "...and the manual just says 'Add more tea'." ☕️🛠️

**Caption:**
${selectedBook.title} is NOT your average repair job. 
Explore the store at cozyquantum.com 
#CozyQuantum #BookTok #SciFi #IndieAuthor #TheWaveformHandyman`;
    } else if (platform === 'instagram') {
        content = `📸 **Instagram Post / Story**

**Image Prompt:** A high-quality render of a ${selectedBook.title.split(' ').slice(-1)} glowing with magical energy on a wooden workbench. Coffee steam rising in the shape of a question mark.

**Caption:**
✨ Item #00${selectedBook.id}: ${selectedBook.title}
⚠️ Hazard: ${selectedBook.problem}
✅ Fix: ${selectedBook.resolution}

Grab your copy of this cozy mystery for just $1.99. Link in bio! 📖

#CozyMystery #SciFi #Reading #Bookstagram #CozyVibes`;
    }

    setGeneratedContent(content);
    setLoading(false);
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-magical-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-magical-900 text-white p-6">
        <h2 className="text-2xl font-bold serif flex items-center gap-3">
          <span className="text-3xl">📡</span> Quantum Marketing Console
        </h2>
        <p className="text-magical-300 text-sm mt-1">Broadcast hooks to the multiverse.</p>
      </div>

      <div className="p-8 flex-1 overflow-y-auto">
        <div className="grid md:grid-cols-2 gap-8 h-full">
          
          {/* Controls */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-magical-800 uppercase tracking-wider mb-2">Select Artifact</label>
              <select 
                value={selectedBook.id} 
                onChange={(e) => setSelectedBook(BOOKS.find(b => b.id === Number(e.target.value))!)}
                className="w-full p-4 rounded-xl border border-magical-200 bg-white text-magical-900 focus:ring-2 focus:ring-mystic-teal outline-none font-serif font-bold"
              >
                {BOOKS.map(b => (
                  <option key={b.id} value={b.id}>Vol {b.id}: {b.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-magical-800 uppercase tracking-wider mb-2">Target Dimension (Platform)</label>
              <div className="flex gap-2">
                {(['tiktok', 'instagram', 'twitter'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPlatform(p)}
                    className={`flex-1 py-3 rounded-lg font-bold text-sm capitalize transition-all ${
                      platform === p 
                      ? 'bg-magical-800 text-white shadow-lg scale-105' 
                      : 'bg-magical-50 text-magical-500 hover:bg-magical-100'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={generateContent}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-mystic-teal to-magical-600 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>✨ Generate Hook</>
              )}
            </button>
          </div>

          {/* Output Preview */}
          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6 flex flex-col relative">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Signal Output</h3>
            
            {generatedContent ? (
              <>
                <div className="flex-1 whitespace-pre-wrap font-mono text-sm text-gray-800 overflow-y-auto custom-scrollbar">
                  {generatedContent}
                </div>
                <button 
                    onClick={() => navigator.clipboard.writeText(generatedContent)}
                    className="mt-4 w-full py-3 bg-white border border-gray-200 rounded-lg text-gray-600 font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                    Copy to Clipboard
                </button>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-300 text-center p-8">
                <div className="space-y-2">
                  <span className="text-4xl block opacity-50">🕸️</span>
                  <p className="text-sm">Ready to spin the web.</p>
                </div>
              </div>
            )}
            
            {/* Phone Frame Decoration */}
            <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-red-400 animate-pulse" title="Recording" />
          </div>

        </div>
      </div>
    </div>
  );
};
