import React from 'react';
import { calculateNutriScore, calculateNovaGroup, calculateDailyValuePercent, analyzeIngredientsList } from '../utils/healthAnalyzer';
import { ShieldAlert, AlertTriangle, Flame, Code, Info, HeartPulse } from 'lucide-react';

export default function NutritionDashboard({ scanResult, onOpenJsonView }) {
  if (!scanResult || !scanResult.data) return null;

  const { data, source, sampleMeta } = scanResult;
  const { serving_info, macros, ingredients, allergens_identified } = data;

  // Compute metrics
  const nutri = calculateNutriScore(macros);
  const nova = calculateNovaGroup(ingredients);
  const { additives } = analyzeIngredientsList(ingredients);

  // Calorie & macro values
  const calories = macros.calories?.value || 0;
  const totalFat = macros.total_fat?.value || 0;
  const satFat = macros.saturated_fat?.value || 0;
  const transFat = macros.trans_fat?.value || 0;
  const cholesterol = macros.cholesterol?.value || 0;
  const sodium = macros.sodium?.value || 0;
  const totalCarbs = macros.total_carbohydrates?.value || 0;
  const fiber = macros.dietary_fiber?.value || 0;
  const totalSugars = macros.total_sugars?.value || 0;
  const addedSugars = macros.added_sugars?.value || 0;
  const protein = macros.protein?.value || 0;

  // Calculate macro ratios for chart
  const fatCal = totalFat * 9;
  const carbCal = totalCarbs * 4;
  const proteinCal = protein * 4;
  const totalMacroCal = (fatCal + carbCal + proteinCal) || 1;

  const fatPct = Math.round((fatCal / totalMacroCal) * 100);
  const carbPct = Math.round((carbCal / totalMacroCal) * 100);
  const proteinPct = Math.round((proteinCal / totalMacroCal) * 100);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Banner: Product Title / Source & JSON Switcher */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {sampleMeta?.imageUrl ? (
            <img src={sampleMeta.imageUrl} alt="Package" className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-emerald-400 font-bold">
                <HeartPulse className="w-7 h-7" />
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider">
                {source || 'AI Vision Extracted'}
              </span>
              <span className="text-xs text-slate-400">
                Serving: <strong className="text-slate-200">{serving_info.serving_size || '1 Portion'}</strong>
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              {sampleMeta?.name || 'Extracted Packaged Food Item'}
            </h2>
          </div>
        </div>

        <button
          onClick={onOpenJsonView}
          className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-cyan-300 font-bold text-xs border border-slate-700/80 transition-all flex items-center gap-2 shadow-lg"
        >
          <Code className="w-4 h-4" />
          <span>View Schema JSON Output</span>
        </button>
      </div>

      {/* Health Score & Processing Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Nutri-Score Card */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nutri-Score Rating</span>
            <h3 className="text-lg font-bold text-white mt-0.5">{nutri.label} Quality</h3>
            <p className="text-xs text-slate-400">Standardized European FDA rating</p>
          </div>
          <div className={`w-14 h-14 rounded-2xl ${nutri.bg} text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg shadow-emerald-500/10`}>
            {nutri.grade}
          </div>
        </div>

        {/* NOVA Food Processing Card */}
        <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">NOVA Classification</span>
            <h3 className="text-lg font-bold text-white mt-0.5">Group {nova.group}</h3>
            <p className="text-xs text-slate-400 line-clamp-1">{nova.label}</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 text-amber-400 font-bold text-lg flex items-center justify-center">
            {nova.group}
          </div>
        </div>

        {/* Calories Highlight Card */}
        <div className="p-5 rounded-3xl bg-gradient-to-tr from-amber-500/10 via-slate-900 to-slate-900 border border-amber-500/20 backdrop-blur-md shadow-xl flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5" /> Energy Content
            </span>
            <h3 className="text-2xl font-black text-white mt-0.5">{calories} <span className="text-sm font-semibold text-slate-400">kcal</span></h3>
            <p className="text-xs text-slate-400">per serving</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
            {calculateDailyValuePercent('calories', calories) || 0}%
          </div>
        </div>

      </div>

      {/* Main Nutrition Facts & Macro Distribution Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Detailed Nutrition Facts & DV% */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-extrabold text-white tracking-tight">Nutrition Facts Breakdown</h3>
            <span className="text-xs text-slate-400 font-mono">% Daily Value (DV)* based on 2,000 kcal</span>
          </div>

          <div className="space-y-3.5">
            {/* Total Fat */}
            <MacroRow title="Total Fat" value={totalFat} unit="g" dvKey="total_fat" isBold />
            <MacroRow title="Saturated Fat" value={satFat} unit="g" dvKey="saturated_fat" indent />
            <MacroRow title="Trans Fat" value={transFat} unit="g" indent />

            {/* Cholesterol & Sodium */}
            <div className="pt-2 border-t border-slate-800/80" />
            <MacroRow title="Cholesterol" value={cholesterol} unit="mg" dvKey="cholesterol" isBold />
            <MacroRow title="Sodium" value={sodium} unit="mg" dvKey="sodium" isBold isDanger={sodium > 800} />

            {/* Carbohydrates */}
            <div className="pt-2 border-t border-slate-800/80" />
            <MacroRow title="Total Carbohydrates" value={totalCarbs} unit="g" dvKey="total_carbohydrates" isBold />
            <MacroRow title="Dietary Fiber" value={fiber} unit="g" dvKey="dietary_fiber" indent isSuccess={fiber >= 3} />
            <MacroRow title="Total Sugars" value={totalSugars} unit="g" indent />
            <MacroRow title="Includes Added Sugars" value={addedSugars} unit="g" dvKey="added_sugars" doubleIndent isWarning={addedSugars > 10} />

            {/* Protein */}
            <div className="pt-2 border-t border-slate-800/80" />
            <MacroRow title="Protein" value={protein} unit="g" dvKey="protein" isBold isSuccess={protein >= 10} />
          </div>
        </div>

        {/* Right Column: Macro Ratio Donut & Health Alerts */}
        <div className="space-y-6">
          
          {/* Caloric Distribution */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Caloric Macro Balance</h4>
            
            {/* Multi-segment Bar */}
            <div className="w-full h-4 rounded-full bg-slate-950 overflow-hidden flex mb-4 border border-slate-800">
              <div style={{ width: `${fatPct}%` }} className="bg-amber-400 h-full transition-all" title={`Fat ${fatPct}%`} />
              <div style={{ width: `${carbPct}%` }} className="bg-cyan-400 h-full transition-all" title={`Carbs ${carbPct}%`} />
              <div style={{ width: `${proteinPct}%` }} className="bg-emerald-400 h-full transition-all" title={`Protein ${proteinPct}%`} />
            </div>

            {/* Legend */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-amber-400 font-bold">Fats</div>
                <div className="text-xs font-bold text-white">{fatPct}%</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-cyan-400 font-bold">Carbs</div>
                <div className="text-xs font-bold text-white">{carbPct}%</div>
              </div>
              <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="text-[10px] text-emerald-400 font-bold">Protein</div>
                <div className="text-xs font-bold text-white">{proteinPct}%</div>
              </div>
            </div>
          </div>

          {/* Allergen Identified Alert */}
          {allergens_identified.length > 0 && (
            <div className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/30 backdrop-blur-xl shadow-xl">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                <ShieldAlert className="w-4 h-4" /> Allergens Identified ({allergens_identified.length})
              </div>
              <div className="flex flex-wrap gap-1.5">
                {allergens_identified.map((allergen, i) => (
                  <span key={i} className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs border border-rose-500/30">
                    {allergen}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Additive Watchlist Alerts */}
          {additives.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 backdrop-blur-xl shadow-xl space-y-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                <AlertTriangle className="w-4 h-4" /> Additives & Processing Watchlist
              </div>
              {additives.map((add, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs">
                  <div className="font-bold text-white">{add.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{add.note}</div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* Complete Ingredients List Card */}
      {ingredients && ingredients.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-400" /> Complete Extracted Ingredients List ({ingredients.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {ingredients.map((item, idx) => (
              <span
                key={idx}
                className="px-3 py-1.5 rounded-xl bg-slate-950 text-slate-300 text-xs border border-slate-800 hover:border-slate-700 transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}

function MacroRow({ title, value, unit, dvKey, isBold, indent, doubleIndent, isDanger, isWarning, isSuccess }) {
  const dvPct = dvKey ? calculateDailyValuePercent(dvKey, value) : null;
  const paddingLeft = doubleIndent ? 'pl-8' : indent ? 'pl-4' : 'pl-0';

  return (
    <div className={`flex items-center justify-between text-xs ${paddingLeft}`}>
      <div className="flex items-center gap-2">
        <span className={`${isBold ? 'font-extrabold text-white' : 'font-medium text-slate-300'}`}>
          {title}
        </span>
        {isDanger && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="High Intake Warning" />}
        {isWarning && <span className="w-2 h-2 rounded-full bg-amber-500" title="Moderate Warning" />}
        {isSuccess && <span className="w-2 h-2 rounded-full bg-emerald-400" title="High Beneficial Level" />}
      </div>

      <div className="flex items-center gap-4">
        <span className="font-mono text-slate-200">
          {value !== null && value !== undefined ? `${value}${unit}` : 'null'}
        </span>
        
        <div className="w-12 text-right">
          {dvPct !== null ? (
            <span className={`font-mono text-[11px] font-bold ${
              dvPct > 30 ? 'text-amber-400' : 'text-slate-400'
            }`}>
              {dvPct}%
            </span>
          ) : (
            <span className="text-[11px] text-slate-600">—</span>
          )}
        </div>
      </div>
    </div>
  );
}
