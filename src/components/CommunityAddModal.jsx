import React, { useState } from 'react';
import { X, UserPlus, Save, Sparkles } from 'lucide-react';
import { buildAnalysisFromText } from '../utils/productDatabase';
import { analyzeProductRules } from '../utils/rulesEngine';
import { getUserPreferences } from '../utils/productDatabase';

const CATEGORIES = ['Packaged Foods', 'Snacks', 'Beverages', 'Dairy', 'Bakery & Grains', 'Sauces & Condiments', 'Canned Goods', 'Frozen Foods', 'General Food'];

const MACRO_FIELDS = [
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'total_fat', label: 'Total Fat', unit: 'g' },
  { key: 'saturated_fat', label: 'Saturated Fat', unit: 'g' },
  { key: 'trans_fat', label: 'Trans Fat', unit: 'g' },
  { key: 'cholesterol', label: 'Cholesterol', unit: 'mg' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
  { key: 'total_carbohydrates', label: 'Total Carbs', unit: 'g' },
  { key: 'dietary_fiber', label: 'Dietary Fiber', unit: 'g' },
  { key: 'total_sugars', label: 'Total Sugars', unit: 'g' },
  { key: 'added_sugars', label: 'Added Sugars', unit: 'g' },
  { key: 'protein', label: 'Protein', unit: 'g' },
];

export default function CommunityAddModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Packaged Foods');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsText, setIngredientsText] = useState('');
  const [macros, setMacros] = useState({});

  if (!isOpen) return null;

  const setMacro = (key, value) => {
    setMacros((prev) => ({ ...prev, [key]: value === '' ? null : Number(value) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const prefs = getUserPreferences();
    const parsed = buildAnalysisFromText(ingredientsText, name.trim(), brand.trim(), prefs);

    Object.keys(macros).forEach((key) => {
      if (macros[key] !== null && macros[key] !== undefined && !isNaN(macros[key])) {
        parsed.macros[key] = { value: macros[key], unit: parsed.macros[key]?.unit || 'g' };
      }
    });

    parsed.health = analyzeProductRules(parsed.product_name, parsed.brand, parsed.ingredients, parsed.macros, parsed.serving_info, prefs);

    onSave({
      name: parsed.product_name,
      brand: parsed.brand,
      barcode: barcode.trim(),
      category,
      imageUrl: imageUrl.trim(),
      analysis: parsed,
      isCommunity: true,
    });
    onClose();
    setName('');
    setBrand('');
    setBarcode('');
    setCategory('Packaged Foods');
    setImageUrl('');
    setIngredientsText('');
    setMacros({});
  };

  const inputCls =
    'w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Add a Community Product</h2>
              <p className="text-xs text-slate-400">Contributions are stored locally in your browser catalog</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Product name *" className={inputCls} />
            <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand" className={inputCls} />
            <input value={barcode} onChange={(e) => setBarcode(e.target.value.replace(/\D/g, ''))} placeholder="Barcode (optional)" className={inputCls} inputMode="numeric" />
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="Image URL (optional)" className={`${inputCls} sm:col-span-2`} />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Ingredients List <span className="text-emerald-400">*</span>
            </label>
            <textarea
              required
              value={ingredientsText}
              onChange={(e) => setIngredientsText(e.target.value)}
              rows={4}
              placeholder="e.g. Rolled oats, honey, almonds, sea salt..."
              className={`${inputCls} resize-none font-mono leading-relaxed`}
            />
            <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Additives, E-numbers, preservatives and allergens are auto-flagged.
            </p>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
              Nutrition Facts <span className="text-slate-600">(per serving — optional, auto-detected from text)</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {MACRO_FIELDS.map((f) => (
                <label key={f.key} className="block">
                  <span className="text-[9px] text-slate-500 font-bold uppercase block mb-1">{f.label} ({f.unit})</span>
                  <input
                    type="number"
                    step="0.1"
                    value={macros[f.key] ?? ''}
                    onChange={(e) => setMacro(f.key, e.target.value)}
                    placeholder="—"
                    className={inputCls}
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Save className="w-4 h-4" /> Save to Catalog
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
