import React from 'react';
import { Scale, Trash2, X, Trophy, AlertTriangle } from 'lucide-react';

const METRICS = [
  { key: 'calories', label: 'Calories', unit: 'kcal', good: 'low' },
  { key: 'total_fat', label: 'Total Fat', unit: 'g', good: 'low' },
  { key: 'saturated_fat', label: 'Saturated Fat', unit: 'g', good: 'low' },
  { key: 'trans_fat', label: 'Trans Fat', unit: 'g', good: 'low' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg', good: 'low' },
  { key: 'sodium', label: 'Sodium', unit: 'mg', good: 'low' },
  { key: 'total_carbohydrates', label: 'Total Carbs', unit: 'g', good: 'low' },
  { key: 'dietary_fiber', label: 'Dietary Fiber', unit: 'g', good: 'high' },
  { key: 'total_sugars', label: 'Total Sugars', unit: 'g', good: 'low' },
  { key: 'added_sugars', label: 'Added Sugars', unit: 'g', good: 'low' },
  { key: 'protein', label: 'Protein', unit: 'g', good: 'high' },
];

function metricVal(analysis, key) {
  return analysis?.macros?.[key]?.value ?? null;
}

export default function ProductCompare({ compareList = [], onRemoveFromCompare, onClearCompare }) {
  if (compareList.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 text-slate-500 text-xs space-y-3">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
          <Scale className="w-6 h-6 text-slate-600" />
        </div>
        <p>No products in the comparison tray yet.</p>
        <p className="text-slate-600">
          Open any scanned analysis and hit <strong className="text-emerald-400">"Add to Side-by-Side Comparison"</strong> to compare
          up to 3 products on health score and macro profile.
        </p>
      </div>
    );
  }

  const names = compareList.map((p) => p.product_name || p.name || 'Product');
  const bestIndex = compareList.reduce(
    (best, p, i) => {
      const score = p.health?.score ?? 0;
      return score > best.score ? { index: i, score } : best;
    },
    { index: 0, score: -1 }
  );

  const isBest = (metricKey, idx) => {
    const values = compareList.map((p) => metricVal(p, metricKey));
    const valid = values.filter((v) => v !== null && v !== undefined);
    if (valid.length < 2) return false;
    const target = values[idx];
    if (target === null || target === undefined) return false;
    const meta = METRICS.find((m) => m.key === metricKey);
    return meta.good === 'low' ? target === Math.min(...valid) : target === Math.max(...valid);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-400" /> Side-by-Side Product Comparison
          </h2>
          <p className="text-xs text-slate-400">Best value per metric is highlighted in green ({compareList.length}/3 products)</p>
        </div>
        <button
          onClick={onClearCompare}
          className="px-4 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center gap-2"
        >
          <Trash2 className="w-4 h-4" /> Clear Comparison
        </button>
      </div>

      <div className="rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-x-auto">
        <table className="w-full text-xs min-w-[720px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left px-5 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 w-44">Metric</th>
              {compareList.map((p, idx) => (
                <th key={idx} className="px-4 py-4 text-left min-w-[160px] align-top">
                  <div className="relative">
                    {bestIndex.index === idx && (
                      <span className="absolute -top-1 left-0 flex items-center gap-1 text-emerald-400 text-[9px] font-black uppercase tracking-wider">
                        <Trophy className="w-3 h-3" /> Best Overall
                      </span>
                    )}
                    <div className="flex items-start gap-2 pt-3">
                      <img
                        src={p.image_url || p.imageUrl}
                        alt={names[idx]}
                        className="w-9 h-9 rounded-lg object-cover border border-slate-700 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-extrabold text-white leading-tight line-clamp-2">{names[idx]}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{p.brand || '—'}</p>
                      </div>
                      <button
                        onClick={() => onRemoveFromCompare(p.id || names[idx])}
                        className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors ml-auto shrink-0"
                        title="Remove from comparison"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div
                      className={`mt-2 inline-block px-2 py-0.5 rounded-lg text-sm font-black border ${
                        (p.health?.score ?? 0) >= 7
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                          : (p.health?.score ?? 0) >= 5
                          ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
                      }`}
                    >
                      {(p.health?.score ?? 0).toFixed(1)}
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            <tr className="border-b border-slate-800 bg-slate-950/40">
              <td className="px-5 py-3 font-bold text-slate-300">Health Score</td>
              {compareList.map((p, idx) => {
                const s = p.health?.score ?? 0;
                const colors = s >= 7 ? 'bg-emerald-500' : s >= 5 ? 'bg-amber-500' : 'bg-rose-500';
                return (
                  <td key={idx} className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full ${colors}`} style={{ width: `${s * 10}%` }} />
                      </div>
                      <span className="font-black text-white">{s}</span>
                    </div>
                  </td>
                );
              })}
            </tr>

            {METRICS.map((m) => (
              <tr key={m.key} className="border-b border-slate-800/60">
                <td className="px-5 py-2.5 font-semibold text-slate-400">{m.label}</td>
                {compareList.map((p, idx) => {
                  const v = metricVal(p, m.key);
                  const best = isBest(m.key, idx);
                  return (
                    <td key={idx} className={`px-4 py-2.5 font-mono ${best ? 'text-emerald-400 font-black' : 'text-slate-200'}`}>
                      {v !== null && v !== undefined ? (
                        <>
                          {v} <span className="text-slate-500 font-sans">{m.unit}</span>
                          {best && <span className="ml-1 text-[9px]">✓</span>}
                        </>
                      ) : (
                        <span className="text-slate-600">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {compareList.some((p) => (p.allergens_identified || []).length > 0) && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-300 font-semibold">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Allergen flags present:{" "}
            {compareList
              .map((p, i) => ((p.allergens_identified || []).length ? `${names[i]} (${p.allergens_identified.join(', ')})` : null))
              .filter(Boolean)
              .join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
}
