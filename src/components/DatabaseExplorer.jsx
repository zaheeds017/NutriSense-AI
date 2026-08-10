import React, { useMemo, useState } from 'react';
import { Search, Database, UserPlus, ShieldAlert, ChevronRight, Barcode } from 'lucide-react';

function scoreBadge(score) {
  if (score >= 7) return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40';
  if (score >= 5) return 'bg-amber-500/15 text-amber-300 border-amber-500/40';
  if (score >= 3) return 'bg-orange-500/15 text-orange-300 border-orange-500/40';
  return 'bg-rose-500/15 text-rose-300 border-rose-500/40';
}

export default function DatabaseExplorer({ products = [], onOpenProduct, onAddCommunity }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [minScore, setMinScore] = useState(0);

  const categories = useMemo(() => ['All', ...new Set(products.map((p) => p.category).filter(Boolean))], [products]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q) ||
      p.barcode.includes(q);
    const matchesCategory = category === 'All' || p.category === category;
    const matchesScore = (p.analysis?.health?.score ?? 0) >= minScore;
    return matchesSearch && matchesCategory && matchesScore;
  });

  const avgScore = products.length
    ? (products.reduce((acc, p) => acc + (p.analysis?.health?.score ?? 0), 0) / products.length).toFixed(1)
    : '0.0';
  const communityCount = products.filter((p) => p.isCommunity).length;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Stats + Add button */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-400" /> Product Database Explorer
            </h2>
            <p className="text-xs text-slate-400">Browse the built-in catalog plus community-contributed products</p>
          </div>
          <button
            onClick={onAddCommunity}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <UserPlus className="w-4 h-4" /> Add Community Product
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 pt-5">
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Total Products</div>
            <div className="text-xl font-black text-white">{products.length}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Avg Health Score</div>
            <div className="text-xl font-black text-emerald-400">{avgScore}</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 text-center">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Community Adds</div>
            <div className="text-xl font-black text-cyan-400">{communityCount}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, brand, or barcode..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500 transition-all"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            <span>Minimum Health Score</span>
            <span className="text-emerald-400">{minScore}+</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 3, 5, 7, 8.5].map((v) => (
              <button
                key={v}
                onClick={() => setMinScore(v)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                  minScore === v
                    ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                {v === 0 ? 'Any' : `${v}+`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-slate-500">
        Showing <strong className="text-slate-300">{filtered.length}</strong> of {products.length} products
        {category !== 'All' && ` in ${category}`}
        {minScore > 0 && ` scoring ${minScore}+`}
      </p>

      {/* Product grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const score = p.analysis?.health?.score ?? 0;
            const bad = (p.analysis?.allergens_identified || []).length;
            return (
              <button
                key={p.id}
                onClick={() => onOpenProduct(p)}
                className="group p-4 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 backdrop-blur-xl shadow-xl text-left transition-all hover:-translate-y-0.5 flex flex-col gap-3 cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-700 shrink-0 bg-slate-950">
                    <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <span className={`px-2.5 py-1 rounded-xl text-sm font-black border ${scoreBadge(score)}`}>
                    {score.toFixed(1)}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                    {p.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">{p.brand}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[9px] font-bold uppercase tracking-wider text-slate-400">
                      {p.category}
                    </span>
                    {p.isCommunity && (
                      <span className="px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-[9px] font-bold uppercase tracking-wider text-cyan-400">
                        Community
                      </span>
                    )}
                    {bad > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/30 text-[9px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <ShieldAlert className="w-2.5 h-2.5" /> {bad} Allergen{bad > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between mt-auto">
                  <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                    <Barcode className="w-3 h-3" /> {p.barcode || '—'}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    Open Analysis <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs space-y-2">
          <p>No products match the current filters.</p>
          <p>Try clearing the search or adding a community product.</p>
        </div>
      )}
    </div>
  );
}
