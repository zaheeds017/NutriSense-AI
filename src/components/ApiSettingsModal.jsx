import React, { useState } from 'react';
import { X, Key, Sparkles, Check, ExternalLink } from 'lucide-react';

export default function ApiSettingsModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white">Gemini Multimodal Vision API</h3>
            <p className="text-xs text-slate-400">Optional AI key for live high-precision label extraction</p>
          </div>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
            <Sparkles className="w-4 h-4" /> Client-Side Rule OCR Engine Active
          </p>
          <p className="text-[11px] text-slate-400">
            NutriSense_AI extracts nutrition facts using built-in computer vision rule engines out of the box. Adding a Google Gemini API Key enables direct LLM vision label reading for complex or curved food packages.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Google Gemini API Key</label>
            <input
              type="password"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="AIzaSy..."
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="flex items-center justify-between text-[11px]">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              Get free Gemini API Key <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" /> Saved!
                </>
              ) : (
                'Save Settings'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
