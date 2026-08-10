import React, { useState } from 'react';
import { Trash2, Download, Search, Sparkles, Flame, ShieldAlert } from 'lucide-react';

export default function ScanHistory({ scanHistory, onClearHistory, onSelectScan }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = scanHistory.filter((item) => {
    const name = item.sampleMeta?.name || item.name || 'Extracted Item';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Calculate cumulative daily macros
  const totalCalories = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.calories?.value || 0), 0);
  const totalSodium = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.sodium?.value || 0), 0);
  const totalProtein = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.protein?.value || 0), 0);

  const handleExportCsv = () => {
    if (scanHistory.length === 0) return;
    const headers = ['Timestamp', 'Product Name', 'Calories (kcal)', 'Total Fat (g)', 'Sodium (mg)', 'Carbs (g)', 'Protein (g)', 'Allergens'];
    const rows = scanHistory.map((item) => [
      new Date(item.timestamp).toLocaleString(),
      `"${item.sampleMeta?.name || 'Extracted Item'}"`,
      item.data?.macros?.calories?.value || 0,
      item.data?.macros?.total_fat?.value || 0,
      item.data?.macros?.sodium?.value || 0,
      item.data?.macros?.total_carbohydrates?.value || 0,
      item.data?.macros?.protein?.value || 0,
      `"${(item.data?.allergens_identified || []).join(', ')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-scan-history-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Cumulative Stats Top Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Scan History & Daily Macro Tracker</h2>
            <p className="text-xs text-slate-400">Recorded food package scans stored locally in your browser</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCsv}
              disabled={scanHistory.length === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-emerald-400" /> Export CSV
            </button>

            <button
              onClick={onClearHistory}
              disabled={scanHistory.length === 0}
              className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-rose-400 text-xs font-semibold border border-rose-500/20 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Clear Log
            </button>
          </div>
        </div>

        {/* Aggregated Totals Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tracked Calories</div>
              <div className="text-lg font-black text-white">{totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tracked Sodium</div>
              <div className="text-lg font-black text-white">{totalSodium} <span className="text-xs font-normal text-slate-400">mg</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Tracked Protein</div>
              <div className="text-lg font-black text-white">{totalProtein} <span className="text-xs font-normal text-slate-400">g</span></div>
            </div>
          </div>
        </div>

      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search scanned food packages by name..."
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
        />
      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item, index) => (
            <div
              key={index}
              onClick={() => onSelectScan(item)}
              className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs">
                  #{scanHistory.length - index}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {item.sampleMeta?.name || 'Scanned Packaged Item'}
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    {new Date(item.timestamp).toLocaleString()} • Source: {item.source}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="text-right">
                  <div className="font-bold text-white">{item.data?.macros?.calories?.value || 0} kcal</div>
                  <div className="text-[10px] text-slate-400">{item.data?.macros?.protein?.value || 0}g protein</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
          No scan history recorded yet. Use the Live Scanner, Label Upload, or Preset Library to add items.
        </div>
      )}

    </div>
  );
}
