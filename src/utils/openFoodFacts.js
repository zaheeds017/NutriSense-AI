/**
 * Open Food Facts barcode lookup (client-side).
 * Public API is CORS-enabled, so no server is required.
 */

import { analyzeProductRules, parseIngredientsText, detectAllergens } from './rulesEngine.js';

/**
 * Fetch a product from Open Food Facts by UPC/EAN barcode and return a full
 * analysis contract, or null if the code is unknown.
 */
export async function fetchOpenFoodFactsProduct(barcode, userPrefs) {
  const cleanBarcode = String(barcode || '').trim();
  if (!cleanBarcode || cleanBarcode.length < 5) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const productName = p.product_name_en || p.product_name || 'Scanned Food Product';
    const brand = p.brands ? String(p.brands).split(',')[0].trim() : 'Unknown Brand';
    const ingredientsRaw = p.ingredients_text_en || p.ingredients_text || 'Ingredients list not specified.';
    const imageUrl = p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop';
    const category = p.categories ? String(p.categories).split(',')[0].trim() : 'Packaged Foods';

    const n = p.nutriments || {};
    const calories = Number(n['energy-kcal_serving'] ?? n['energy-kcal_100g'] ?? n['energy-kcal'] ?? 0);
    const fat = Number(n['fat_serving'] ?? n['fat_100g'] ?? 0);
    const satFat = Number(n['saturated-fat_serving'] ?? n['saturated-fat_100g'] ?? 0);
    const sugars = Number(n['sugars_serving'] ?? n['sugars_100g'] ?? 0);
    const sodiumRaw =
      Number(n['sodium_serving'] ?? n['sodium_100g'] ?? 0) * 1000 ||
      Number(n['salt_serving'] ?? n['salt_100g'] ?? 0) * 400;
    const carbs = Number(n['carbohydrates_serving'] ?? n['carbohydrates_100g'] ?? 0);
    const fiber = Number(n['fiber_serving'] ?? n['fiber_100g'] ?? 0);
    const protein = Number(n['proteins_serving'] ?? n['proteins_100g'] ?? 0);

    const ingredientsList = parseIngredientsText(ingredientsRaw);
    const allergens = detectAllergens(ingredientsList);

    const macros = {
      calories: { value: calories, unit: 'kcal' },
      total_fat: { value: fat, unit: 'g' },
      saturated_fat: { value: satFat, unit: 'g' },
      trans_fat: { value: 0, unit: 'g' },
      cholesterol: { value: 0, unit: 'mg' },
      sodium: { value: Math.round(sodiumRaw), unit: 'mg' },
      total_carbohydrates: { value: carbs, unit: 'g' },
      dietary_fiber: { value: fiber, unit: 'g' },
      total_sugars: { value: sugars, unit: 'g' },
      added_sugars: { value: Math.max(0, sugars - 2), unit: 'g' },
      protein: { value: protein, unit: 'g' },
    };

    const servingInfo = {
      serving_size: p.serving_size || '100g',
      servings_per_container: 1,
    };

    const health = analyzeProductRules(productName, brand, ingredientsList, macros, servingInfo, userPrefs);

    return {
      serving_info: servingInfo,
      macros,
      ingredients: ingredientsList,
      allergens_identified: allergens,
      product_name: productName,
      brand,
      barcode: cleanBarcode,
      category,
      image_url: imageUrl,
      health,
    };
  } catch (err) {
    console.warn(`Open Food Facts lookup failed for ${barcode}:`, err);
    return null;
  }
}
