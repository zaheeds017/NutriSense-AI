import assert from 'node:assert';
import { parseIngredientsText, detectAllergens, computeTrafficLights, analyzeProductRules } from '../server/rulesEngine.js';
import { Macros, ServingInfo } from '../src/types.js';

console.log('🧪 Running NutriSense_AI Unit Tests...\n');

// --- TEST 1: US FDA Label Parsing ---
console.log('1️⃣ Testing US FDA Label Ingredient & Allergen Parser...');
const usFdaLabelText = `
INGREDIENTS: Whole Grain Rolled Oats, Cane Sugar, Canola Oil, Whole Grain Wheat, Almonds, Salt, Soy Lecithin, Natural Flavor.
CONTAINS WHEAT, ALMOND AND SOY INGREDIENTS.
`;

const usIngredients = parseIngredientsText(usFdaLabelText);
assert.strictEqual(usIngredients.length >= 5, true, 'Should parse multiple ingredients');
assert.strictEqual(usIngredients[0], 'Whole Grain Rolled Oats', 'First ingredient should be Whole Grain Rolled Oats');

const usAllergens = detectAllergens(usIngredients);
assert.ok(usAllergens.includes('Gluten / Wheat'), 'Should identify Wheat allergen');
assert.ok(usAllergens.includes('Tree Nuts'), 'Should identify Almond/Tree Nut allergen');
assert.ok(usAllergens.includes('Soybeans / Soy'), 'Should identify Soy allergen');
console.log('✅ US FDA Label Test Passed!');

// --- TEST 2: EU Label Format Parsing ---
console.log('2️⃣ Testing EU Label Format Parser & Salt Conversion...');
const euMacros: Macros = {
  calories: { value: 380, unit: 'kcal' },
  total_fat: { value: 14, unit: 'g' },
  saturated_fat: { value: 6, unit: 'g' },
  trans_fat: { value: 0, unit: 'g' },
  cholesterol: { value: 0, unit: 'mg' },
  sodium: { value: 800, unit: 'mg' }, // 2g salt
  total_carbohydrates: { value: 55, unit: 'g' },
  dietary_fiber: { value: 6, unit: 'g' },
  total_sugars: { value: 24, unit: 'g' },
  added_sugars: { value: 20, unit: 'g' },
  protein: { value: 7, unit: 'g' },
};

const trafficLights = computeTrafficLights(euMacros);
assert.strictEqual(trafficLights.sugars, 'red', 'Sugars > 22.5g should be RED traffic light');
assert.strictEqual(trafficLights.saturated_fat, 'red', 'Saturated fat > 5g should be RED traffic light');
assert.strictEqual(trafficLights.salt, 'red', 'Salt > 1.5g (800mg sodium) should be RED traffic light');
console.log('✅ EU Label & Traffic Light Test Passed!');

// --- TEST 3: OCR Noisy Label Parsing ---
console.log('3️⃣ Testing OCR Noisy Label Parsing...');
const noisyOcrText = `INGREDlENTS: Water, High Fructose Com Syrup, Hydrogenated Palm Kernel Oll, Red 40, Artificial Flavor, Preservat1ve (Sodium Benzoate).`;

const noisyIngredients = parseIngredientsText(noisyOcrText);
assert.ok(noisyIngredients.length > 0, 'Should handle noisy OCR text gracefully');

const noisyServing: ServingInfo = { serving_size: '1 cup', servings_per_container: 1 };
const noisyAnalysis = analyzeProductRules('Noisy Beverage', 'Generic', noisyIngredients, euMacros, noisyServing);

assert.ok(noisyAnalysis.score <= 4.0, 'Product with HFCS, Hydrogenated Oil & Red 40 should score low (<= 4.0)');
assert.strictEqual(noisyAnalysis.overall === 'Poor' || noisyAnalysis.overall === 'Unhealthy', true, 'Rating should be Poor or Unhealthy');
console.log('✅ OCR Noisy Label Test Passed!');

// --- TEST 4: Clean Whole Food Scoring ---
console.log('4️⃣ Testing Clean Whole Food Scoring...');
const cleanIngredients = ['Whole Grain Rolled Oats', 'Chia Seeds', 'Blueberries', 'Organic Almonds'];
const cleanMacros: Macros = {
  calories: { value: 160, unit: 'kcal' },
  total_fat: { value: 4, unit: 'g' },
  saturated_fat: { value: 0.5, unit: 'g' },
  trans_fat: { value: 0, unit: 'g' },
  cholesterol: { value: 0, unit: 'mg' },
  sodium: { value: 10, unit: 'mg' },
  total_carbohydrates: { value: 28, unit: 'g' },
  dietary_fiber: { value: 5, unit: 'g' },
  total_sugars: { value: 2, unit: 'g' },
  added_sugars: { value: 0, unit: 'g' },
  protein: { value: 6, unit: 'g' },
};

const cleanAnalysis = analyzeProductRules('Organic Oatmeal Bowl', 'BioFoods', cleanIngredients, cleanMacros, noisyServing);
assert.ok(cleanAnalysis.score >= 8.5, 'Whole food cereal should score >= 8.5/10');
assert.strictEqual(cleanAnalysis.overall, 'Excellent');
console.log('✅ Clean Whole Food Test Passed!');

console.log('\n🎉 ALL NutriSense_AI PARSER & API TESTS PASSED SUCCESSFULLY!');
