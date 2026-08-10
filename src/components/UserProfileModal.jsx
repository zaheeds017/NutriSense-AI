import React, { useState } from 'react';
import { X, UserCircle2, Save, ShieldAlert, Leaf } from 'lucide-react';
import { MAJOR_ALLERGENS } from '../utils/healthAnalyzer';

const DIET_OPTIONS = ['Vegan', 'Vegetarian', 'Gluten-Free', 'Keto', 'Halal', 'Kosher', 'Low-Sodium', 'Diabetic-Friendly'];

export default function UserProfileModal({ isOpen, onClose, onSave, prefs = { allergens: [], dietRestrictions: [] } }) {
  const [allergens, setAllergens] = useState(prefs.allergens || []);
  const [diets, setDiets] = useState(prefs.dietRestrictions || []);

  if (!isOpen) return null;

  const toggleAllergen = (id) => {
    setAllergens((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]));
  };

  const toggleDiet = (d) => {
    setDiets((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const handleSave = () => {
    onSave({ allergens, dietRestrictions: diets });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-emerald-400">
              <UserCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-white tracking-tight">Personalize Your Health Profile</h2>
              <p className="text-xs text-slate-400">Used for dietary conflict warnings on every scan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <ShieldAlert className="w-4 h-4 text-rose-400" /> Allergens to Flag
            </h3>
            <div className="flex flex-wrap gap-2">
              {MAJOR_ALLERGENS.map((a) => {
                const active = allergens.includes(a.id);
                return (
                  <button
                    key={a.id}
                    onClick={() => toggleAllergen(a.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-rose-500/15 border-rose-500/50 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : ''}{a.id}
                  </button>
                );
              })}
            </div>
            {allergens.length === 0 && (
              <p className="text-[11px] text-slate-500 mt-2">No allergens selected — scanning checks all products equally.</p>
            )}
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 mb-3">
              <Leaf className="w-4 h-4 text-emerald-400" /> Diet Restrictions
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {DIET_OPTIONS.map((d) => {
                const active = diets.includes(d);
                return (
                  <button
                    key={d}
                    onClick={() => toggleDiet(d)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      active
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {active ? '✓ ' : ''}{d}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500 mt-2">
              Products that don't satisfy a selected diet show a red conflict banner on their analysis.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/25"
          >
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
