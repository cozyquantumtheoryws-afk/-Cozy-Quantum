import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { BOOKS } from '../constants';

interface AudioStatus {
  [bookId: number]: 'pending' | 'generating' | 'success' | 'error';
}

import { MarketingDashboard } from './MarketingDashboard';

export const AdminPanel: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [activeAdminTab, setActiveAdminTab] = useState<'audio' | 'marketing'>('audio');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '877668') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Incorrect passcode');
    }
  };

  const [audioStatus, setAudioStatus] = useState<AudioStatus>({});
  const [messages, setMessages] = useState<string[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl p-8">
        <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-3xl mb-4">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-magical-900 mb-2">Admin Access Required</h2>
        <p className="text-magical-600 mb-6 text-sm">Please enter the master passcode.</p>
        
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            placeholder="Enter Passcode"
            className="w-full px-4 py-3 rounded-xl border border-magical-200 focus:ring-2 focus:ring-amber-400 outline-none font-mono text-center tracking-[0.5em]"
            autoFocus
          />
          {error && <p className="text-red-500 text-xs text-center font-bold">{error}</p>}
          <button 
            type="submit"
            className="w-full bg-magical-900 text-white py-3 rounded-xl font-bold hover:bg-magical-800 transition-colors"
          >
            Unlock Panel
          </button>
        </form>
      </div>
    );
  }

  const addMessage = (msg: string) => {
    setMessages(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const generateAudioForBook = async (bookId: number) => {
    setAudioStatus(prev => ({ ...prev, [bookId]: 'generating' }));
    addMessage(`Starting audio generation for Vol ${bookId}...`);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-book-audio', {
        body: { bookId }
      });
      
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      
      setAudioStatus(prev => ({ ...prev, [bookId]: 'success' }));
      addMessage(`✅ ${data.message}`);
      
    } catch (err: any) {
      setAudioStatus(prev => ({ ...prev, [bookId]: 'error' }));
      addMessage(`❌ Vol ${bookId} failed: ${err.message}`);
    }
  };

  const generateAllAudio = async () => {
    setIsGeneratingAll(true);
    addMessage('🚀 Starting batch audio generation for all 5 books...');
    
    for (const book of BOOKS) {
      await generateAudioForBook(book.id);
      // Small delay between requests
      await new Promise(r => setTimeout(r, 2000));
    }
    
    addMessage('🎉 Batch generation complete!');
    setIsGeneratingAll(false);
  };

  const getStatusIcon = (bookId: number) => {
    switch (audioStatus[bookId]) {
      case 'generating': return '⏳';
      case 'success': return '✅';
      case 'error': return '❌';
      default: return '○';
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-magical-200 h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-magical-900 to-magical-700 text-white p-6 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold serif flex items-center gap-3">
              <span className="text-3xl">🔧</span> Admin Control Panel
            </h2>
            <p className="text-magical-300 text-sm mt-1">Authorized Personnel Only</p>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={() => setActiveAdminTab('audio')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeAdminTab === 'audio' ? 'bg-white text-magical-900' : 'bg-magical-800 text-magical-300 hover:text-white'}`}
            >
                Audio Gen
            </button>
            <button 
                onClick={() => setActiveAdminTab('marketing')}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${activeAdminTab === 'marketing' ? 'bg-white text-magical-900' : 'bg-magical-800 text-magical-300 hover:text-white'}`}
            >
                Marketing
            </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {activeAdminTab === 'marketing' ? (
            <MarketingDashboard />
        ) : (
            <div className="p-8 grid md:grid-cols-2 gap-8">
            
            {/* Book List */}
            <div className="space-y-4">
                <h3 className="text-lg font-bold text-magical-900 flex items-center gap-2">
                <span>📚</span> Audio File Status
                </h3>
                
                <div className="space-y-2">
                {BOOKS.map(book => (
                    <div key={book.id} className="flex items-center justify-between p-3 bg-magical-50 rounded-xl">
                    <div className="flex items-center gap-3">
                        <span className="text-xl">{getStatusIcon(book.id)}</span>
                        <div>
                        <p className="font-bold text-sm text-magical-900">Vol {book.id}</p>
                        <p className="text-xs text-magical-600 truncate max-w-[200px]">{book.title}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => generateAudioForBook(book.id)}
                        disabled={audioStatus[book.id] === 'generating' || isGeneratingAll}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        audioStatus[book.id] === 'generating' 
                            ? 'bg-gray-200 text-gray-400 cursor-wait'
                            : 'bg-mystic-teal text-white hover:bg-magical-700'
                        }`}
                    >
                        {audioStatus[book.id] === 'generating' ? 'Working...' : 'Generate'}
                    </button>
                    </div>
                ))}
                </div>

                <button
                onClick={generateAllAudio}
                disabled={isGeneratingAll}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                    isGeneratingAll 
                    ? 'bg-gray-300 text-gray-500 cursor-wait'
                    : 'bg-gradient-to-r from-amber-500 to-amber-600 text-white hover:from-amber-600 hover:to-amber-700 shadow-lg'
                }`}
                >
                {isGeneratingAll ? (
                    <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating All...
                    </>
                ) : (
                    <>🎙️ Generate All 5 Audiobooks</>
                )}
                </button>
            </div>

            {/* Log Console */}
            <div className="flex flex-col">
                <h3 className="text-lg font-bold text-magical-900 flex items-center gap-2 mb-4">
                <span>📋</span> Generation Log
                </h3>
                <div className="flex-1 bg-magical-950 rounded-xl p-4 font-mono text-xs text-green-400 overflow-y-auto max-h-[400px]">
                {messages.length === 0 ? (
                    <p className="text-magical-500">Waiting for commands...</p>
                ) : (
                    messages.map((msg, i) => (
                    <p key={i} className="mb-1">{msg}</p>
                    ))
                )}
                </div>
                
                {messages.length > 0 && (
                <button 
                    onClick={() => setMessages([])}
                    className="mt-2 text-xs text-magical-500 hover:text-magical-700 self-end"
                >
                    Clear Log
                </button>
                )}
            </div>

            </div>
        )}
      </div>
    </div>
  );
};
