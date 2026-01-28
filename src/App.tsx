
import React, { useState, useEffect, useRef } from 'react';
import { BOOKS } from './constants';
import ArtieChat from './components/ArtieChat';
import ResearchStation from './components/ResearchStation';
import GithubSync from './components/GithubSync';
import { geminiService, decodeAudioData } from './services/geminiService';
import type { Book } from './types';
import { paymentService } from './services/paymentService';
import { supabase } from './lib/supabaseClient';
import { Footer } from './components/Footer';
import { MarketingDashboard } from './components/MarketingDashboard';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'shop' | 'desk' | 'community' | 'marketing' | 'admin'>('shop');
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
    
    // CRITICAL: Clear audio cache when switching books to prevent playing wrong book's audio
    audioCacheRef.current.clear();

    try {
      // 1. Generate Story Content - now fetches book-specific script from database
      const storyText = await geminiService.generateStoryScript(book.title, book.problem, book.resolution, book.id);
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

      // Split story text into paragraphs for better narration flow (preserves 'Mr.', 'Mrs.', etc.)
      // The script is joined by \n\n, so we split by that.
      const narrationLines = storyText.split(/\n\s*\n/).map(s => s.trim()).filter(s => s.length > 0);
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

  const audioCacheRef = useRef<Map<number, AudioBuffer>>(new Map());

  // Helper to fetch and cache a specific line
  const preloadLine = async (index: number) => {
    if (index >= narrationLinesRef.current.length || audioCacheRef.current.has(index)) return;
    
    try {
      const line = narrationLinesRef.current[index];
      const buffer = await geminiService.speakAsArtie(line);
      if (audioContextRef.current) {
        const decoded = await decodeAudioData(buffer, audioContextRef.current);
        audioCacheRef.current.set(index, decoded);
      }
    } catch (e) {
      console.warn(`Failed to preload line ${index}`, e);
    }
  };

  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  // Ambience & Music Effect
  useEffect(() => {
    if (isPlaying && playingBook) {
      // Handle Ambience
      if (ambienceRef.current && playingBook.audioAmbience) {
        const currentSrc = ambienceRef.current.src.replace(window.location.origin, '');
        if (currentSrc !== playingBook.audioAmbience) {
            ambienceRef.current.src = playingBook.audioAmbience;
        }
        ambienceRef.current.volume = 0.3; // Louder ocean/foghorn
        ambienceRef.current.play().catch(e => console.log('Ambience Autoplay prevented:', e));
      }

      // Handle Music
      if (musicRef.current && playingBook.backgroundMusic) {
        const currentMusicSrc = musicRef.current.src.replace(window.location.origin, '');
        if (currentMusicSrc !== playingBook.backgroundMusic) {
            musicRef.current.src = playingBook.backgroundMusic;
        }
        musicRef.current.volume = 0.1; // Subtle background jazz/noir
        musicRef.current.play().catch(e => console.log('Music Autoplay prevented:', e));
      }
    } else {
      // Pause both
      if (ambienceRef.current) ambienceRef.current.pause();
      if (musicRef.current) musicRef.current.pause();
    }
  }, [playingBook, isPlaying]);

  // Effect to play audio when line index changes
  useEffect(() => {
    // Only play if we are officially 'playing' and have lines
    if (!isPlaying || !audioContextRef.current || narrationLinesRef.current.length === 0) return;
    
    // Safety check index
    if (currentStoryLineIndex < narrationLinesRef.current.length) {
        
        const playLine = async () => {
            // Check cache first
            let decoded: AudioBuffer | undefined = audioCacheRef.current.get(currentStoryLineIndex);
            
            if (!decoded) {
               setAudioLoading(true);
               // Cache miss - fetch now
               const line = narrationLinesRef.current[currentStoryLineIndex];
               try {
                  const buffer = await geminiService.speakAsArtie(line);
                  if (audioContextRef.current) {
                     decoded = await decodeAudioData(buffer, audioContextRef.current);
                     // Cache it just in case
                     audioCacheRef.current.set(currentStoryLineIndex, decoded);
                  }
               } catch (e: any) {
                  console.error("Line Playback Failed", e);
                  setErrorMessage(`Audio Error: ${e.message || 'Unknown'}`);
                  setCurrentStoryLineIndex(i => i + 1);
                  return;
               }
               setAudioLoading(false);
            }

            if (!decoded || !audioContextRef.current) return;

            // Start Playback
            const source = audioContextRef.current.createBufferSource();
            source.buffer = decoded;
            source.connect(audioContextRef.current.destination);
            
            source.onended = () => {
                currentSourceRef.current = null;
                setCurrentStoryLineIndex(i => i + 1);
            };
            
            source.start();
            currentSourceRef.current = source;
            
            // WHILE PLAYING: Preload the next 2 lines
            preloadLine(currentStoryLineIndex + 1);
            preloadLine(currentStoryLineIndex + 2);
        };
        
        playLine();
    } else {
        // All lines played - Auto Close after a brief moment
        setIsPlaying(false);
        setAudioLoading(false);
        setCurrentStoryLineIndex(0);
        setTimeout(() => setPlayingBook(null), 2000); // Give them 2s to realize it's over, then close
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
      setGeneratingBookId(null);
    }
  };

  // Check for Payment Success Return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment_success') === 'true') {
        const bookId = Number(params.get('book_id'));
        if (bookId) {
            const book = BOOKS.find(b => b.id === bookId);
            setPlayingBook(book || null);
            
            // Show Success Modal
            setTimeout(async () => {
                const choice = confirm(
                    `🎉 PAYMENT SUCCESSFUL!\n\n` +
                    `Thank you for purchasing "${book?.title}".\n\n` +
                    `Click OK to download your ebook (TXT)\n` +
                    `Click Cancel to stream the audiobook now`
                );
                
                if (choice) {
                    // Download ebook/text version from database
                    try {
                        const { data, error } = await supabase.functions.invoke('get-download-url', {
                            body: { bookId, assetType: 'ebook' }
                        });
                        
                        if (error) throw error;
                        
                        if (data?.content) {
                            // Create and trigger download from content received from database
                            const element = document.createElement("a");
                            const file = new Blob([data.content], { type: 'text/plain;charset=utf-8' });
                            element.href = URL.createObjectURL(file);
                            element.download = data.filename || `Waveform_Handyman_Vol_${book?.id}.txt`;
                            document.body.appendChild(element);
                            element.click();
                            document.body.removeChild(element);
                            URL.revokeObjectURL(element.href);
                            
                            alert(`✅ Downloaded "${data.title || book?.title}"!\n\nEnjoy your quantum fiction adventure.`);
                        } else {
                            throw new Error('No content received');
                        }
                    } catch (e) {
                        console.error('Ebook download error:', e);
                        // Fallback to basic content
                        const element = document.createElement("a");
                        const file = new Blob([
                            `THE WAVEFORM HANDYMAN: VOL ${book?.id}\n`,
                            `${book?.title?.toUpperCase()}\n\n`,
                            `PROBLEM:\n${book?.problem}\n\n`,
                            `RESOLUTION:\n${book?.resolution}\n\n`,
                            `Thank you for your purchase!`
                        ], {type: 'text/plain'});
                        element.href = URL.createObjectURL(file);
                        element.download = `Waveform_Handyman_Vol_${book?.id}.txt`;
                        document.body.appendChild(element);
                        element.click();
                        document.body.removeChild(element);
                    }
                } else {
                    // User wants to stream - start playing
                    if (book) {
                        playFullStory(book);
                    }
                }
                
                // Clear URL params
                window.history.replaceState({}, document.title, window.location.pathname);
            }, 500);
        }
    }
  }, []);

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
          <button 
             onClick={() => setActiveTab('marketing')}
             className={`p-2 rounded-full transition-colors ${activeTab === 'marketing' ? 'bg-magical-800 text-mystic-teal' : 'text-magical-800/20 hover:text-magical-800'}`}
             title="Quantum Advertising Channel"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          <button 
             onClick={() => setActiveTab('admin')}
             className={`p-2 rounded-full transition-colors ${activeTab === 'admin' ? 'bg-magical-800 text-amber-400' : 'text-amber-500 hover:text-magical-800 hover:bg-amber-100'}`}
             title="Admin Panel"
          >
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
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
          <div className="flex justify-start">
            <div className="w-full lg:w-2/3 xl:w-1/2">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {BOOKS.map(book => (
                  <div key={book.id} className="bg-white/80 backdrop-blur-md rounded-2xl overflow-hidden shadow-lg border border-white/40 flex flex-col group hover:bg-white/95 transition-all duration-300">
                    <div className="relative aspect-[3/4] bg-magical-100 overflow-hidden">
                      <img src={customCovers[book.id] || book.image} alt={book.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${generatingBookId === book.id ? 'opacity-30 blur-sm' : ''}`} />
                      <div className="absolute inset-0 bg-magical-900/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                        <button onClick={() => playFullStory(book)} className="bg-white/20 backdrop-blur-md p-3 rounded-full text-white hover:bg-white hover:text-magical-900 hover:scale-110 transition-all shadow-lg border border-white/40">
                          {playingBook?.id === book.id && isPlaying ? <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> : <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>}
                        </button>
                      </div>
                      {generatingBookId === book.id && <div className="absolute inset-0 flex items-center justify-center bg-white/40"><div className="w-8 h-8 border-4 border-magical-600 border-t-transparent rounded-full animate-spin"></div></div>}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-magical-900 mb-1 serif leading-tight">{book.title}</h3>
                      <p className="text-xs text-magical-500 mb-4 italic leading-relaxed line-clamp-2">"{book.problem}"</p>
                      <div className="mt-auto flex items-center justify-between border-t border-magical-100 pt-3">
                        <span className="text-mystic-teal font-bold">{book.price}</span>
                        <div className="flex gap-2">
                          <button onClick={() => generateBookCover(book)} className="p-1.5 border border-magical-200 text-magical-400 rounded-lg hover:bg-magical-50 hover:text-magical-600 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg></button>
                          <button onClick={() => playFullStory(book)} className="bg-magical-800 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-magical-900 transition-colors shadow-md">Audition</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
        {activeTab === 'marketing' && (
          <div className="h-[calc(100vh-140px)]">
            <MarketingDashboard />
          </div>
        )}
        {activeTab === 'admin' && (
          <div className="h-[calc(100vh-140px)]">
            <AdminPanel />
          </div>
        )}
      </main>
      
      <Footer />
      
      {/* Hidden Ambience Player */}
      <audio ref={ambienceRef} loop />
      <audio ref={musicRef} loop />

      {/* Persistent Audio & Visual Story Player */}
      {playingBook && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-amber-100 p-6 flex flex-col items-center z-50 shadow-2xl animate-in slide-in-from-bottom duration-500">
          <div className="max-w-4xl w-full">
            {/* Close Button */}
            <button 
              onClick={() => { stopAudio(); setPlayingBook(null); }}
              className="absolute -top-12 right-0 bg-white/90 backdrop-blur text-gray-600 p-2 rounded-full shadow-md hover:bg-white hover:text-red-600 transition-colors"
              title="Close Player"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

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
                  onClick={() => paymentService.initiateCheckout(playingBook.id, 'user_123', playingBook.priceId)} // 'user_123' is placeholder till Auth is real
                  className="bg-magical-100 text-magical-900 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border border-magical-200 hover:bg-magical-200 transition-colors"
                >
                  Buy Vol. {playingBook.id} {playingBook.price}
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
