import React, { useState } from 'react';
import { Trash2, Download, Search, Sparkles, Flame, ShieldAlert, HeartPulse } from 'lucide-react';

const SCAN_TYPES = [
  { id: 'all', label: 'All' },
  { id: 'camera', label: 'Camera' },
  { id: 'upload', label: 'Upload' },
  { id: 'barcode', label: 'Barcode' },
  { id: 'text', label: 'Text' },
  { id: 'preset', label: 'Presets' },
];

function scanTypeOf(item) {
  if (item.sampleMeta) return 'preset';
  if (item.scanType === 'barcode') return 'barcode';
  const s = (item.source || '').toLowerCase();
  if (s.includes('barcode')) return 'barcode';
  if (s.includes('text') || s.includes('parser')) return 'text';
  if (s.includes('upload')) return 'upload';
  return 'camera';
}

function scoreBadge(score) {
  if (score >= 7) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  if (score >= 5) return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  if (score >= 3) return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
  return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
}

export default function ScanHistory({ scanHistory, onClearHistory, onSelectScan }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredHistory = scanHistory.filter((item) => {
    const name = item.sampleMeta?.name || item.data?.product_name || item.name || 'Extracted Item';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || scanTypeOf(item) === typeFilter;
    return matchesSearch && matchesType;
  });

  // Calculate cumulative daily macros
  const totalCalories = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.calories?.value || 0), 0);
  const totalSodium = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.sodium?.value || 0), 0);
  const totalProtein = scanHistory.reduce((acc, item) => acc + (item.data?.macros?.protein?.value || 0), 0);
  const totalScore =
    scanHistory.length > 0
      ? (scanHistory.reduce((acc, item) => acc + (item.data?.health?.score ?? 0), 0) / scanHistory.length).toFixed(1)
      : '0.0';

  const handleExportCsv = () => {
    if (scanHistory.length === 0) return;
    const headers = ['Timestamp', 'Product Name', 'Health Score', 'Calories (kcal)', 'Total Fat (g)', 'Sodium (mg)', 'Carbs (g)', 'Protein (g)', 'Allergens'];
    const rows = scanHistory.map((item) => [
      new Date(item.timestamp).toLocaleString(),
      `"${item.sampleMeta?.name || item.data?.product_name || 'Extracted Item'}"`,
      item.data?.health?.score ?? 0,
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Calories</div>
              <div className="text-lg font-black text-white">{totalCalories} <span className="text-xs font-normal text-slate-400">kcal</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Sodium</div>
              <div className="text-lg font-black text-white">{totalSodium} <span className="text-xs font-normal text-slate-400">mg</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Total Protein</div>
              <div className="text-lg font-black text-white">{totalProtein} <span className="text-xs font-normal text-slate-400">g</span></div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Health Score</div>
              <div className="text-lg font-black text-white">{totalScore} <span className="text-xs font-normal text-slate-400">/ 10</span></div>
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

      {/* Type Filter Chips */}
      <div className="flex flex-wrap gap-1.5">
        {SCAN_TYPES.map((t) => (
          <button
            key={t.id}
            onClick={() => setTypeFilter(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
              typeFilter === t.id
                ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* History List */}
      {filteredHistory.length > 0 ? (
        <div className="space-y-3">
          {filteredHistory.map((item, index) => {
            const score = item.data?.health?.score ?? 0;
            return (
              <div
                key={index}
                onClick={() => onSelectScan(item)}
                className="p-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all flex items-center justify-between gap-4 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 font-bold text-xs shrink-0">
                    #{scanHistory.length - index}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors truncate">
                      {item.sampleMeta?.name || item.data?.product_name || 'Scanned Packaged Item'}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      {new Date(item.timestamp).toLocaleString()} • Source: {item.source}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-500">
                      {scanTypeOf(item)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                  <div className="text-right">
                    <div className="font-bold text-white">{item.data?.macros?.calories?.value || 0} kcal</div>
                    <div className="text-[10px] text-slate-400">{item.data?.macros?.protein?.value || 0}g protein</div>
                  </div>
                  <span className={`px-2 py-1 rounded-lg text-sm font-black border ${scoreBadge(score)}`}>
                    {score ? score.toFixed(1) : '—'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs">
          No scan history matches these filters. Use the Live Scanner, Barcode, Text, or Preset Library to add items.
        </div>
      )}

    </div>
  );
}
