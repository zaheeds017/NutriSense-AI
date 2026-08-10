import React from 'react';
import {
  Camera, Upload, LayoutGrid, History, Code, Key, Scan, Sparkles,
  ScanBarcode, Type, Database, Scale, UserCircle2,
} from 'lucide-react';

const TABS = [
  { id: 'scanner', label: 'Scanner', icon: Camera },
  { id: 'barcode', label: 'Barcode', icon: ScanBarcode },
  { id: 'text', label: 'Text', icon: Type },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'presets', label: 'Library', icon: LayoutGrid },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'compare', label: 'Compare', icon: Scale },
  { id: 'json', label: 'JSON', icon: Code },
  { id: 'history', label: 'History', icon: History },
];

export default function Header({ activeTab, setActiveTab, onOpenApiModal, hasApiKey, scanCount, compareCount, onOpenProfile, hasProfile }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 px-4 lg:px-8 py-3 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer shrink-0" onClick={() => setActiveTab('scanner')}>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-500 p-0.5 shadow-lg shadow-emerald-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Scan className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent tracking-tight">
                NutriSense_AI
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> AI Vision
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Packaged Food & Snack Scanner</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800/80 shadow-inner overflow-x-auto max-w-full">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap relative ${
                  active
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" /> {t.label}
                {t.id === 'history' && scanCount > 0 && (
                  <span className="w-4 h-4 bg-emerald-400 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {scanCount}
                  </span>
                )}
                {t.id === 'compare' && compareCount > 0 && (
                  <span className="w-4 h-4 bg-amber-400 text-slate-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                    {compareCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Profile + API Settings */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenProfile}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              hasProfile
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Personalize allergen & diet flags"
          >
            <UserCircle2 className="w-3.5 h-3.5" />
            {hasProfile ? 'Profile Active' : 'My Profile'}
          </button>

          <button
            onClick={onOpenApiModal}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
              hasApiKey
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title="Configure Gemini Multimodal Vision API"
          >
            <Key className="w-3.5 h-3.5" />
            {hasApiKey ? 'Gemini Active' : 'AI API'}
          </button>
        </div>
      </div>
    </header>
  );
}
