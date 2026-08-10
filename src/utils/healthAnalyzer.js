/**
 * Nutritional Health Analyzer: Nutri-Score, NOVA Group, FDA DV%, and Additive Detection
 */

// FDA 2000 kcal Daily Values reference standards
export const FDA_DAILY_VALUES = {
  calories: 2000,
  total_fat: 78,        // g
  saturated_fat: 20,    // g
  cholesterol: 300,     // mg
  sodium: 2300,         // mg
  total_carbohydrates: 275, // g
  dietary_fiber: 28,    // g
  added_sugars: 50,     // g
  protein: 50           // g
};

// Known harmful additives & ultra-processed ingredients list
export const ADDITIVE_WATCHLIST = [
  { keywords: ['red 40', 'yellow 5', 'yellow 6', 'blue 1', 'artificial color'], title: 'Artificial Dyes', danger: 'high', note: 'Synthetic dyes linked to hyperactivity and food sensitivities' },
  { keywords: ['high fructose corn syrup', 'hfcs'], title: 'High Fructose Corn Syrup', danger: 'high', note: 'Refined sugar extract strongly associated with metabolic stress' },
  { keywords: ['monosodium glutamate', 'msg'], title: 'Monosodium Glutamate', danger: 'medium', note: 'Flavor enhancer that may cause headaches in sensitive individuals' },
  { keywords: ['partially hydrogenated', 'hydrogenated oil'], title: 'Trans Fats / Hydrogenated Oils', danger: 'high', note: 'Artificially hardened oils known to increase LDL cholesterol' },
  { keywords: ['tbhq', 'bht', 'bha'], title: 'Chemical Preservatives (TBHQ/BHT/BHA)', danger: 'high', note: 'Synthetic antioxidants used to extend shelf life' },
  { keywords: ['disodium guanylate', 'disodium inosinate'], title: 'Synthetic Flavor Enhancers', danger: 'medium', note: 'Purine-based additives used alongside MSG' },
  { keywords: ['palm oil'], title: 'Palm Oil', danger: 'low', note: 'High in saturated palmitic acid and environmental impact' }
];

export const MAJOR_ALLERGENS = [
  { id: 'Milk', names: ['milk', 'whey', 'casein', 'butter', 'cream', 'cheese', 'lactose', 'curd'] },
  { id: 'Eggs', names: ['egg', 'albumin', 'ovalbumin', 'yolk'] },
  { id: 'Peanuts', names: ['peanut', 'arachis'] },
  { id: 'Tree Nuts', names: ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut'] },
  { id: 'Wheat', names: ['wheat', 'gluten', 'spelt', 'durum', 'semolina', 'flour'] },
  { id: 'Soy', names: ['soy', 'soybean', 'lecithin', 'edamame', 'tofu'] },
  { id: 'Fish', names: ['fish', 'cod', 'salmon', 'tuna', 'anchovy'] },
  { id: 'Crustacean Shellfish', names: ['shrimp', 'crab', 'lobster', 'prawn'] },
  { id: 'Sesame', names: ['sesame', 'tahini'] }
];

/**
 * Calculates Nutri-Score Grade (A to E) based on nutrient balance
 */
export function calculateNutriScore(macros) {
  if (!macros) return { grade: 'C', score: 5, color: '#f59e0b' };

  let negativePoints = 0;
  let positivePoints = 0;

  // Negative points (Energy, Sat Fat, Sugars, Sodium)
  const cal = macros.calories?.value || 0;
  const satFat = macros.saturated_fat?.value || 0;
  const sugar = macros.total_sugars?.value || 0;
  const sodium = macros.sodium?.value || 0;

  if (cal > 335) negativePoints += 3;
  if (cal > 670) negativePoints += 4;
  if (satFat > 2) negativePoints += 2;
  if (satFat > 5) negativePoints += 4;
  if (sugar > 4.5) negativePoints += 2;
  if (sugar > 10) negativePoints += 4;
  if (sugar > 18) negativePoints += 4;
  if (sodium > 400) negativePoints += 2;
  if (sodium > 900) negativePoints += 4;

  // Positive points (Fiber, Protein)
  const fiber = macros.dietary_fiber?.value || 0;
  const protein = macros.protein?.value || 0;

  if (fiber > 1.5) positivePoints += 2;
  if (fiber > 3.5) positivePoints += 3;
  if (protein > 3) positivePoints += 2;
  if (protein > 8) positivePoints += 3;

  const totalScore = negativePoints - positivePoints;

  if (totalScore <= 0) return { grade: 'A', label: 'Excellent', color: '#10b981', bg: 'bg-emerald-500' };
  if (totalScore <= 3) return { grade: 'B', label: 'Good', color: '#84cc16', bg: 'bg-lime-500' };
  if (totalScore <= 8) return { grade: 'C', label: 'Moderate', color: '#f59e0b', bg: 'bg-amber-500' };
  if (totalScore <= 14) return { grade: 'D', label: 'Poor', color: '#f97316', bg: 'bg-orange-500' };
  return { grade: 'E', label: 'Unhealthy', color: '#ef4444', bg: 'bg-rose-500' };
}

/**
 * Evaluates NOVA Food Processing Group (1 = Unprocessed, 4 = Ultra-Processed)
 */
export function calculateNovaGroup(ingredients) {
  if (!ingredients || ingredients.length === 0) return { group: 2, label: 'Processed Culinary Ingredient' };

  const ingStr = ingredients.join(' ').toLowerCase();
  
  // Check for ultra-processed indicators
  const upIndicators = [
    'flavor', 'maltodextrin', 'emulsifier', 'syrup', 'modified',
    'hydrogenated', 'dye', 'red 40', 'yellow 5', 'glutamate', 'extract',
    'isolate', 'dextrose', 'sucralose', 'preservative'
  ];

  let matches = 0;
  upIndicators.forEach(word => {
    if (ingStr.includes(word)) matches++;
  });

  if (matches >= 2 || ingredients.length > 8) {
    return { group: 4, label: 'Ultra-Processed Food', color: '#ef4444', desc: 'Formulated from industrial substances with additives' };
  } else if (matches === 1 || ingredients.length > 4) {
    return { group: 3, label: 'Processed Food', color: '#f59e0b', desc: 'Manufactured with added fats, sugars, or salt' };
  } else if (ingredients.length <= 4) {
    return { group: 1, label: 'Unprocessed or Minimally Processed', color: '#10b981', desc: 'Natural agricultural products' };
  }

  return { group: 2, label: 'Processed Culinary Ingredient', color: '#3b82f6', desc: 'Directly extracted cooking elements' };
}

/**
 * Scans list of ingredients for allergens and additives
 */
export function analyzeIngredientsList(ingredients = []) {
  const ingText = ingredients.join(', ').toLowerCase();
  const detectedAllergens = [];
  const detectedAdditives = [];

  MAJOR_ALLERGENS.forEach(allergen => {
    const found = allergen.names.some(name => ingText.includes(name));
    if (found) {
      detectedAllergens.push(allergen.id);
    }
  });

  ADDITIVE_WATCHLIST.forEach(item => {
    const found = item.keywords.some(kw => ingText.includes(kw));
    if (found) {
      detectedAdditives.push(item);
    }
  });

  return {
    allergens: detectedAllergens,
    additives: detectedAdditives
  };
}

/**
 * Calculates % Daily Value for a specific macro
 */
export function calculateDailyValuePercent(key, value) {
  if (value === null || value === undefined || isNaN(value)) return null;
  const ref = FDA_DAILY_VALUES[key];
  if (!ref) return null;
  return Math.round((value / ref) * 100);
}
