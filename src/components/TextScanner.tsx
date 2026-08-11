import React, { useState } from 'react';
import { AlignLeft, Sparkles, RefreshCw, FileText } from 'lucide-react';

interface TextScannerProps {
  onAnalyzeText: (text: string, productName?: string, brand?: string) => void;
  isLoading: boolean;
}

const PRESET_TEXT_LABELS = [
  {
    title: 'US FDA Granola Bar Label',
    productName: 'Honey Almond Granola Bar',
    brand: 'Nature Choice',
    text: `Serving Size: 1 bar (42g)
Servings Per Container: 6
Calories: 190
Total Fat: 7g
Saturated Fat: 1g
Trans Fat: 0g
Cholesterol: 0mg
Sodium: 115mg
Total Carbohydrate: 29g
Dietary Fiber: 3g
Total Sugars: 11g
Added Sugars: 9g
Protein: 4g

INGREDIENTS: Whole Grain Rolled Oats, Cane Sugar, Whole Grain Wheat, Almonds, Canola Oil, Honey, Rice Flour, Salt, Soy Lecithin, Natural Flavor.
CONTAINS WHEAT, ALMOND AND SOY INGREDIENTS.`,
  },
  {
    title: 'EU Hazelnut Chocolate Spread',
    productName: 'ChocoHazel Spread',
    brand: 'EuroDelight',
    text: `Typical values per 100g:
Energy: 2200 kJ / 530 kcal
Fat: 31g
of which saturates: 10g
Carbohydrates: 57g
of which sugars: 51g
Fiber: 3g
Protein: 6g
Salt: 0.15g

INGREDIENTS: Sugar, Palm Oil, Hazelnuts (13%), Skimmed Milk Powder (8.7%), Fat-Reduced Cocoa Powder (7.4%), Emulsifier: Soy Lecithin, Vanillin.`,
  },
  {
    title: 'Noisy OCR Ultra-Processed Snack',
    productName: 'Cheese Flavored Puff Snax',
    brand: 'CrunchyCo',
    text: `Calories 160. Total Fat 10g, Sat Fat 2.5g, Trans Fat 0g, Sodium 240mg, Carbs 15g, Fiber 0g, Sugars 2g, Added Sugars 1g, Protein 1g.
INGREDlENTS: Enriched Corn Meal, Vegetable Oil (Palm Oil, Hydrogenated Soybean Oil), Cheddar Cheese (Milk, Cheese Cultures, Salt, Enzymes), High Fructose Corn Syrup, Salt, Monosodium Glutamate, Yellow 6, Red 40, Artificial Flavor, Preservative (Sodium Nitrite, BHT).`,
  },
];

export const TextScanner: React.FC<TextScannerProps> = ({ onAnalyzeText, isLoading }) => {
  const [inputText, setInputText] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAnalyzeText(inputText.trim(), productName.trim() || undefined, brand.trim() || undefined);
    }
  };

  const loadPreset = (preset: typeof PRESET_TEXT_LABELS[0]) => {
    setInputText(preset.text);
    setProductName(preset.productName);
    setBrand(preset.brand);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <AlignLeft className="w-5 h-5 text-emerald-600" />
            Paste Ingredients & Nutrition Label Text
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Directly paste text from any online store or food product box. NutriSense_AI extracts macros, identifies ingredients, flags food additives, and checks 14 EU/US allergens.
          </p>
        </div>

        {/* Product Context */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Product Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Honey Nut Oat Cluster"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Brand (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Quaker / Kellogg's"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Text Area */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Ingredient List & Nutrition Data Text
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={7}
            placeholder={`Paste label text here, e.g.:
INGREDIENTS: Whole grain rolled oats, cane sugar, palm oil, salt...
Calories: 150, Total Fat: 3g, Sugars: 12g, Sodium: 120mg...`}
            id="paste-text-input-area"
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            id="submit-text-scan-btn"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing Text with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Analyze Text
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preset Presets Box */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Quick Preset Labels (Click to Test)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {PRESET_TEXT_LABELS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="p-3 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition-all text-xs font-medium text-slate-700 shadow-2xs group"
            >
              <p className="font-bold text-slate-900 group-hover:text-emerald-900">{preset.title}</p>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">{preset.productName}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
