/**
 * Client-side product database & user preferences store (localStorage-backed).
 * Port of the NutriScan Express JSON database so the merged app stays fully static
 * and works on Vercel without a server.
 */

import { SEED_PRODUCTS } from './seedProducts.js';
import { analyzeProductRules, parseIngredientsText, detectAllergens } from './rulesEngine.js';

const PRODUCTS_KEY = 'nutrisense_ai_products';
const PREFS_KEY = 'nutrisense_ai_preferences';

export const DEFAULT_USER_PREFS = {
  allergens: [],
  dietRestrictions: [],
};

// --- Products ---

function loadStoredProducts() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (err) {
    console.warn('Failed to load stored products:', err);
  }
  return [];
}

function saveProducts(products) {
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('Failed to save products:', err);
  }
}

function allProducts() {
  const stored = loadStoredProducts();
  const merged = [...SEED_PRODUCTS];
  stored.forEach((p) => {
    if (!merged.some((seed) => seed.barcode === p.barcode)) {
      merged.push(p);
    }
  });
  return merged;
}

export function getProducts(search, category, minScore) {
  return allProducts().filter((p) => {
    if (search) {
      const query = search.toLowerCase();
      const matchName = p.name.toLowerCase().includes(query);
      const matchBrand = p.brand.toLowerCase().includes(query);
      const matchBarcode = p.barcode.includes(query);
      if (!matchName && !matchBrand && !matchBarcode) return false;
    }
    if (category && category !== 'All' && p.category !== category) {
      return false;
    }
    if (minScore !== undefined && minScore !== null && (p.analysis?.health?.score ?? 0) < minScore) {
      return false;
    }
    return true;
  });
}

export function getProductByBarcode(barcode) {
  const clean = String(barcode || '').trim();
  if (!clean) return null;
  return allProducts().find((p) => p.barcode === clean) || null;
}

export function getProductById(id) {
  return allProducts().find((p) => p.id === id) || null;
}

export function getAllProducts() {
  return allProducts();
}

export function addProduct({ name, brand, barcode, category, imageUrl, analysis, isCommunity }) {
  const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const record = {
    id,
    name,
    brand: brand || 'User Contributed',
    barcode: String(barcode || '').trim(),
    category: category || 'General Food',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
    isCommunity: Boolean(isCommunity),
    addedAt: new Date().toISOString(),
    analysis,
  };

  const stored = loadStoredProducts();
  stored.unshift(record);
  saveProducts(stored);
  return record;
}

/**
 * Build a full product analysis contract from raw label text (community adds & text scans).
 */
export function buildAnalysisFromText(inputText, productName, brand, userPrefs) {
  const ingredientsList = parseIngredientsText(inputText);
  const macros = extractMacrosFromText(inputText);
  const servingInfo = {
    serving_size: extractServingSize(inputText) || '1 serving',
    servings_per_container: 1,
  };

  const finalIngredients = ingredientsList.length > 0 ? ingredientsList : ['Unspecified Ingredients'];
  const allergens = detectAllergens(finalIngredients);
  const health = analyzeProductRules(productName || 'Parsed Food Product', brand || 'Generic', finalIngredients, macros, servingInfo, userPrefs);

  return {
    serving_info: servingInfo,
    macros,
    ingredients: finalIngredients,
    allergens_identified: allergens,
    product_name: productName || 'Parsed Food Product',
    brand: brand || 'Generic',
    health,
  };
}

function extractServingSize(text) {
  const match = text.match(/serving\s*size:?\s*([^\n\r,]+)/i);
  return match ? match[1].trim() : null;
}

function extractMacrosFromText(text) {
  const val = (pattern) => {
    const m = text.match(pattern);
    if (m && m[1] !== undefined) {
      const n = parseFloat(m[1].replace(/[^0-9.]/g, ''));
      if (!isNaN(n)) return n;
    }
    return null;
  };

  return {
    calories: { value: val(/calories:?\s*([0-9.]+)/i) ?? val(/energy:?\s*([0-9.]+)\s*kcal/i), unit: 'kcal' },
    total_fat: { value: val(/total\s*fat:?\s*([0-9.]+)\s*g/i) ?? val(/fat:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    saturated_fat: { value: val(/saturated\s*fat:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    trans_fat: { value: val(/trans\s*fat:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    cholesterol: { value: val(/cholesterol:?\s*([0-9.]+)\s*mg/i), unit: 'mg' },
    sodium: { value: val(/sodium:?\s*([0-9.]+)\s*mg/i), unit: 'mg' },
    total_carbohydrates: { value: val(/total\s*carbohydrates?:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    dietary_fiber: { value: val(/dietary\s*fiber:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    total_sugars: { value: val(/total\s*sugars?:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    added_sugars: { value: val(/added\s*sugars?:?\s*([0-9.]+)\s*g/i), unit: 'g' },
    protein: { value: val(/protein:?\s*([0-9.]+)\s*g/i), unit: 'g' },
  };
}

// --- Healthier Alternatives ---

export function getAlternatives(productId) {
  const products = allProducts();
  const target = products.find((p) => p.id === productId);
  if (!target) return [];

  const targetScore = target.analysis?.health?.score ?? 5;
  const sameCategoryBetter = products
    .filter((p) => p.id !== target.id && p.category === target.category && (p.analysis?.health?.score ?? 0) > targetScore)
    .sort((a, b) => (b.analysis?.health?.score ?? 0) - (a.analysis?.health?.score ?? 0));

  return sameCategoryBetter.slice(0, 3).map((p) => ({
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category,
    healthScore: p.analysis?.health?.score ?? 5,
    imageUrl: p.imageUrl,
    reason: `Higher nutritional score (${p.analysis?.health?.score ?? 5}/10 vs ${targetScore}/10) with lower processing impact.`,
    analysis: p.analysis,
  }));
}

// --- User Preferences ---

export function getUserPreferences() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (raw) return { ...DEFAULT_USER_PREFS, ...JSON.parse(raw) };
  } catch (err) {
    console.warn('Failed to load preferences:', err);
  }
  return { ...DEFAULT_USER_PREFS };
}

export function updateUserPreferences(prefs) {
  const updated = { ...getUserPreferences(), ...prefs };
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save preferences:', err);
  }
  return updated;
}
