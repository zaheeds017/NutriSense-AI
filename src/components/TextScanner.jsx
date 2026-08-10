import React, { useState } from 'react';
import { ClipboardPaste, Type, Wand2, Loader2, Info } from 'lucide-react';

const TEXT_SAMPLES = [
  {
    label: 'Granola Bar',
    text: 'INGREDIENTS: Rolled oats, honey, almonds, dates, chia seeds, sea salt, vanilla extract. Nutrition Facts: Serving Size 1 bar (45g). Calories 190, Total Fat 7g, Saturated Fat 1g, Trans Fat 0g, Cholesterol 0mg, Sodium 95mg, Total Carbohydrates 27g, Dietary Fiber 4g, Total Sugars 12g, Added Sugars 8g, Protein 5g.',
  },
  {
    label: 'Vegetable Pasta',
    text: 'INGREDIENTS: Durum wheat semolina, spinach powder, tomato powder, water. Nutrition Facts: Serving Size 2 oz (56g). Calories 200, Total Fat 1g, Saturated Fat 0.2g, Cholesterol 0mg, Sodium 5mg, Total Carbohydrates 41g, Dietary Fiber 3g, Total Sugars 2g, Protein 7g.',
  },
  {
    label: 'Protein Shake',
    text: 'INGREDIENTS: Whey protein isolate, water, cocoa, erythritol, natural flavor, salt, sunflower lecithin, xanthan gum. Nutrition Facts: Serving Size 1 bottle (414ml). Calories 150, Total Fat 2g, Saturated Fat 1g, Trans Fat 0g, Cholesterol 15mg, Sodium 400mg, Total Carbohydrates 6g, Dietary Fiber 1g, Total Sugars 1g, Added Sugars 0g, Protein 30g.',
  },
];

export default function TextScanner({ onTextScanned, isProcessing }) {
  const [text, setText] = useState('');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [pasted, setPasted] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (clipText) {
        setText(clipText);
        setPasted(true);
      }
    } catch (err) {
      console.warn('Clipboard read denied:', err);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || isProcessing) return;
    onTextScanned({ rawText: text.trim(), productName: productName.trim() || null, brand: brand.trim() || null });
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-violet-500/20 to-emerald-500/20 border border-violet-500/30 text-violet-400">
            <Type className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">Label Text Scanner</h2>
            <p className="text-xs text-slate-400">Paste or type an ingredients & nutrition list for instant health analysis</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Product name (optional), e.g. Almond Granola Bar"
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Brand (optional), e.g. Naturals"
              className="px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
            />
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={10}
              placeholder={`Paste the full ingredients list and Nutrition Facts here...\n\nExample:\nINGREDIENTS: Rolled oats, honey, almonds, salt.\nNutrition Facts: Serving Size 1 bar (45g).\nCalories 190, Total Fat 7g, ...`}
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-emerald-500 transition-all resize-none font-mono"
            />
            <button
              type="button"
              onClick={handlePasteFromClipboard}
              className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold transition-all flex items-center gap-1.5 border border-slate-700"
            >
              <ClipboardPaste className="w-3 h-3" /> {pasted ? 'Re-Paste' : 'Paste from Clipboard'}
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Try a sample:</span>
              {TEXT_SAMPLES.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setText(s.text)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                    text === s.text
                      ? 'bg-violet-500/20 border-violet-500/40 text-violet-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-violet-500/40 hover:text-violet-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={!text.trim() || isProcessing}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-500 to-emerald-600 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25 w-full sm:w-auto"
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {isProcessing ? 'Analyzing Label Text...' : 'Analyze Label Text'}
            </button>
          </div>
        </form>

        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start gap-2.5 text-[11px] text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <span>
            The parser extracts Nutrition Facts macros (calories, fat, sodium, carbs, fiber, sugars, protein), then runs the full
            rules engine for a 1–10 health score, UK/EU traffic lights, color-coded ingredient flags, allergen and dietary
            compatibility checks.
          </span>
        </div>
      </div>
    </div>
  );
}
