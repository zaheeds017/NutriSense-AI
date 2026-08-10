import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  Scale,
  CheckCircle2,
  AlertTriangle,
  ThumbsUp,
  HeartPulse,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

function scoreColor(score) {
  if (score >= 8.5) return { ring: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', label: 'text-emerald-300' };
  if (score >= 7.0) return { ring: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300', label: 'text-emerald-300' };
  if (score >= 5.0) return { ring: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-300', label: 'text-amber-300' };
  if (score >= 3.0) return { ring: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30 text-orange-300', label: 'text-orange-300' };
  return { ring: 'text-rose-400', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-300', label: 'text-rose-300' };
}

export default function HealthScorePanel({ scanResult, userPrefs = {}, alternatives = [], onAddToCompare, isInCompare }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState(null);

  if (!scanResult || !scanResult.data) return null;
  const { data } = scanResult;
  const health = data.health;

  if (!health) return null;

  const score = health.score ?? 5;
  const overall = health.overall ?? 'Moderate';
  const colors = scoreColor(score);

  const flags = health.ingredients_with_flags || [];
  const filteredFlags = flags.filter((f) => filter === 'all' || f.color === filter);

  const enginePersonalFlags = health.personal_flags || [];
  const personalConflicts = enginePersonalFlags.length > 0
    ? enginePersonalFlags.filter((f) => f.type === 'allergen').map((f) => `${f.value}${f.matched ? ` (${f.matched})` : ''}`)
    : (data.allergens_identified || []).filter((a) =>
        (userPrefs.allergens || []).some((pref) => pref.toLowerCase() === a.toLowerCase() || a.toLowerCase().includes(pref.toLowerCase()))
      );
  const dietConflicts = enginePersonalFlags.length > 0
    ? enginePersonalFlags.filter((f) => f.type === 'diet').map((f) => `${f.value} (${f.reason})`)
    : (health.dietary_flags || []).filter(
        (df) => (userPrefs.dietRestrictions || []).some((dr) => dr.toLowerCase() === df.diet.toLowerCase()) && !df.suitable
      );

  const traffic = health.traffic_light || {};
  const trafficLabels = { fat: 'Fat', saturated_fat: 'Sat Fat', sugars: 'Sugars', salt: 'Sodium' };
  const trafficValues = {
    fat: data.macros?.total_fat?.value,
    saturated_fat: data.macros?.saturated_fat?.value,
    sugars: data.macros?.total_sugars?.value,
    salt: data.macros?.sodium?.value,
  };

  return (
    <div className="space-y-6">
      {/* Critical Personal Dietary Conflict Banner */}
      {(personalConflicts.length > 0 || dietConflicts.length > 0) && (
        <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/40 backdrop-blur-xl shadow-xl space-y-2">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <h3 className="font-extrabold text-rose-300 text-sm tracking-tight">PERSONAL DIETARY CONFLICT WARNING</h3>
          </div>
          <div className="text-xs space-y-1.5 pl-7 text-slate-300">
            {personalConflicts.length > 0 && (
              <p>
                <strong className="text-rose-300 underline">Contains Allergen Match:</strong>{' '}
                {personalConflicts.join(', ')} (matches your profile settings).
              </p>
            )}
            {dietConflicts.length > 0 && (
              <p>
                <strong className="text-rose-300 underline">Unsuitable for Diet:</strong>{' '}
                {dietConflicts.map((c) => `${c.diet} (${c.reason})`).join('; ')}
              </p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 1-10 Health Score Gauge */}
        <div className={`p-6 rounded-3xl border backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center ${colors.bg}`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1">
            <HeartPulse className="w-3.5 h-3.5" /> NutriSense_AI Health Score
          </p>

          <div className="relative w-36 h-36 flex items-center justify-center my-2">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="10" className="text-slate-800 fill-none" />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="10"
                strokeDasharray={263.89}
                strokeDashoffset={263.89 - (263.89 * score) / 10}
                strokeLinecap="round"
                className={`fill-none transition-all duration-1000 ${colors.ring}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-black tracking-tight text-white">{score}</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">/ 10</span>
            </div>
          </div>

          <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-slate-950/80 border ${colors.label} border-slate-700`}>
            {overall} Quality
          </span>

          <p className="text-xs text-slate-400 mt-4 italic px-2 line-clamp-3">
            "{health.comments || 'Evaluated based on ingredient processing levels and macronutrient density.'}"
          </p>
        </div>

        {/* Traffic Lights + Recommendations */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-6">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
              UK/EU FSA Traffic Light Breakdown (per serving)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.keys(trafficLabels).map((key) => {
                const level = traffic[key] || 'green';
                const val = trafficValues[key];
                const unit = key === 'salt' ? 'mg' : 'g';
                const cls =
                  level === 'red'
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                    : level === 'amber'
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                    : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300';
                return (
                  <div key={key} className={`p-3 rounded-2xl border text-center ${cls}`}>
                    <p className="text-[10px] font-bold uppercase tracking-wider opacity-80">{trafficLabels[key]}</p>
                    <p className="text-sm font-black mt-0.5">{val ?? 'N/A'}{val !== null && val !== undefined ? unit : ''}</p>
                    <span className="text-[10px] font-bold uppercase tracking-wider block mt-1">{level}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Actionable Nutrition Insights
            </h4>
            <ul className="space-y-1.5">
              {(health.recommendations || ['Balanced component profile.']).map((rec, idx) => (
                <li key={idx} className="text-xs text-slate-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dietary Compatibility */}
          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-cyan-400" /> Dietary Compatibility
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(health.dietary_flags || []).map((df, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl border text-xs ${
                    df.suitable
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                  }`}
                  title={df.reason}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    {df.suitable ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
                    {df.diet}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{df.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Color-Coded Ingredients */}
      {flags.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-extrabold text-white tracking-tight">Ingredient Quality Breakdown ({flags.length})</h3>
              <p className="text-xs text-slate-400">
                Color-coded by nutritional impact: Green (Beneficial), Amber (Moderate), Red (Harmful / Ultra-Processed).
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              {['all', 'green', 'amber', 'red'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    filter === f
                      ? f === 'green' ? 'bg-emerald-500 text-slate-950' : f === 'red' ? 'bg-rose-500 text-white' : f === 'amber' ? 'bg-amber-500 text-slate-950' : 'bg-slate-700 text-white'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {f === 'all' ? `All (${flags.length})` : `${f} (${flags.filter((i) => i.color === f).length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {filteredFlags.map((ing, idx) => {
              const isExpanded = expanded === `${idx}-${ing.name}`;
              const badgeBg =
                ing.color === 'green'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:border-emerald-400'
                  : ing.color === 'red'
                  ? 'bg-rose-500/10 text-rose-300 border-rose-500/40 hover:border-rose-400 font-bold'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:border-amber-400';

              return (
                <div key={idx} className="relative">
                  <button
                    onClick={() => setExpanded(isExpanded ? null : `${idx}-${ing.name}`)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer ${badgeBg}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        ing.color === 'green' ? 'bg-emerald-400' : ing.color === 'red' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'
                      }`}
                    />
                    <span>{ing.name}</span>
                    {ing.categoryTag && (
                      <span className="text-[9px] uppercase px-1.5 py-0.5 rounded-md bg-slate-950/80 border border-slate-700 font-bold tracking-wider opacity-90">
                        {ing.categoryTag}
                      </span>
                    )}
                    {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5 opacity-60" /> : <ChevronDown className="w-3 h-3 ml-0.5 opacity-60" />}
                  </button>

                  {isExpanded && (
                    <div className="absolute z-30 mt-2 p-3 bg-slate-800 text-white rounded-xl shadow-xl border border-slate-700 text-xs space-y-1 w-64">
                      <p className="font-bold text-emerald-400">{ing.name}</p>
                      <p className="text-slate-300">{ing.reason}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Healthier Alternatives */}
      {alternatives.length > 0 && (
        <div className="p-6 rounded-3xl bg-emerald-950/60 border border-emerald-800/60 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ThumbsUp className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-lg text-emerald-100">Recommended Healthier Alternatives</h3>
            </div>
            <span className="text-xs text-emerald-300 font-medium">Higher score in same category</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {alternatives.map((alt) => (
              <div key={alt.id} className="bg-slate-900/90 border border-emerald-800/80 rounded-2xl p-4 space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{alt.brand}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-emerald-500 text-slate-950">{alt.healthScore}/10</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1">{alt.name}</h4>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-2">{alt.reason}</p>
                </div>
                <button
                  onClick={() => onAddToCompare && onAddToCompare(alt.analysis)}
                  className="w-full mt-2 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Scale className="w-3.5 h-3.5" /> Compare with Scanned Product
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Compare Action */}
      {onAddToCompare && (
        <button
          onClick={() => onAddToCompare(data)}
          className={`w-full py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
            isInCompare
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 text-slate-200 hover:text-white'
          }`}
        >
          <Scale className="w-4 h-4 text-emerald-400" />
          {isInCompare ? 'In Compare List' : 'Add to Side-by-Side Comparison'}
        </button>
      )}
    </div>
  );
}
