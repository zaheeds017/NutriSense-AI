import React, { useState } from 'react';
import { ScanHistoryRecord, AnalysisResultContract } from '../types';
import { History, Heart, Trash2, Search, Camera, Barcode, AlignLeft, ArrowRight } from 'lucide-react';

interface HistoryViewProps {
  history: ScanHistoryRecord[];
  onSelectScan: (analysis: AnalysisResultContract) => void;
  onToggleFavorite: (scanId: string) => void;
  onClearHistory: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  history,
  onSelectScan,
  onToggleFavorite,
  onClearHistory,
}) => {
  const [search, setSearch] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const filtered = history.filter((item) => {
    if (showFavoritesOnly && !item.isFavorite) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = item.productName.toLowerCase().includes(q);
      const matchBrand = item.brand.toLowerCase().includes(q);
      const matchBarcode = item.barcode?.includes(q) ?? false;
      if (!matchName && !matchBrand && !matchBarcode) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header & Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Scan History & Saved Favorites ({history.length})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Review past barcode lookups, OCR label scans, and manual ingredient analyses.
            </p>
          </div>

          <button
            onClick={onClearHistory}
            disabled={history.length === 0}
            className="px-3 py-1.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear Log
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search history by name, brand, or barcode..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
              showFavoritesOnly
                ? 'bg-rose-500 border-rose-600 text-white'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white' : ''}`} />
            <span>Favorites Only</span>
          </button>
        </div>
      </div>

      {/* History List */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-2">
          <p className="font-bold text-slate-800 text-base">No history records found</p>
          <p className="text-xs text-slate-500">
            {showFavoritesOnly
              ? 'You have not favorited any scans yet.'
              : 'Scan barcodes or photos to populate your historical logs.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((record) => {
            const score = record.healthScore;
            return (
              <div
                key={record.id}
                className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                      score >= 8.0
                        ? 'bg-emerald-100 text-emerald-900'
                        : score >= 5.0
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {score}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-700">
                        {record.brand}
                      </span>
                      <span className="px-1.5 py-0.2 rounded-md text-[9px] font-bold uppercase bg-slate-100 text-slate-600 flex items-center gap-1">
                        {record.scanType === 'barcode' && <Barcode className="w-3 h-3" />}
                        {record.scanType === 'ocr' && <Camera className="w-3 h-3" />}
                        {record.scanType === 'text' && <AlignLeft className="w-3 h-3" />}
                        {record.scanType}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-sm truncate">{record.productName}</h4>

                    <p className="text-[11px] text-slate-400">
                      {new Date(record.timestamp).toLocaleDateString()} at{' '}
                      {new Date(record.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onToggleFavorite(record.id)}
                    className={`p-2 rounded-xl border transition-colors ${
                      record.isFavorite
                        ? 'bg-rose-50 border-rose-200 text-rose-600'
                        : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${record.isFavorite ? 'fill-rose-600' : ''}`} />
                  </button>

                  <button
                    onClick={() => onSelectScan(record.analysis)}
                    className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center gap-1"
                  >
                    <span>View Result</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
