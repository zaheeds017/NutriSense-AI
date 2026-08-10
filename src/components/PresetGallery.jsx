import React from 'react';
import { SAMPLE_FOOD_PACKAGES } from '../utils/sampleDatabase';
import { Sparkles, Barcode, ArrowUpRight } from 'lucide-react';

export default function PresetGallery({ onSelectPreset }) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      
      <div className="mb-6 text-center max-w-2xl mx-auto">
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2">Preset Packaged Foods Library</h2>
        <p className="text-xs text-slate-400">
          Select any real-world snack or packaged food below to immediately simulate scanning, view OCR label text, and inspect schema-validated JSON extraction.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {SAMPLE_FOOD_PACKAGES.map((pkg) => {
          const nutriGrade = pkg.nutriScore;
          const gradeColor =
            nutriGrade === 'A' ? 'bg-emerald-500 text-slate-950' :
            nutriGrade === 'B' ? 'bg-lime-500 text-slate-950' :
            nutriGrade === 'C' ? 'bg-amber-500 text-slate-950' :
            nutriGrade === 'D' ? 'bg-orange-500 text-slate-950' : 'bg-rose-500 text-white';

          return (
            <div
              key={pkg.id}
              onClick={() => onSelectPreset(pkg.id)}
              className="rounded-3xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-5 cursor-pointer transition-all duration-300 group shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* Header Image & Badges */}
                <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-4">
                  <img
                    src={pkg.imageUrl}
                    alt={pkg.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

                  {/* NutriScore Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className={`w-8 h-8 rounded-xl font-extrabold text-sm flex items-center justify-center shadow-lg ${gradeColor}`}>
                      {nutriGrade}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[10px] font-semibold text-slate-200 border border-slate-800">
                      NOVA {pkg.novaGroup}
                    </span>
                  </div>

                  {/* Barcode Pill */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-800">
                    <Barcode className="w-3 h-3 text-emerald-400" />
                    <span>{pkg.barcode}</span>
                  </div>
                </div>

                {/* Info */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">{pkg.brand} • {pkg.category}</span>
                  <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 mt-0.5">
                    {pkg.name}
                  </h3>
                </div>

                {/* Macro Pill Grid */}
                <div className="grid grid-cols-4 gap-2 mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-center">
                  <div>
                    <div className="text-[10px] text-slate-400">Calories</div>
                    <div className="text-xs font-bold text-white">{pkg.extractedJson.macros.calories.value}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Fat</div>
                    <div className="text-xs font-bold text-white">{pkg.extractedJson.macros.total_fat.value}g</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Sodium</div>
                    <div className="text-xs font-bold text-white">{pkg.extractedJson.macros.sodium.value}mg</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Protein</div>
                    <div className="text-xs font-bold text-white">{pkg.extractedJson.macros.protein.value}g</div>
                  </div>
                </div>

                {/* Allergens Identified */}
                {pkg.extractedJson.allergens_identified.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span className="text-[10px] font-semibold text-slate-400">Allergens:</span>
                    {pkg.extractedJson.allergens_identified.map((allergen, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20 text-[10px] font-medium">
                        {allergen}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Button */}
              <button
                className="w-full py-2.5 rounded-xl bg-slate-800 group-hover:bg-gradient-to-r group-hover:from-emerald-500 group-hover:to-teal-600 group-hover:text-slate-950 text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <Sparkles className="w-4 h-4" />
                <span>Simulate Scan & Parse JSON</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

            </div>
          );
        })}
      </div>

    </div>
  );
}
