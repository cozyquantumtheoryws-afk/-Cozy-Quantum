import React, { useState } from 'react';

type LegalDoc = 'privacy' | 'terms' | 'safety' | null;

export const Footer: React.FC = () => {
  const [activeDoc, setActiveDoc] = useState<LegalDoc>(null);

  const renderContent = () => {
    switch (activeDoc) {
      case 'privacy':
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Privacy Policy</h3>
            <p className="mb-2"><strong>1. Data Collection:</strong> We collect your email solely for the delivery of digital goods (Books/Audio). We do not share your timeline coordinates with third-party advertisers or the Bureau of Chronological Integrity.</p>
            <p className="mb-2"><strong>2. Cookies:</strong> This site uses strictly necessary cookies to keep your shopping cart in this dimension. No tracking pixels are used.</p>
            <p><strong>3. Deletion:</strong> You may request deletions of your data at any time by contacting Artie.</p>
          </>
        );
      case 'terms':
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Terms of Service</h3>
            <p className="mb-2"><strong>1. Digital Goods:</strong> All sales of "The Waveform Handyman" ebooks/audio are final once the download link is accessed, unless a file is corrupted by localized reality decay.</p>
            <p className="mb-2"><strong>2. Usage:</strong> You are granted a personal, non-exclusive license to enjoy these stories. Redistribution across the multiverse is prohibited.</p>
            <p><strong>3. Availability:</strong> We aim for 99.9% uptime, barring catastrophic entropy events.</p>
          </>
        );
      case 'safety':
        return (
          <>
            <h3 className="text-xl font-bold mb-4">Safety Disclaimers</h3>
            <p className="mb-2"><strong>Warning:</strong> These audio narrations may contain trace amounts of resonant frequencies. Do not listen while calibrating sensitive quantum equipment.</p>
            <p className="mb-2"><strong>Side Effects:</strong> Mild nostalgia, sudden craving for toast, and a sense that your furniture is watching you are normal side effects.</p>
            <p><strong>Liability:</strong> Cozy Quantum Fiction is not responsible for any accidental epiphanies regarding the nature of the universe.</p>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <footer className="mt-20 border-t border-magical-200/50 bg-white/40 backdrop-blur-md py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-magical-900 serif mb-2">The Waveform Handyman</h3>
              <p className="text-sm text-magical-600 mb-4">
                Premium reality repair services for the discerning timeline. 
                Certified by the Bureau of Chronological Integrity.
              </p>
              <span className="text-xs text-magical-400">
                © {new Date().getFullYear()} Cozy Quantum Fiction. All rights reserved.
              </span>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-bold text-magical-800 uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-magical-600 cursor-pointer">
                <li><button onClick={() => setActiveDoc('privacy')} className="hover:text-magical-900 transition-colors text-left hover:underline">Privacy Policy</button></li>
                <li><button onClick={() => setActiveDoc('terms')} className="hover:text-magical-900 transition-colors text-left hover:underline">Terms of Service</button></li>
                <li><button onClick={() => setActiveDoc('safety')} className="hover:text-magical-900 transition-colors text-left hover:underline">Safety Disclaimers</button></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-bold text-magical-800 uppercase tracking-wider mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-magical-600">
                <li><span className="block">Observation Bay, Sector 7G</span></li>
                <li><a href="mailto:cozyquantumtheoryws@gmail.com" className="hover:text-magical-900 transition-colors">cozyquantumtheoryws@gmail.com</a></li>
                <li className="flex gap-4 mt-4">
                   {/* Social Icons Placeholder */}
                   <div className="w-5 h-5 bg-magical-300 rounded-full opacity-50 hover:opacity-100 cursor-pointer"></div>
                   <div className="w-5 h-5 bg-magical-300 rounded-full opacity-50 hover:opacity-100 cursor-pointer"></div>
                   <div className="w-5 h-5 bg-magical-300 rounded-full opacity-50 hover:opacity-100 cursor-pointer"></div>
                </li>
              </ul>
            </div>

          </div>
          
          <div className="mt-8 pt-8 border-t border-magical-200/30 text-center text-xs text-magical-400 italic">
            "Not responsible for accidental ingestion of antimatter during narration."
          </div>
        </div>
      </footer>

      {/* Legal Modal */}
      {activeDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-magical-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setActiveDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative border border-white/50" onClick={e => e.stopPropagation()}>
            <button onClick={() => setActiveDoc(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="prose prose-sm prose-amber">
               {renderContent()}
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 flex justify-end">
              <button onClick={() => setActiveDoc(null)} className="bg-magical-800 text-white px-4 py-2 rounded-lg font-bold text-xs hover:bg-magical-900">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
