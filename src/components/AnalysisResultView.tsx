import React, { useState } from 'react';
import {
  AnalysisResultContract,
  UserPreferences,
  AlternativeProduct,
} from '../types';
import {
  ShieldAlert,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Heart,
  RotateCcw,
  Tag,
  ThumbsUp,
  AlertCircle,
} from 'lucide-react';

interface AnalysisResultViewProps {
  analysis: AnalysisResultContract;
  userPrefs: UserPreferences;
  alternatives: AlternativeProduct[];
  onAddToCompare: (productIdOrAnalysis: AnalysisResultContract) => void;
  onRescan: () => void;
  isInCompare: boolean;
}

export const AnalysisResultView: React.FC<AnalysisResultViewProps> = ({
  analysis,
  userPrefs,
  alternatives,
  onAddToCompare,
  onRescan,
  isInCompare,
}) => {
  const [activeIngredientFilter, setActiveIngredientFilter] = useState<'all' | 'green' | 'amber' | 'red'>('all');
  const [expandedIngredient, setExpandedIngredient] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const health = analysis.health;
  const score = health?.score ?? 5;
  const overall = health?.overall ?? 'Moderate';

  // Check personal allergen conflicts
  const identifiedAllergens = analysis.allergens_identified || [];
  const personalAllergenConflicts = identifiedAllergens.filter((a) =>
    userPrefs.allergens.some(
      (pref) => pref.toLowerCase() === a.toLowerCase() || a.toLowerCase().includes(pref.toLowerCase())
    )
  );

  // Check diet conflicts
  const dietaryFlags = health?.dietary_flags || [];
  const activeDietConflicts = dietaryFlags.filter(
    (df) =>
      userPrefs.dietRestrictions.some((dr) => dr.toLowerCase() === df.diet.toLowerCase()) && !df.suitable
  );

  // Score color classes
  const getScoreColor = (val: number) => {
    if (val >= 8.5) return 'from-emerald-600 to-teal-500 text-emerald-600 border-emerald-500';
    if (val >= 7.0) return 'from-emerald-500 to-green-400 text-emerald-500 border-emerald-400';
    if (val >= 5.0) return 'from-amber-500 to-yellow-400 text-amber-500 border-amber-400';
    if (val >= 3.0) return 'from-orange-500 to-amber-500 text-orange-500 border-orange-400';
    return 'from-rose-600 to-red-500 text-rose-600 border-rose-500';
  };

  const getScoreBg = (val: number) => {
    if (val >= 8.5) return 'bg-emerald-50 border-emerald-200 text-emerald-900';
    if (val >= 7.0) return 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900';
    if (val >= 5.0) return 'bg-amber-50 border-amber-200 text-amber-900';
    if (val >= 3.0) return 'bg-orange-50 border-orange-200 text-orange-900';
    return 'bg-rose-50 border-rose-200 text-rose-900';
  };

  const flags = health?.ingredients_with_flags || [];
  const filteredFlags = flags.filter((item) => {
    if (activeIngredientFilter === 'all') return true;
    return item.color === activeIngredientFilter;
  });

  const traffic = health?.traffic_light;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Actions Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-800">
              {analysis.category || 'Food Analysis'}
            </span>
            {analysis.is_community && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-100 text-amber-800">
                Community Contributed
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600">
              Source: {health?.analysis_source === 'ai' ? 'Gemini AI 3.6' : 'Rules Engine'}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">
            {analysis.product_name || 'Scanned Food Item'}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{analysis.brand || 'Brand Context'}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => onAddToCompare(analysis)}
            id="add-to-compare-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isInCompare
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-600" />
            {isInCompare ? 'In Compare List' : 'Add to Compare'}
          </button>

          <button
            onClick={() => setIsSaved(!isSaved)}
            id="toggle-save-btn"
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              isSaved
                ? 'bg-rose-500 border-rose-600 text-white shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-800'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
            {isSaved ? 'Saved' : 'Save'}
          </button>

          <button
            onClick={onRescan}
            id="rescan-btn"
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs flex items-center gap-1.5 transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            New Scan
          </button>
        </div>
      </div>

      {/* Critical Allergen & Diet Warning Banner */}
      {(personalAllergenConflicts.length > 0 || activeDietConflicts.length > 0) && (
        <div className="bg-rose-500 text-white p-5 rounded-2xl shadow-md border border-rose-600 space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 shrink-0" />
            <h3 className="font-bold text-base tracking-tight">
              PERSONAL DIETARY CONFLICT WARNING
            </h3>
          </div>
          <div className="text-xs space-y-1.5 pl-8">
            {personalAllergenConflicts.length > 0 && (
              <p>
                <strong className="underline">Contains Allergen Match:</strong>{' '}
                {personalAllergenConflicts.join(', ')} (matches your profile settings).
              </p>
            )}
            {activeDietConflicts.length > 0 && (
              <p>
                <strong className="underline">Unsuitable for Diet:</strong>{' '}
                {activeDietConflicts.map((c) => `${c.diet} (${c.reason})`).join('; ')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Main Analysis Card: Health Score + Traffic Lights + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Score Gauge Box */}
        <div className={`p-6 rounded-2xl border shadow-xs flex flex-col items-center justify-center text-center ${getScoreBg(score)}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-600 mb-2">
            NutriSense_AI Health Score
          </p>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="10"
                className="text-slate-200/80 fill-none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * score) / 10}
                strokeLinecap="round"
                className={`fill-none transition-all duration-1000 ${
                  score >= 8.5
                    ? 'text-emerald-600'
                    : score >= 7.0
                    ? 'text-emerald-500'
                    : score >= 5.0
                    ? 'text-amber-500'
                    : score >= 3.0
                    ? 'text-orange-500'
                    : 'text-rose-600'
                }`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-slate-900">{score}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">/ 10</span>
            </div>
          </div>

          <div className="mt-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-white/90 shadow-2xs border border-slate-200 text-slate-900">
              {overall} Quality
            </span>
          </div>

          <p className="text-xs text-slate-600 mt-4 line-clamp-3 italic px-2">
            "{health?.comments || 'Evaluated based on ingredient processing levels and macronutrient density.'}"
          </p>
        </div>

        {/* UK/EU Traffic Light Indicators & AI Recommendations */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-6">
          {/* Traffic Lights */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-emerald-600" />
              UK/EU FSA Traffic Light Breakdown (per 100g / serving)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div
                className={`p-3 rounded-xl border text-center ${
                  traffic?.fat === 'red'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : traffic?.fat === 'amber'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Fat</p>
                <p className="text-sm font-black mt-0.5">
                  {analysis.macros.total_fat.value ?? 'N/A'}g
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">
                  {traffic?.fat || 'Low'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  traffic?.saturated_fat === 'red'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : traffic?.saturated_fat === 'amber'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Sat Fat</p>
                <p className="text-sm font-black mt-0.5">
                  {analysis.macros.saturated_fat.value ?? 'N/A'}g
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">
                  {traffic?.saturated_fat || 'Low'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  traffic?.sugars === 'red'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : traffic?.sugars === 'amber'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Sugars</p>
                <p className="text-sm font-black mt-0.5">
                  {analysis.macros.total_sugars.value ?? 'N/A'}g
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">
                  {traffic?.sugars || 'Low'}
                </span>
              </div>

              <div
                className={`p-3 rounded-xl border text-center ${
                  traffic?.salt === 'red'
                    ? 'bg-rose-50 border-rose-200 text-rose-900'
                    : traffic?.salt === 'amber'
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                }`}
              >
                <p className="text-[10px] font-bold uppercase tracking-wider opacity-75">Sodium</p>
                <p className="text-sm font-black mt-0.5">
                  {analysis.macros.sodium.value ?? 'N/A'}mg
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">
                  {traffic?.salt || 'Low'}
                </span>
              </div>
            </div>
          </div>

          {/* AI Actionable Recommendations */}
          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Actionable AI Nutrition Insights
            </h4>
            <ul className="space-y-1.5">
              {(health?.recommendations || ['Balanced component profile.']).map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Interactive Color-Coded Ingredients Analysis */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-600" />
              Ingredient Quality Breakdown ({flags.length} items)
            </h3>
            <p className="text-xs text-slate-500">
              Color-coded by nutritional impact: Green (Beneficial), Amber (Moderate), Red (Harmful / Ultra-Processed). Click an ingredient to inspect reasons.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0">
            <button
              onClick={() => setActiveIngredientFilter('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeIngredientFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({flags.length})
            </button>
            <button
              onClick={() => setActiveIngredientFilter('green')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeIngredientFilter === 'green'
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              Green ({flags.filter((i) => i.color === 'green').length})
            </button>
            <button
              onClick={() => setActiveIngredientFilter('amber')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeIngredientFilter === 'amber'
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              Amber ({flags.filter((i) => i.color === 'amber').length})
            </button>
            <button
              onClick={() => setActiveIngredientFilter('red')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                activeIngredientFilter === 'red'
                  ? 'bg-rose-600 text-white shadow-2xs'
                  : 'text-rose-700 hover:bg-rose-50'
              }`}
            >
              Red ({flags.filter((i) => i.color === 'red').length})
            </button>
          </div>
        </div>

        {/* Ingredients Pills Grid */}
        <div className="flex flex-wrap gap-2 pt-2">
          {filteredFlags.map((ing, idx) => {
            const isExpanded = expandedIngredient === ing.name;
            const badgeBg =
              ing.color === 'green'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:border-emerald-400'
                : ing.color === 'red'
                ? 'bg-rose-50 text-rose-900 border-rose-200 hover:border-rose-400 font-bold'
                : 'bg-amber-50 text-amber-900 border-amber-200 hover:border-amber-400';

            return (
              <div key={idx} className="relative">
                <button
                  onClick={() => setExpandedIngredient(isExpanded ? null : ing.name)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${badgeBg}`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      ing.color === 'green'
                        ? 'bg-emerald-500'
                        : ing.color === 'red'
                        ? 'bg-rose-500 animate-pulse'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span>{ing.name}</span>
                  {ing.categoryTag && (
                    <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-white/80 font-bold tracking-wider opacity-80">
                      {ing.categoryTag}
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="w-3 h-3 ml-0.5 opacity-60" />
                  ) : (
                    <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />
                  )}
                </button>

                {/* Expanded Details Card */}
                {isExpanded && (
                  <div className="mt-2 p-3 bg-slate-900 text-white rounded-xl shadow-xl border border-slate-800 text-xs space-y-1 z-30 max-w-xs">
                    <p className="font-bold text-emerald-400">{ing.name}</p>
                    <p className="text-slate-300">{ing.reason}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Structured Nutrition Facts Panel Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-lg">Structured Nutrition Facts Panel</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider">
                <th className="py-2.5 px-4">Nutrient</th>
                <th className="py-2.5 px-4">Value per Serving</th>
                <th className="py-2.5 px-4">Standardized Unit</th>
                <th className="py-2.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800 font-medium">
              <tr>
                <td className="py-2 px-4 font-bold">Calories</td>
                <td className="py-2 px-4">{analysis.macros.calories.value ?? 'N/A'}</td>
                <td className="py-2 px-4">kcal</td>
                <td className="py-2 px-4 text-slate-500">Energy Density</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold">Total Fat</td>
                <td className="py-2 px-4">{analysis.macros.total_fat.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4">{traffic?.fat === 'red' ? '⚠️ High' : 'OK'}</td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-2 px-4 pl-8 text-slate-600">Saturated Fat</td>
                <td className="py-2 px-4">{analysis.macros.saturated_fat.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4">{traffic?.saturated_fat === 'red' ? '⚠️ High' : 'OK'}</td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-2 px-4 pl-8 text-slate-600">Trans Fat</td>
                <td className="py-2 px-4">{analysis.macros.trans_fat.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4">
                  {(analysis.macros.trans_fat.value ?? 0) > 0 ? '❌ Contains Trans Fat' : 'Zero'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold">Cholesterol</td>
                <td className="py-2 px-4">{analysis.macros.cholesterol.value ?? 'N/A'}</td>
                <td className="py-2 px-4">mg</td>
                <td className="py-2 px-4">OK</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold">Sodium</td>
                <td className="py-2 px-4">{analysis.macros.sodium.value ?? 'N/A'}</td>
                <td className="py-2 px-4">mg</td>
                <td className="py-2 px-4">{traffic?.salt === 'red' ? '⚠️ High Sodium' : 'OK'}</td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold">Total Carbohydrates</td>
                <td className="py-2 px-4">{analysis.macros.total_carbohydrates.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4">OK</td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-2 px-4 pl-8 text-slate-600">Dietary Fiber</td>
                <td className="py-2 px-4">{analysis.macros.dietary_fiber.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4 text-emerald-600 font-bold">
                  {(analysis.macros.dietary_fiber.value ?? 0) >= 3 ? '🌱 High Fiber' : 'Low'}
                </td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-2 px-4 pl-8 text-slate-600">Total Sugars</td>
                <td className="py-2 px-4">{analysis.macros.total_sugars.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4">{traffic?.sugars === 'red' ? '⚠️ High Sugars' : 'OK'}</td>
              </tr>
              <tr className="bg-slate-50/30">
                <td className="py-2 px-4 pl-8 text-slate-600">Added Sugars</td>
                <td className="py-2 px-4">{analysis.macros.added_sugars.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4 font-bold text-rose-600">
                  {(analysis.macros.added_sugars.value ?? 0) > 10 ? '🚨 Refined Sugar' : 'Low'}
                </td>
              </tr>
              <tr>
                <td className="py-2 px-4 font-bold">Protein</td>
                <td className="py-2 px-4">{analysis.macros.protein.value ?? 'N/A'}</td>
                <td className="py-2 px-4">g</td>
                <td className="py-2 px-4 text-emerald-600 font-bold">
                  {(analysis.macros.protein.value ?? 0) >= 10 ? '💪 High Protein' : 'Moderate'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Healthier Alternatives Recommendations Section */}
      {alternatives.length > 0 && (
        <div className="bg-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-emerald-900 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-emerald-100">Recommended Healthier Alternatives</h3>
            </div>
            <span className="text-xs text-emerald-300 font-medium">Higher score products in same category</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternatives.map((alt) => (
              <div
                key={alt.id}
                className="bg-slate-900/90 border border-emerald-800/80 rounded-xl p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {alt.brand}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
                      {alt.healthScore}/10
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{alt.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alt.reason}</p>
                </div>
                <button
                  onClick={() => onAddToCompare(alt.analysis)}
                  className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" />
                  Compare with Scanned Product
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Non-Medical Notice Disclaimer */}
      <p className="text-center text-xs text-slate-400 font-medium pt-2">
        ℹ️ NutriSense_AI general guidance notice — Analysis generated via AI and food science rules engine. Not a substitute for personalized medical advice or prescription diet therapy.
      </p>
    </div>
  );
};
