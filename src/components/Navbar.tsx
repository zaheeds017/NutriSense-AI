import React from 'react';
import { Camera, Search, Scale, History, User, PlusCircle, ShieldAlert, Sparkles } from 'lucide-react';
import { UserPreferences } from '../types';

interface NavbarProps {
  activeTab: 'scan' | 'explore' | 'compare' | 'history' | 'profile' | 'contribute';
  setActiveTab: (tab: 'scan' | 'explore' | 'compare' | 'history' | 'profile' | 'contribute') => void;
  userPrefs: UserPreferences;
  compareCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  userPrefs,
  compareCount,
}) => {
  const allergenCount = userPrefs.allergens.length;
  const dietCount = userPrefs.dietRestrictions.length;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <button
            onClick={() => setActiveTab('scan')}
            className="flex items-center gap-2.5 group text-left cursor-pointer focus:outline-none"
            id="brand-logo-btn"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xl tracking-tight text-slate-900">
                  NutriSense-<span className="text-emerald-600">AI</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded-full bg-emerald-100 text-emerald-800">
                  AI v2.5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Ingredient Quality & Allergen Intelligence
              </p>
            </div>
          </button>

          {/* Nav Tabs */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('scan')}
              id="nav-tab-scan"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'scan'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden md:inline">Scan</span>
            </button>

            <button
              onClick={() => setActiveTab('explore')}
              id="nav-tab-explore"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'explore'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden md:inline">Products</span>
            </button>

            <button
              onClick={() => setActiveTab('compare')}
              id="nav-tab-compare"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all relative ${
                activeTab === 'compare'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Scale className="w-4 h-4" />
              <span className="hidden md:inline">Compare</span>
              {compareCount > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-400 text-slate-900">
                  {compareCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('history')}
              id="nav-tab-history"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <History className="w-4 h-4" />
              <span className="hidden md:inline">History</span>
            </button>

            <button
              onClick={() => setActiveTab('contribute')}
              id="nav-tab-contribute"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === 'contribute'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden lg:inline">Add Food</span>
            </button>

            {/* Profile & Dietary Preferences Button */}
            <button
              onClick={() => setActiveTab('profile')}
              id="nav-tab-profile"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-all relative ${
                activeTab === 'profile'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Diet & Allergens</span>
              {(allergenCount > 0 || dietCount > 0) && (
                <span className="flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                  <ShieldAlert className="w-3 h-3 inline" />
                  {allergenCount + dietCount}
                </span>
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
