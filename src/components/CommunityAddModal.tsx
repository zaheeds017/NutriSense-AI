import React, { useState } from 'react';
import { PlusCircle, Sparkles, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { AnalysisResultContract } from '../types';

interface CommunityAddModalProps {
  onAddProductSuccess: (analysis: AnalysisResultContract) => void;
}

export const CommunityAddModal: React.FC<CommunityAddModalProps> = ({ onAddProductSuccess }) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [barcode, setBarcode] = useState('');
  const [category, setCategory] = useState('Snack Foods');
  const [ingredientsText, setIngredientsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !barcode.trim() || !ingredientsText.trim()) {
      setError('Product Name, Barcode, and Ingredients text are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          brand: brand.trim() || 'Community Contributed',
          barcode: barcode.trim(),
          category,
          ingredientsText: ingredientsText.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit community product');
      }

      onAddProductSuccess(data.analysis);
    } catch (err: any) {
      setError(err.message || 'Error creating community product.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
          <PlusCircle className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Contribute New Packaged Food</h2>
          <p className="text-xs text-slate-500">
            Submit a new food product to the open NutriSense_AI community database. AI will analyze the ingredients and calculate a health score instantly.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Organic Multigrain Crackers"
              id="community-input-name"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Brand / Manufacturer
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Simple Mills"
              id="community-input-brand"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              UPC / EAN Barcode Number *
            </label>
            <input
              type="text"
              required
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              placeholder="e.g. 012345678901"
              id="community-input-barcode"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Food Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              id="community-select-category"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Snack Foods">Snack Foods</option>
              <option value="Breakfast Grains">Breakfast Grains</option>
              <option value="Spreads & Sweeteners">Spreads & Sweeteners</option>
              <option value="Dairy & Yogurt">Dairy & Yogurt</option>
              <option value="Plant Milk">Plant Milk</option>
              <option value="Beverages">Beverages</option>
              <option value="Condiments">Condiments</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
            Ingredients List Text *
          </label>
          <textarea
            required
            rows={5}
            value={ingredientsText}
            onChange={(e) => setIngredientsText(e.target.value)}
            placeholder="INGREDIENTS: Organic Cassava Flour, Organic Sunflower Oil, Sea Salt, Rosemary Extract..."
            id="community-input-ingredients"
            className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            id="community-submit-btn"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Analyzing & Adding Product...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Submit & Analyze Product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
