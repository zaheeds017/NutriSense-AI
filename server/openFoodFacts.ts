import { AnalysisResultContract, UserPreferences } from '../src/types.js';
import { analyzeProductRules, parseIngredientsText, detectAllergens } from './rulesEngine.js';

interface OFFProductResponse {
  status: number;
  product?: {
    product_name?: string;
    product_name_en?: string;
    brands?: string;
    ingredients_text?: string;
    ingredients_text_en?: string;
    categories?: string;
    image_front_url?: string;
    image_url?: string;
    serving_size?: string;
    nutriments?: Record<string, any>;
  };
}

/**
 * Fetch product from Open Food Facts API by Barcode
 */
export async function fetchOpenFoodFactsProduct(
  barcode: string,
  userPrefs?: UserPreferences
): Promise<AnalysisResultContract | null> {
  const cleanBarcode = barcode.trim();
  if (!cleanBarcode || cleanBarcode.length < 5) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${cleanBarcode}.json`, {
      headers: {
        'User-Agent': 'NutriSense-AI - Web Application - Version 1.0 (contact@NutriSense-AI.app)',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data: OFFProductResponse = await res.json();

    if (data.status !== 1 || !data.product) return null;

    const p = data.product;
    const productName = p.product_name_en || p.product_name || 'Scanned Food Product';
    const brand = p.brands ? p.brands.split(',')[0].trim() : 'Unknown Brand';
    const ingredientsRaw = p.ingredients_text_en || p.ingredients_text || 'Ingredients list not specified.';
    const imageUrl = p.image_front_url || p.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop';
    const category = p.categories ? p.categories.split(',')[0].trim() : 'Packaged Foods';

    const nutriments = p.nutriments || {};

    const calories = Number(nutriments['energy-kcal_serving'] ?? nutriments['energy-kcal_100g'] ?? nutriments['energy-kcal'] ?? 0);
    const fat = Number(nutriments['fat_serving'] ?? nutriments['fat_100g'] ?? 0);
    const satFat = Number(nutriments['saturated-fat_serving'] ?? nutriments['saturated-fat_100g'] ?? 0);
    const sugars = Number(nutriments['sugars_serving'] ?? nutriments['sugars_100g'] ?? 0);
    const sodiumMg = Number(nutriments['sodium_serving'] ?? nutriments['sodium_100g'] ?? 0) * 1000 || (Number(nutriments['salt_serving'] ?? nutriments['salt_100g'] ?? 0) * 400);
    const carbs = Number(nutriments['carbohydrates_serving'] ?? nutriments['carbohydrates_100g'] ?? 0);
    const fiber = Number(nutriments['fiber_serving'] ?? nutriments['fiber_100g'] ?? 0);
    const protein = Number(nutriments['proteins_serving'] ?? nutriments['proteins_100g'] ?? 0);

    const ingredientsList = parseIngredientsText(ingredientsRaw);
    const allergens = detectAllergens(ingredientsList);

    const macros = {
      calories: { value: calories, unit: 'kcal' as const },
      total_fat: { value: fat, unit: 'g' as const },
      saturated_fat: { value: satFat, unit: 'g' as const },
      trans_fat: { value: 0, unit: 'g' as const },
      cholesterol: { value: 0, unit: 'mg' as const },
      sodium: { value: Math.round(sodiumMg), unit: 'mg' as const },
      total_carbohydrates: { value: carbs, unit: 'g' as const },
      dietary_fiber: { value: fiber, unit: 'g' as const },
      total_sugars: { value: sugars, unit: 'g' as const },
      added_sugars: { value: Math.max(0, sugars - 2), unit: 'g' as const },
      protein: { value: protein, unit: 'g' as const },
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
    console.warn(`Open Food Facts API lookup failed for ${barcode}:`, err);
    return null;
  }
}
