import React, { useState } from 'react';
import { UserPreferences } from '../types';
import { ShieldAlert, Save, Check, RefreshCw } from 'lucide-react';

interface UserProfileModalProps {
  userPrefs: UserPreferences;
  onSavePrefs: (prefs: UserPreferences) => void;
}

const ALLERGEN_OPTIONS = [
  'Gluten / Wheat',
  'Milk / Dairy',
  'Peanuts',
  'Tree Nuts',
  'Soybeans / Soy',
  'Eggs',
  'Fish',
  'Crustacean Shellfish',
  'Sesame',
  'Mustard',
  'Celery',
  'Sulfites',
  'Lupin',
  'Molluscs',
];

const DIET_OPTIONS = [
  'Vegan',
  'Vegetarian',
  'Gluten-Free',
  'Dairy-Free',
  'Nut-Free',
  'Keto-Friendly',
  'Low Sodium',
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userPrefs,
  onSavePrefs,
}) => {
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>(userPrefs.allergens);
  const [selectedDiets, setSelectedDiets] = useState<string[]>(userPrefs.dietRestrictions);
  const [isSaved, setIsSaved] = useState(false);

  const toggleAllergen = (allergen: string) => {
    setSelectedAllergens((prev) =>
      prev.includes(allergen) ? prev.filter((a) => a !== allergen) : [...prev, allergen]
    );
  };

  const toggleDiet = (diet: string) => {
    setSelectedDiets((prev) =>
      prev.includes(diet) ? prev.filter((d) => d !== diet) : [...prev, diet]
    );
  };

  const handleSave = () => {
    onSavePrefs({
      allergens: selectedAllergens,
      dietRestrictions: selectedDiets,
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Personal Allergen & Dietary Profile</h2>
          <p className="text-xs text-slate-500">
            Set your personal health restrictions. NutriSense_AI will automatically cross-reference every scanned product against your profile and highlight safety hazards.
          </p>
        </div>
      </div>

      {/* EU 14 + US Major Allergens Checklist */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Select Your Personal Allergens (EU 14 + US Standards)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {ALLERGEN_OPTIONS.map((allergen) => {
            const isChecked = selectedAllergens.includes(allergen);
            return (
              <button
                key={allergen}
                type="button"
                onClick={() => toggleAllergen(allergen)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{allergen}</span>
                {isChecked && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dietary Goals & Lifestyles */}
      <div className="space-y-3 border-t border-slate-100 pt-5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Select Your Dietary Lifestyle Goals
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {DIET_OPTIONS.map((diet) => {
            const isChecked = selectedDiets.includes(diet);
            return (
              <button
                key={diet}
                type="button"
                onClick={() => toggleDiet(diet)}
                className={`p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between cursor-pointer ${
                  isChecked
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span>{diet}</span>
                {isChecked && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
        <p className="text-xs text-slate-400">
          {selectedAllergens.length} Allergen(s) & {selectedDiets.length} Diet Preference(s) Active.
        </p>
        <button
          onClick={handleSave}
          id="save-profile-btn"
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all"
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              Profile Saved!
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Profile Preferences
            </>
          )}
        </button>
      </div>
    </div>
  );
};
