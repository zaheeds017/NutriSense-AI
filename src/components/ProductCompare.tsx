import React from 'react';
import { AnalysisResultContract } from '../types';
import { Scale, Trash2, Check, X, ShieldAlert } from 'lucide-react';

interface ProductCompareProps {
  compareList: AnalysisResultContract[];
  onRemoveFromCompare: (index: number) => void;
  onClearCompare: () => void;
}

export const ProductCompare: React.FC<ProductCompareProps> = ({
  compareList,
  onRemoveFromCompare,
  onClearCompare,
}) => {
  if (compareList.length === 0) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200/80 shadow-xs text-center space-y-4 max-w-2xl mx-auto my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
          <Scale className="w-8 h-8" />
        </div>
        <h3 className="font-bold text-xl text-slate-900">Product Comparison Matrix Empty</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Scan products or browse the product catalog and click "Add to Compare" to evaluate 2 or more packaged foods side by side.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            Side-by-Side Product Comparison ({compareList.length})
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare Health Scores, UK/EU Traffic Light indicators, Macros, and Allergen Profiles.
          </p>
        </div>
        <button
          onClick={onClearCompare}
          className="px-3.5 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          Clear Comparison
        </button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full text-left text-xs border-collapse bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-xs">
            <thead>
              <tr className="bg-slate-900 text-white">
                <th className="p-4 font-bold w-48 text-slate-300">Feature / Metric</th>
                {compareList.map((item, idx) => (
                  <th key={idx} className="p-4 font-bold w-64 border-l border-slate-800">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block">
                          {item.brand || 'Brand'}
                        </span>
                        <span className="text-sm font-bold text-white block mt-0.5 line-clamp-1">
                          {item.product_name || 'Product'}
                        </span>
                      </div>
                      <button
                        onClick={() => onRemoveFromCompare(idx)}
                        className="text-slate-400 hover:text-rose-400 p-1 rounded-lg hover:bg-slate-800"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
              {/* Health Score Row */}
              <tr className="bg-emerald-50/50">
                <td className="p-4 font-bold text-slate-900">Health Score (1-10)</td>
                {compareList.map((item, idx) => {
                  const score = item.health?.score ?? 5;
                  return (
                    <td key={idx} className="p-4 border-l border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-black text-slate-900">{score}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            score >= 8.0
                              ? 'bg-emerald-200 text-emerald-900'
                              : score >= 5.0
                              ? 'bg-amber-200 text-amber-900'
                              : 'bg-rose-200 text-rose-900'
                          }`}
                        >
                          {item.health?.overall}
                        </span>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Category Row */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Category</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.category || 'General'}
                  </td>
                ))}
              </tr>

              {/* Calories */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">Calories</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100 font-bold">
                    {item.macros.calories.value ?? 'N/A'} kcal
                  </td>
                ))}
              </tr>

              {/* Total Fat & Traffic Light */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Total Fat</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.macros.total_fat.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Saturated Fat */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">Saturated Fat</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.macros.saturated_fat.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Total Sugars */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Total Sugars</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.macros.total_sugars.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Added Sugars */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">Added Sugars</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100 font-bold text-rose-600">
                    {item.macros.added_sugars.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Sodium */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Sodium</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.macros.sodium.value ?? 'N/A'}mg
                  </td>
                ))}
              </tr>

              {/* Fiber */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">Dietary Fiber</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100 text-emerald-700 font-bold">
                    {item.macros.dietary_fiber.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Protein */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Protein</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100 font-bold">
                    {item.macros.protein.value ?? 'N/A'}g
                  </td>
                ))}
              </tr>

              {/* Allergens Identified */}
              <tr className="bg-slate-50/50">
                <td className="p-4 font-bold text-slate-700">Allergens Identified</td>
                {compareList.map((item, idx) => (
                  <td key={idx} className="p-4 border-l border-slate-100">
                    {item.allergens_identified.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.allergens_identified.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-emerald-600 font-medium">None Detected</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Harmful Ingredients Count */}
              <tr>
                <td className="p-4 font-bold text-slate-700">Harmful Ingredients</td>
                {compareList.map((item, idx) => {
                  const harmfulCount =
                    item.health?.ingredients_with_flags.filter((i) => i.color === 'red').length ?? 0;
                  return (
                    <td key={idx} className="p-4 border-l border-slate-100 font-bold">
                      {harmfulCount > 0 ? (
                        <span className="text-rose-600">{harmfulCount} Flagged</span>
                      ) : (
                        <span className="text-emerald-600">0 Flagged</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
