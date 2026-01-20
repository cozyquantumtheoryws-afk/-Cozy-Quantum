import React from 'react';

export const Footer: React.FC = () => {
  return (
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
            <ul className="space-y-2 text-sm text-magical-600">
              <li><a href="#" className="hover:text-magical-900 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-magical-900 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-magical-900 transition-colors">Safety Disclaimers</a></li>
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
  );
};
