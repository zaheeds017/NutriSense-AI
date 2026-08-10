import React, { useEffect } from 'react';
import { UserCheck, AlertTriangle, X, Camera, Sparkles } from 'lucide-react';

export default function HumanFaceAlertModal({ isOpen, onClose, onTryPreset }) {
  useEffect(() => {
    if (isOpen) {
      // Optional text-to-speech voice prompt
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Human face detected! Please scan a packaged food item or nutrition label.");
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-amber-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] relative text-center space-y-4">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Animated Face Badge Icon */}
        <div className="relative mx-auto w-20 h-20 rounded-full bg-amber-500/20 text-amber-400 border-2 border-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/20 animate-bounce">
          <UserCheck className="w-10 h-10" />
          <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 text-slate-950 rounded-full">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>

        {/* Text Banner */}
        <div>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[11px] font-extrabold uppercase tracking-wider">
            Scanner Alert
          </span>
          <h2 className="text-xl font-black text-white tracking-tight mt-2">
            Human Face Detected! 👤
          </h2>
          <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto leading-relaxed">
            Our computer vision scanner detected a human face. Please present a <strong className="text-amber-400">packaged food product</strong>, <strong className="text-amber-400">snack box</strong>, or <strong className="text-amber-400">nutrition label</strong> to scan nutritional facts.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="pt-2 space-y-2">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/25 hover:scale-105 transition-all flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Scan Food Package Instead</span>
          </button>

          <button
            onClick={() => {
              onClose();
              if (onTryPreset) onTryPreset();
            }}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700/80 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Try Instant Doritos Sample Package</span>
          </button>
        </div>

      </div>
    </div>
  );
}
