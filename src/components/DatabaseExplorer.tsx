import React, { useState } from 'react';
import { ProductRecord, AnalysisResultContract } from '../types';
import { Search, Filter, Barcode, Scale, Sparkles, ArrowRight } from 'lucide-react';

interface DatabaseExplorerProps {
  products: ProductRecord[];
  onSelectProduct: (analysis: AnalysisResultContract) => void;
  onAddToCompare: (analysis: AnalysisResultContract) => void;
}

const CATEGORIES = [
  'All',
  'Breakfast Grains',
  'Spreads & Sweeteners',
  'Dairy & Yogurt',
  'Snack Foods',
  'Plant Milk',
];

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  products,
  onSelectProduct,
  onAddToCompare,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [minScore, setMinScore] = useState<number>(0);

  const filtered = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchBrand = p.brand.toLowerCase().includes(q);
      const matchBarcode = p.barcode.includes(q);
      if (!matchName && !matchBrand && !matchBarcode) return false;
    }
    if (selectedCategory !== 'All' && p.category !== selectedCategory) {
      return false;
    }
    if ((p.analysis.health?.score ?? 0) < minScore) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            NutriSense-AI Product Database Catalog ({filtered.length} products)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Search pre-verified packaged foods by brand, item name, or UPC barcode. Inspect AI health scores or add to comparison.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, brand, or barcode (e.g. Oats, Oreo, 030000062002)..."
              id="database-search-input"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-semibold text-slate-600">Min Score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-none"
            >
              <option value={0}>Any Score (0-10)</option>
              <option value={8}>8.0+ Excellent</option>
              <option value={6}>6.0+ Good+</option>
              <option value={4}>4.0+ Moderate+</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200/80 text-center space-y-2">
          <p className="font-bold text-slate-800 text-base">No matching products found</p>
          <p className="text-xs text-slate-500">
            Try adjusting search terms or add a new food product using the "Add Food" tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => {
            const score = item.analysis.health?.score ?? 5;
            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={
                            item.imageUrl ||
                            'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop'
                          }
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          {item.brand}
                        </span>
                        <span className="text-xs font-mono text-slate-400 block">
                          UPC: {item.barcode}
                        </span>
                      </div>
                    </div>

                    <div
                      className={`px-2.5 py-1 rounded-xl text-xs font-black shadow-2xs ${
                        score >= 8.0
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : score >= 5.0
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-rose-100 text-rose-900 border border-rose-300'
                      }`}
                    >
                      {score}/10
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {item.analysis.health?.comments || 'Pre-analyzed ingredient & macro profile.'}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onAddToCompare(item.analysis)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors flex items-center gap-1"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    Compare
                  </button>

                  <button
                    onClick={() => onSelectProduct(item.analysis)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 shadow-2xs"
                  >
                    <span>View Analysis</span>
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
