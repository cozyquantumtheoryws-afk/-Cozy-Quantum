
import React, { useState, useEffect, useRef } from 'react';
import { BOOKS } from './constants';
import ArtieChat from './components/ArtieChat';
import ResearchStation from './components/ResearchStation';
import GithubSync from './components/GithubSync';
import { geminiService, decodeAudioData } from './services/geminiService';
import type { Book } from './types';
import { paymentService } from './services/paymentService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shop' | 'desk' | 'community'>('shop');
  const [hasApiKey, setHasApiKey] = useState(false);
  const [generatingBookId, setGeneratingBookId] = useState<number | null>(null);
  const [customCovers, setCustomCovers] = useState<Record<number, string>>({});
  const [generatedStories, setGeneratedStories] = useState<Record<number, string>>({});
  
  // Audio state
  const [playingBook, setPlayingBook] = useState<Book | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);
  const [currentNarratedStory, setCurrentNarratedStory] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Carousel state
  const [storyImages, setStoryImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [visualsLoading, setVisualsLoading] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const narrationLinesRef = useRef<string[]>([]);
  const [currentStoryLineIndex, setCurrentStoryLineIndex] = useState(0);

  useEffect(() => {
    const checkKey = async () => {
      // Mocked key check
      // const hasKey = await (window as any).aistudio.hasSelectedApiKey();
      setHasApiKey(true); // Default to true for demo
    };
    checkKey();
    return () => stopAudio();
  }, []);

  // Image Cycling Effect
  useEffect(() => {
    let interval: number;
    if (isPlaying && storyImages.length > 1) {
      interval = window.setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % storyImages.length);
      }, 8000); // Cycle every 8 seconds
    }
    return () => clearInterval(interval);
  }, [isPlaying, storyImages]);

  const handleOpenKeySelector = async () => {
    // await (window as any).aistudio.openSelectKey();
    alert("API Key Selector would open here");
    setHasApiKey(true);
  };

  const initAudio = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
  };

  const stopAudio = () => {
    if (currentSourceRef.current) {
      try {
        currentSourceRef.current.stop();
      } catch {}
      currentSourceRef.current = null;
    }
    setIsPlaying(false);
    setAudioLoading(false);
    setVisualsLoading(false);
    setErrorMessage(null);
  };

  const playFullStory = async (book: Book) => {
    initAudio();
    if (playingBook?.id === book.id && isPlaying) {
      stopAudio();
      return;
    }

    stopAudio();
    setPlayingBook(book);
    setAudioLoading(true);
    setVisualsLoading(true);
    setStoryImages([]);
    setCurrentImageIndex(0);
    setErrorMessage(null);

    try {
      // 1. Generate Story Content
      const storyText = await geminiService.generateStoryScript(book.title, book.problem, book.resolution);
      if (!storyText) throw new Error("Narrative waveform failed to materialize. Please try again.");
      setCurrentNarratedStory(storyText);
      setGeneratedStories(prev => ({ ...prev, [book.id]: storyText }));

      // 2. Start Visual Generation in Background (Requires API Key)
      if (hasApiKey) {
        (async () => {
          try {
            const prompts = await geminiService.generateStoryboardPrompts(storyText);
            const imgs: string[] = [];
            for (const p of prompts) {
              const img = await geminiService.generateStoryboardImage(p);
              if (img) {
                imgs.push(img);
                setStoryImages(prev => [...prev, img]);
              }
            }
          } catch (e) {
            console.error("Visual gen failed", e);
          } finally {
            setVisualsLoading(false);
          }
        })();
      } else {
        setVisualsLoading(false);
      }

      // 3. TTS Narration Setup
      const audioCtx = audioContextRef.current;
      if (!audioCtx) throw new Error("Audio context not initialized.");

      // Split story text into lines for narration
      const narrationLines = storyText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
      narrationLinesRef.current = narrationLines; 

      // Start the sequence
      setAudioLoading(true);
      setIsPlaying(true);
      setCurrentStoryLineIndex(0); // This triggers the useEffect below

    } catch (error: any) {
      console.error("Narrative Error:", error);
      const isInternalError = error.message?.includes("500") || error.message?.includes("internal error");
      setErrorMessage(isInternalError ? "Artie's notes are a bit scrambled right now (Internal Error). Try once more!" : `Error: ${error.message}`);
      setAudioLoading(false);
      setVisualsLoading(false);
    } finally {
      // Any final cleanup if needed, though loading states are handled in catch/success paths usually
    }
  };

  // Effect to play audio when line index changes
  useEffect(() => {
    // Only play if we are officially 'playing' and have lines
    if (!isPlaying || !audioContextRef.current || narrationLinesRef.current.length === 0) return;
    
    // Safety check index
    if (currentStoryLineIndex < narrationLinesRef.current.length) {
        const line = narrationLinesRef.current[currentStoryLineIndex];
        
        const playLine = async () => {
            setAudioLoading(true);
            try {
                if (!geminiService) return;
                const buffer = await geminiService.speakAsArtie(line);
                if (!audioContextRef.current) return;
                
                const decoded = await decodeAudioData(buffer, audioContextRef.current);
                const source = audioContextRef.current.createBufferSource();
                source.buffer = decoded;
                source.connect(audioContextRef.current.destination);
                source.onended = () => {
                    currentSourceRef.current = null; // Clear ref when done
                    setCurrentStoryLineIndex(i => i + 1);
                };
                source.start();
                currentSourceRef.current = source;
                setAudioLoading(false);
            } catch (e: any) {
                console.error("Line Playback Failed", e);
                setErrorMessage(`Audio Error: ${e.message || 'Unknown'}. Key set?`);
                // Skip to next line on error so we don't get stuck
                setCurrentStoryLineIndex(i => i + 1);
            }
        };
        playLine();
    } else {
        // All lines played
        setIsPlaying(false);
        setAudioLoading(false);
        setCurrentStoryLineIndex(0); // Reset for next play
    }
  }, [currentStoryLineIndex, isPlaying]);

  const generateBookCover = async (book: Book) => {
    if (!hasApiKey) {
      await handleOpenKeySelector();
      return;
    }
    setGeneratingBookId(book.id);
    try {
      const prompt = `Cover for '${book.title}': ${book.problem}. Nostalgic coastal town with a magical quantum twist.`;
      const img = await geminiService.generateCover(prompt, '1K');
      if (img) setCustomCovers(prev => ({ ...prev, [book.id]: img }));
    } catch (e: any) {
      if (e.message?.includes("Requested entity was not found")) {
        setHasApiKey(false);
        await handleOpenKeySelector();
      }
    } finally {
      setGeneratingBookId(null);
    }
  };

  return (
    <div className="min-h-screen pb-40 bg-magical-50 bg-hero-pattern bg-cover bg-fixed bg-center">
      <header className="bg-white/70 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex justify-between items-center border-b border-magical-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-magical-800 rounded-lg flex items-center justify-center text-mystic-teal shadow-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-magical-900 serif tracking-tight">The Waveform Handyman</h1>
            <p className="text-[10px] text-magical-600 font-bold uppercase tracking-[0.2em]">Reality Repair Service</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!hasApiKey && (
            <button onClick={handleOpenKeySelector} className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-xs font-bold border border-amber-200 hover:bg-amber-200 transition-all">
              Unlock Full Visuals
            </button>
          )}
          <div 
             onClick={() => setActiveTab('desk')}
             className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-bold cursor-pointer transition-all ${activeTab === 'desk' ? 'bg-magical-800 text-white border-magical-900 ring-2 ring-amber-300' : 'bg-amber-100 border-amber-200 text-amber-800 hover:bg-amber-200 hover:scale-110'}`}
          >
            A
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide justify-center">
          {['shop', 'community'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab as any)} className={`px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${activeTab === tab ? 'bg-magical-800 text-white shadow-lg border-magical-800 scale-105' : 'bg-white/80 text-magical-600 border-white hover:bg-white hover:border-magical-200'}`}>
              {tab === 'shop' ? 'Storefront' : 'Community Board'}
            </button>
          ))}
        </div>

        {activeTab === 'shop' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {BOOKS.map(book => (
              <div key={book.id} className="bg-white/90 backdrop-blur-sm rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-mystic-purple/20 transition-all duration-500 border border-white flex flex-col group">
                <div className="relative aspect-[3/4] bg-magical-100 overflow-hidden">
                  <img src={customCovers[book.id] || book.image} alt={book.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${generatingBookId === book.id ? 'opacity-30 blur-sm' : ''}`} />
                  <div className="absolute inset-0 bg-magical-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button onClick={() => playFullStory(book)} className="bg-white/10 backdrop-blur-md p-4 rounded-full text-white hover:bg-white hover:text-magical-900 hover:scale-110 transition-all shadow-lg border border-white/20">
                      {playingBook?.id === book.id && isPlaying ? <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                    </button>
                  </div>
                  {generatingBookId === book.id && <div className="absolute inset-0 flex items-center justify-center bg-white/40"><div className="w-8 h-8 border-4 border-magical-600 border-t-transparent rounded-full animate-spin"></div></div>}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-magical-900 mb-2 serif leading-tight group-hover:text-magical-700 transition-colors">{book.title}</h3>
                  <p className="text-sm text-magical-500 mb-6 italic leading-relaxed">"{book.problem}"</p>
                  <div className="mt-auto flex items-center justify-between border-t border-magical-100 pt-4">
                    <div className="flex flex-col">
                      <span className="text-mystic-teal font-bold">{book.price}</span>
                      <span className="text-[10px] text-magical-400 uppercase font-mono">{book.wordCount} words</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => generateBookCover(book)} className="p-2 border border-magical-200 text-magical-400 rounded-lg hover:bg-magical-50 hover:text-magical-600 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
                      <button onClick={() => playFullStory(book)} className="bg-magical-800 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-magical-900 transition-colors shadow-lg shadow-magical-900/10">Listen Full Story</button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'desk' && (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-8">
              <GithubSync stories={generatedStories} covers={customCovers} />
              <ResearchStation />
            </div>
            <ArtieChat />
          </div>
        )}

        {activeTab === 'community' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-center serif text-amber-900 mb-8">Observation Bay Community Board</h2>
            {[
              { author: "Sarah W.", glitch: "My coffee turned into tea for exactly 30 seconds this morning, then switched back.", reply: "Temporal flavor-tunneling! Usually means your morning intentions aren't aligned with your cup's potentiality. Just stir counter-clockwise tomorrow." },
              { author: "Miller P.", glitch: "The lighthouse beam turned green and started humming jazz.", reply: "Local photons caught in a synesthetic loop. The lab was testing 'Smooth Frequencies' again. Give it a sharp tap with a rubber mallet." }
            ].map((p, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-[10px] font-bold text-amber-800">{p.author[0]}</div>
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{p.author}</span>
                </div>
                <p className="text-gray-800 serif italic text-lg mb-4 leading-relaxed">"{p.glitch}"</p>
                <div className="bg-amber-50/50 p-4 rounded-xl border-l-4 border-amber-600 flex gap-3">
                  <span className="text-xl">👴</span>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-tighter block mb-1">Artie's Take</span>
                    <p className="text-xs text-amber-900 leading-relaxed">{p.reply}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <footer className="text-center py-8 text-magical-400 text-xs font-serif opacity-60">
        <p>&copy; 2026 E.L. Finch. All timelines reserved.</p>
        <p className="mt-1">Recorded in Observation Bay.</p>
      </footer>

      {/* Persistent Audio & Visual Story Player */}
      {playingBook && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 p-6 flex flex-col items-center z-50 shadow-2xl animate-in slide-in-from-bottom duration-500">
          <div className="max-w-4xl w-full">
            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-100 flex items-center justify-between">
                <span>{errorMessage}</span>
                <button onClick={() => playFullStory(playingBook)} className="underline font-bold ml-4">Retry</button>
              </div>
            )}

            {/* Storyboard Carousel Area */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-6 shadow-inner border border-amber-50">
              {storyImages.length > 0 ? (
                <div className="relative w-full h-full">
                  {storyImages.map((img, idx) => (
                    <img key={idx} src={img} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${idx === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} alt={`Scene ${idx}`} />
                  ))}
                  {/* Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {storyImages.map((_, idx) => (
                      <div key={idx} className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white scale-125 shadow-md' : 'bg-white/40'}`} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-amber-800/40">
                  {visualsLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-bold uppercase tracking-widest animate-pulse">Artie is painting the scenes...</p>
                    </div>
                  ) : (
                    <div className="text-center p-8">
                       <p className="serif italic text-lg opacity-60 mb-2">"Gather 'round, I'll tell you how it went down..."</p>
                       {!hasApiKey && <p className="text-[10px] uppercase font-bold tracking-widest">Select API Key for AI Storyboards</p>}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Controls Row */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4 flex-1">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-amber-100 shadow-sm">
                  <img src={customCovers[playingBook.id] || playingBook.image} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-none mb-1">{playingBook.title}</h4>
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-tighter">
                    {audioLoading ? 'Tuning Frequencies...' : 'Narrated by Artie (Kore)'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button onClick={() => stopAudio()} className="p-3 text-gray-400 hover:text-amber-800 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h12v12H6z"/></svg>
                </button>
                <button 
                  onClick={() => playFullStory(playingBook)} 
                  disabled={audioLoading}
                  className="w-14 h-14 bg-amber-800 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all disabled:opacity-50"
                >
                  {isPlaying ? (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  ) : audioLoading ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  )}
                </button>
              </div>

              <div className="flex-1 flex justify-end">
                <button 
                  onClick={() => paymentService.initiateCheckout(playingBook.id, 'user_123')} // 'user_123' is placeholder till Auth is real
                  className="bg-magical-100 text-magical-900 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-magical-200 hover:bg-magical-200 transition-colors"
                >
                  Buy Vol. {playingBook.id} $1.99
                </button>
              </div>
            </div>

            {/* Transcription Overlay */}
            {isPlaying && currentNarratedStory && (
              <div className="mt-4 p-4 bg-amber-50/50 rounded-xl border border-amber-100 max-h-24 overflow-y-auto custom-scrollbar shadow-inner">
                <p className="text-[13px] text-amber-900 italic serif leading-relaxed">"{currentNarratedStory}"</p>
              </div>
            )}
          </div>
        </footer>
      )}
    </div>
  );
};

export default App;
