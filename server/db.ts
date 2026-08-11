import fs from 'fs';
import path from 'path';
import {
  AnalysisResultContract,
  ProductRecord,
  ScanHistoryRecord,
  UserPreferences,
  AlternativeProduct,
} from '../src/types.js';
import { analyzeProductRules, parseIngredientsText, detectAllergens } from './rulesEngine.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'NutriSense-AI_db.json');

interface DatabaseSchema {
  products: ProductRecord[];
  communityProducts: { id: string; productId: string; userId: string; addedAt: string }[];
  scanHistory: ScanHistoryRecord[];
  userPreferences: UserPreferences;
}

// Initial Seed Database with realistic packaged products & real UPC Barcodes
const INITIAL_PRODUCTS: ProductRecord[] = [
  {
    id: 'prod-1',
    name: 'Old Fashioned Whole Grain Rolled Oats',
    brand: 'Quaker Oats',
    barcode: '030000062002',
    category: 'Breakfast Grains',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-15T10:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '1/2 cup (40g)',
        servings_per_container: 30,
      },
      macros: {
        calories: { value: 150, unit: 'kcal' },
        total_fat: { value: 3, unit: 'g' },
        saturated_fat: { value: 0.5, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 0, unit: 'mg' },
        total_carbohydrates: { value: 27, unit: 'g' },
        dietary_fiber: { value: 4, unit: 'g' },
        total_sugars: { value: 1, unit: 'g' },
        added_sugars: { value: 0, unit: 'g' },
        protein: { value: 5, unit: 'g' },
      },
      ingredients: ['100% Whole Grain Rolled Oats'],
      allergens_identified: [],
      product_name: 'Old Fashioned Whole Grain Rolled Oats',
      brand: 'Quaker Oats',
      barcode: '030000062002',
      category: 'Breakfast Grains',
      health: {
        score: 9.5,
        overall: 'Excellent',
        comments: 'Outstanding single-ingredient whole grain cereal packed with soluble beta-glucan fiber. Zero added sodium or sugars.',
        recommendations: [
          'Excellent daily breakfast choice for heart health and sustained glucose stability.',
          'Pair with fresh berries and chia seeds for antioxidant boost.',
        ],
        ingredients_with_flags: [
          {
            name: '100% Whole Grain Rolled Oats',
            status: 'good',
            color: 'green',
            reason: 'Whole grain rich in beta-glucan fiber, minerals, and complex carbs.',
            categoryTag: 'Whole Grain',
          },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: true, reason: '100% plant-based ingredient.' },
          { diet: 'Gluten-Free', suitable: false, reason: 'May contain trace gluten unless certified gluten-free facility.' },
          { diet: 'Nut-Free', suitable: true, reason: 'Free from peanuts and tree nuts.' },
          { diet: 'Dairy-Free', suitable: true, reason: 'No dairy content.' },
          { diet: 'Keto-Friendly', suitable: false, reason: '23g net carbs per serving exceed keto intake limits.' },
          { diet: 'Low Sodium', suitable: true, reason: '0mg sodium per serving.' },
        ],
        traffic_light: {
          fat: 'green',
          saturated_fat: 'green',
          sugars: 'green',
          salt: 'green',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-2',
    name: 'Hazelnut Spread with Cocoa',
    brand: 'Nutella',
    barcode: '3017620422003',
    category: 'Spreads & Sweeteners',
    imageUrl: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-16T11:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '2 tbsp (37g)',
        servings_per_container: 10,
      },
      macros: {
        calories: { value: 200, unit: 'kcal' },
        total_fat: { value: 12, unit: 'g' },
        saturated_fat: { value: 4, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 15, unit: 'mg' },
        total_carbohydrates: { value: 23, unit: 'g' },
        dietary_fiber: { value: 1, unit: 'g' },
        total_sugars: { value: 21, unit: 'g' },
        added_sugars: { value: 19, unit: 'g' },
        protein: { value: 2, unit: 'g' },
      },
      ingredients: [
        'Sugar',
        'Palm Oil',
        'Hazelnuts (13%)',
        'Skimmed Milk Powder (8.7%)',
        'Fat-Reduced Cocoa (7.4%)',
        'Soy Lecithin (Emulsifier)',
        'Vanillin (Artificial Flavor)',
      ],
      allergens_identified: ['Tree Nuts', 'Milk / Dairy', 'Soybeans / Soy'],
      product_name: 'Hazelnut Spread with Cocoa',
      brand: 'Nutella',
      barcode: '3017620422003',
      category: 'Spreads & Sweeteners',
      health: {
        score: 2.8,
        overall: 'Unhealthy',
        comments: 'High in added refined sugars (21g per 2 tbsp) and palm oil. Primary ingredient is sugar, not hazelnuts.',
        recommendations: [
          'Treat as an occasional indulgence rather than a daily breakfast spread.',
          'Consider raw almond butter or 100% hazelnut butter without added palm oil or sugar.',
        ],
        ingredients_with_flags: [
          { name: 'Sugar', status: 'harmful', color: 'red', reason: 'Primary ingredient; contributes 19g added sugar per serving.', categoryTag: 'Added Sugar' },
          { name: 'Palm Oil', status: 'harmful', color: 'red', reason: 'High in saturated fats and refined processing.', categoryTag: 'Saturated Fat' },
          { name: 'Hazelnuts (13%)', status: 'good', color: 'green', reason: 'Nutrient-dense nut providing healthy monounsaturated fats.', categoryTag: 'Healthy Fats' },
          { name: 'Skimmed Milk Powder', status: 'neutral', color: 'amber', reason: 'Provides dairy protein and lactose.', categoryTag: 'Dairy' },
          { name: 'Soy Lecithin', status: 'neutral', color: 'amber', reason: 'Standard emulsifier derived from soy.', categoryTag: 'Emulsifier' },
          { name: 'Vanillin', status: 'neutral', color: 'amber', reason: 'Synthetic flavor compound.', categoryTag: 'Flavoring' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: false, reason: 'Contains skimmed milk powder.' },
          { diet: 'Gluten-Free', suitable: true, reason: 'Contains no gluten ingredients.' },
          { diet: 'Nut-Free', suitable: false, reason: 'Contains hazelnuts.' },
          { diet: 'Dairy-Free', suitable: false, reason: 'Contains skimmed milk powder.' },
          { diet: 'Keto-Friendly', suitable: false, reason: '22g net carbs per serving.' },
          { diet: 'Low Sodium', suitable: true, reason: '15mg sodium per serving.' },
        ],
        traffic_light: {
          fat: 'amber',
          saturated_fat: 'red',
          sugars: 'red',
          salt: 'green',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-3',
    name: 'Total 0% Plain Nonfat Greek Yogurt',
    brand: 'FAGE',
    barcode: '041500000251',
    category: 'Dairy & Yogurt',
    imageUrl: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-18T14:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '3/4 cup (170g)',
        servings_per_container: 1,
      },
      macros: {
        calories: { value: 90, unit: 'kcal' },
        total_fat: { value: 0, unit: 'g' },
        saturated_fat: { value: 0, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 10, unit: 'mg' },
        sodium: { value: 65, unit: 'mg' },
        total_carbohydrates: { value: 5, unit: 'g' },
        dietary_fiber: { value: 0, unit: 'g' },
        total_sugars: { value: 5, unit: 'g' },
        added_sugars: { value: 0, unit: 'g' },
        protein: { value: 18, unit: 'g' },
      },
      ingredients: ['Grade A Pasteurized Skimmed Milk', 'Live Active Yogurt Cultures (L. Bulgaricus, S. Thermophilus, L. Acidophilus, Bifidus, L. Casei)'],
      allergens_identified: ['Milk / Dairy'],
      product_name: 'Total 0% Plain Nonfat Greek Yogurt',
      brand: 'FAGE',
      barcode: '041500000251',
      category: 'Dairy & Yogurt',
      health: {
        score: 9.2,
        overall: 'Excellent',
        comments: 'Superior high-protein strained Greek yogurt with zero added sugars and 5 active probiotic cultures.',
        recommendations: [
          'Excellent protein source (18g per cup) for muscle recovery and satiety.',
          'Add fresh berries or walnuts for fiber and healthy fats.',
        ],
        ingredients_with_flags: [
          { name: 'Grade A Pasteurized Skimmed Milk', status: 'good', color: 'green', reason: 'Clean dairy source high in calcium and bioavailable protein.', categoryTag: 'Dairy Protein' },
          { name: 'Live Active Yogurt Cultures', status: 'good', color: 'green', reason: 'Probiotics that promote beneficial gut flora and digestive health.', categoryTag: 'Probiotic' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: false, reason: 'Contains cultured cow milk.' },
          { diet: 'Gluten-Free', suitable: true, reason: 'Gluten-free product.' },
          { diet: 'Nut-Free', suitable: true, reason: 'Nut-free product.' },
          { diet: 'Dairy-Free', suitable: false, reason: 'Dairy product.' },
          { diet: 'Keto-Friendly', suitable: true, reason: 'Only 5g carbs per generous 170g serving.' },
          { diet: 'Low Sodium', suitable: true, reason: '65mg sodium per serving.' },
        ],
        traffic_light: {
          fat: 'green',
          saturated_fat: 'green',
          sugars: 'green',
          salt: 'green',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-4',
    name: 'Original Chocolate Sandwich Cookies',
    brand: 'Oreo',
    barcode: '044000032029',
    category: 'Snack Foods',
    imageUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-20T16:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '3 cookies (34g)',
        servings_per_container: 12,
      },
      macros: {
        calories: { value: 160, unit: 'kcal' },
        total_fat: { value: 7, unit: 'g' },
        saturated_fat: { value: 2, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 135, unit: 'mg' },
        total_carbohydrates: { value: 25, unit: 'g' },
        dietary_fiber: { value: 1, unit: 'g' },
        total_sugars: { value: 14, unit: 'g' },
        added_sugars: { value: 14, unit: 'g' },
        protein: { value: 1, unit: 'g' },
      },
      ingredients: [
        'Unbleached Enriched Flour (Wheat Flour, Niacin, Reduced Iron, Thiamine Mononitrate, Riboflavin, Folic Acid)',
        'Sugar',
        'Palm and/or Canola Oil',
        'Cocoa (Processed with Alkali)',
        'High Fructose Corn Syrup',
        'Leavening (Baking Soda and/or Calcium Phosphate)',
        'Salt',
        'Soy Lecithin',
        'Chocolate',
        'Artificial Flavor',
      ],
      allergens_identified: ['Gluten / Wheat', 'Soybeans / Soy'],
      product_name: 'Original Chocolate Sandwich Cookies',
      brand: 'Oreo',
      barcode: '044000032029',
      category: 'Snack Foods',
      health: {
        score: 2.1,
        overall: 'Unhealthy',
        comments: 'Ultra-processed bakery confection containing high fructose corn syrup, palm oil, artificial flavors, and 14g added sugar.',
        recommendations: [
          'High sugar and refined flour density; consume sparingly.',
          'Swap with dark chocolate nut clusters or homemade oat cookies.',
        ],
        ingredients_with_flags: [
          { name: 'High Fructose Corn Syrup', status: 'harmful', color: 'red', reason: 'Refined sweetener associated with metabolic inflammation.', categoryTag: 'Added Sugar' },
          { name: 'Palm and/or Canola Oil', status: 'harmful', color: 'red', reason: 'High in saturated fat and refined processing.', categoryTag: 'Refined Oil' },
          { name: 'Sugar', status: 'harmful', color: 'red', reason: 'Contributes to high glycemic load.', categoryTag: 'Added Sugar' },
          { name: 'Enriched Wheat Flour', status: 'neutral', color: 'amber', reason: 'Refined flour stripped of bran and germ.', categoryTag: 'Refined Carbs' },
          { name: 'Artificial Flavor', status: 'neutral', color: 'amber', reason: 'Synthetic chemical flavor enhancer.', categoryTag: 'Flavoring' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: true, reason: 'Contains no milk or egg ingredients (though processed on shared equipment).' },
          { diet: 'Gluten-Free', suitable: false, reason: 'Contains enriched wheat flour.' },
          { diet: 'Nut-Free', suitable: true, reason: 'No nut ingredients.' },
          { diet: 'Dairy-Free', suitable: true, reason: 'No dairy ingredients.' },
          { diet: 'Keto-Friendly', suitable: false, reason: '24g net carbs per serving.' },
          { diet: 'Low Sodium', suitable: true, reason: '135mg sodium per serving.' },
        ],
        traffic_light: {
          fat: 'amber',
          saturated_fat: 'amber',
          sugars: 'red',
          salt: 'amber',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-5',
    name: 'Nacho Cheese Flavored Tortilla Chips',
    brand: 'Doritos',
    barcode: '028400090896',
    category: 'Snack Foods',
    imageUrl: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-22T09:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '12 chips (28g)',
        servings_per_container: 9,
      },
      macros: {
        calories: { value: 150, unit: 'kcal' },
        total_fat: { value: 8, unit: 'g' },
        saturated_fat: { value: 1, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 210, unit: 'mg' },
        total_carbohydrates: { value: 18, unit: 'g' },
        dietary_fiber: { value: 1, unit: 'g' },
        total_sugars: { value: 1, unit: 'g' },
        added_sugars: { value: 0, unit: 'g' },
        protein: { value: 2, unit: 'g' },
      },
      ingredients: [
        'Corn',
        'Vegetable Oil (Corn, Canola, and/or Sunflower Oil)',
        'Maltodextrin',
        'Salt',
        'Cheddar Cheese (Milk, Cheese Cultures, Salt, Enzymes)',
        'Whey',
        'Monosodium Glutamate (MSG)',
        'Yellow 6',
        'Yellow 5',
        'Red 40',
        'Artificial Flavor',
      ],
      allergens_identified: ['Milk / Dairy'],
      product_name: 'Nacho Cheese Flavored Tortilla Chips',
      brand: 'Doritos',
      barcode: '028400090896',
      category: 'Snack Foods',
      health: {
        score: 3.0,
        overall: 'Poor',
        comments: 'Contains artificial synthetic food dyes (Yellow 6, Yellow 5, Red 40), MSG, and high sodium content.',
        recommendations: [
          'High in artificial food dyes and flavor enhancers; limit intake.',
          'Swap with baked organic blue corn tortilla chips and salsa.',
        ],
        ingredients_with_flags: [
          { name: 'Yellow 6', status: 'harmful', color: 'red', reason: 'Artificial petroleum-based food dye linked to hyperactivity.', categoryTag: 'Artificial Color' },
          { name: 'Yellow 5', status: 'harmful', color: 'red', reason: 'Synthetic colorant banned in some European school meals.', categoryTag: 'Artificial Color' },
          { name: 'Red 40', status: 'harmful', color: 'red', reason: 'Azo food dye with potential behavioral implications in children.', categoryTag: 'Artificial Color' },
          { name: 'Monosodium Glutamate (MSG)', status: 'harmful', color: 'red', reason: 'Flavor enhancer that may cause flushing or sensitivity.', categoryTag: 'Flavor Enhancer' },
          { name: 'Corn', status: 'good', color: 'green', reason: 'Whole corn grain base.', categoryTag: 'Grain' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: false, reason: 'Contains cheddar cheese and whey.' },
          { diet: 'Gluten-Free', suitable: true, reason: 'No gluten ingredients.' },
          { diet: 'Nut-Free', suitable: true, reason: 'No nut ingredients.' },
          { diet: 'Dairy-Free', suitable: false, reason: 'Contains cheese and whey.' },
          { diet: 'Keto-Friendly', suitable: false, reason: '17g net carbs per serving.' },
          { diet: 'Low Sodium', suitable: false, reason: '210mg sodium per serving exceeds low-sodium limit.' },
        ],
        traffic_light: {
          fat: 'amber',
          saturated_fat: 'green',
          sugars: 'green',
          salt: 'amber',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-6',
    name: 'Unsweetened Almond Milk',
    brand: 'California Almond',
    barcode: '085239045610',
    category: 'Plant Milk',
    imageUrl: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-25T12:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '1 cup (240ml)',
        servings_per_container: 8,
      },
      macros: {
        calories: { value: 30, unit: 'kcal' },
        total_fat: { value: 2.5, unit: 'g' },
        saturated_fat: { value: 0, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 170, unit: 'mg' },
        total_carbohydrates: { value: 1, unit: 'g' },
        dietary_fiber: { value: 1, unit: 'g' },
        total_sugars: { value: 0, unit: 'g' },
        added_sugars: { value: 0, unit: 'g' },
        protein: { value: 1, unit: 'g' },
      },
      ingredients: ['Almondmilk (Filtered Water, Almonds)', 'Calcium Carbonate', 'Sea Salt', 'Gellan Gum', 'Sunflower Lecithin', 'Vitamin E Acetate', 'Vitamin A Palmitate', 'Vitamin D2'],
      allergens_identified: ['Tree Nuts'],
      product_name: 'Unsweetened Almond Milk',
      brand: 'California Almond',
      barcode: '085239045610',
      category: 'Plant Milk',
      health: {
        score: 8.4,
        overall: 'Good',
        comments: 'Low calorie, zero added sugars, fortified with calcium and essential vitamins.',
        recommendations: [
          'Great keto and plant-based milk swap for smoothies and hot drinks.',
          'Note for almond allergic individuals: contains tree nuts.',
        ],
        ingredients_with_flags: [
          { name: 'Almondmilk (Filtered Water, Almonds)', status: 'good', color: 'green', reason: 'Clean plant base providing vitamin E and healthy fats.', categoryTag: 'Healthy Fats' },
          { name: 'Calcium Carbonate', status: 'good', color: 'green', reason: 'Essential bone-strengthening mineral fortifier.', categoryTag: 'Mineral' },
          { name: 'Gellan Gum', status: 'neutral', color: 'amber', reason: 'Natural fermentation binder to prevent separation.', categoryTag: 'Stabilizer' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: true, reason: '100% plant-based milk alternative.' },
          { diet: 'Gluten-Free', suitable: true, reason: 'Gluten-free.' },
          { diet: 'Nut-Free', suitable: false, reason: 'Contains almonds (tree nuts).' },
          { diet: 'Dairy-Free', suitable: true, reason: 'Dairy-free.' },
          { diet: 'Keto-Friendly', suitable: true, reason: 'Only 0g net carbs.' },
          { diet: 'Low Sodium', suitable: false, reason: '170mg sodium per serving.' },
        ],
        traffic_light: {
          fat: 'green',
          saturated_fat: 'green',
          sugars: 'green',
          salt: 'amber',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-7',
    name: 'Dark Chocolate Nuts & Sea Salt Bar',
    brand: 'KIND',
    barcode: '602652171015',
    category: 'Snack Foods',
    imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=500&auto=format&fit=crop',
    isCommunity: false,
    addedAt: '2025-01-26T15:00:00.000Z',
    analysis: {
      serving_info: {
        serving_size: '1 bar (40g)',
        servings_per_container: 1,
      },
      macros: {
        calories: { value: 200, unit: 'kcal' },
        total_fat: { value: 15, unit: 'g' },
        saturated_fat: { value: 3.5, unit: 'g' },
        trans_fat: { value: 0, unit: 'g' },
        cholesterol: { value: 0, unit: 'mg' },
        sodium: { value: 140, unit: 'mg' },
        total_carbohydrates: { value: 16, unit: 'g' },
        dietary_fiber: { value: 7, unit: 'g' },
        total_sugars: { value: 5, unit: 'g' },
        added_sugars: { value: 4, unit: 'g' },
        protein: { value: 6, unit: 'g' },
      },
      ingredients: [
        'Almonds',
        'Peanuts',
        'Dark Chocolate Coating (Sugar, Palm Kernel Oil, Cocoa Powder, Soy Lecithin, Natural Flavor, Salt)',
        'Chicory Root Fiber',
        'Honey',
        'Glucose Syrup',
        'Rice Flour',
        'Sea Salt',
        'Soy Lecithin',
      ],
      allergens_identified: ['Tree Nuts', 'Peanuts', 'Soybeans / Soy'],
      product_name: 'Dark Chocolate Nuts & Sea Salt Bar',
      brand: 'KIND',
      barcode: '602652171015',
      category: 'Snack Foods',
      health: {
        score: 7.2,
        overall: 'Good',
        comments: 'High fiber (7g) nut bar with whole almonds and peanuts. Low sugar compared to standard chocolate bars.',
        recommendations: [
          'Solid portable snack offering high satiety and healthy monounsaturated fats.',
          'Note: Contains palm kernel oil in chocolate coating.',
        ],
        ingredients_with_flags: [
          { name: 'Almonds', status: 'good', color: 'green', reason: 'Whole tree nuts loaded with magnesium and vitamin E.', categoryTag: 'Healthy Fats' },
          { name: 'Chicory Root Fiber', status: 'good', color: 'green', reason: 'Prebiotic soluble fiber that supports digestion.', categoryTag: 'Prebiotic Fiber' },
          { name: 'Palm Kernel Oil', status: 'harmful', color: 'red', reason: 'Saturated fat source in coating.', categoryTag: 'Saturated Fat' },
        ],
        dietary_flags: [
          { diet: 'Vegan', suitable: false, reason: 'Contains honey.' },
          { diet: 'Gluten-Free', suitable: true, reason: 'Certified gluten-free.' },
          { diet: 'Nut-Free', suitable: false, reason: 'Contains peanuts and almonds.' },
          { diet: 'Dairy-Free', suitable: true, reason: 'No milk ingredients.' },
          { diet: 'Keto-Friendly', suitable: false, reason: '9g net carbs per serving.' },
          { diet: 'Low Sodium', suitable: true, reason: '140mg sodium per serving meets low sodium benchmark.' },
        ],
        traffic_light: {
          fat: 'amber',
          saturated_fat: 'amber',
          sugars: 'green',
          salt: 'amber',
        },
        analysis_source: 'rules_fallback',
      },
    },
  },
  {
    id: 'prod-8',
    name: "Classic Potato Chips",
    brand: "Lay's",
    barcode: "028400000031",
    category: "Snack Foods",
    imageUrl: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=500&auto=format&fit=crop",
    isCommunity: false,
    addedAt: "2025-01-28T10:00:00.000Z",
    analysis: {
      serving_info: {
        serving_size: "15 chips (28g)",
        servings_per_container: 8,
      },
      macros: {
        calories: { value: 160, unit: "kcal" },
        total_fat: { value: 10, unit: "g" },
        saturated_fat: { value: 1.5, unit: "g" },
        trans_fat: { value: 0, unit: "g" },
        cholesterol: { value: 0, unit: "mg" },
        sodium: { value: 170, unit: "mg" },
        total_carbohydrates: { value: 15, unit: "g" },
        dietary_fiber: { value: 1, unit: "g" },
        total_sugars: { value: 0, unit: "g" },
        added_sugars: { value: 0, unit: "g" },
        protein: { value: 2, unit: "g" },
      },
      ingredients: [
        "Potatoes",
        "Vegetable Oil (Canola, Corn, Soybean, and/or Sunflower Oil)",
        "Salt",
      ],
      allergens_identified: [],
      product_name: "Classic Potato Chips",
      brand: "Lay's",
      barcode: "028400000031",
      category: "Snack Foods",
      health: {
        score: 4.8,
        overall: "Moderate",
        comments: "Simple 3-ingredient salted potato chips. High calorie and fat density per serving; consume in moderation.",
        recommendations: [
          "Control portion size to maintain balanced sodium and fat intake.",
          "Swap with baked potato chips or air-popped popcorn for lower fat alternatives.",
        ],
        ingredients_with_flags: [
          { name: "Potatoes", status: "good", color: "green", reason: "Whole sliced potatoes.", categoryTag: "Whole Food" },
          { name: "Vegetable Oil", status: "neutral", color: "amber", reason: "Refined plant oils used for frying.", categoryTag: "Refined Oil" },
          { name: "Salt", status: "neutral", color: "amber", reason: "170mg sodium per serving.", categoryTag: "Sodium" },
        ],
        dietary_flags: [
          { diet: "Vegan", suitable: true, reason: "100% plant-based ingredients." },
          { diet: "Gluten-Free", suitable: true, reason: "No gluten ingredients." },
          { diet: "Nut-Free", suitable: true, reason: "Nut-free product." },
          { diet: "Dairy-Free", suitable: true, reason: "Dairy-free." },
          { diet: "Keto-Friendly", suitable: false, reason: "14g net carbs per serving." },
          { diet: "Low Sodium", suitable: false, reason: "170mg sodium per serving." },
        ],
        traffic_light: {
          fat: "red",
          saturated_fat: "amber",
          sugars: "green",
          salt: "amber",
        },
        analysis_source: "rules_fallback",
      },
    },
  },
];

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      products: [],
      communityProducts: [],
      scanHistory: [],
      userPreferences: {
        allergens: [],
        dietRestrictions: [],
      },
    };
    this.initialize();
  }

  private initialize() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        // Ensure all seed products exist
        let updated = false;
        for (const seed of INITIAL_PRODUCTS) {
          if (!this.data.products.some(p => p.barcode === seed.barcode)) {
            this.data.products.push(seed);
            updated = true;
          }
        }
        if (updated) this.save();
      } else {
        this.data.products = [...INITIAL_PRODUCTS];
        this.save();
      }
    } catch (err) {
      console.error('Error initializing database file, reverting to seed:', err);
      this.data.products = [...INITIAL_PRODUCTS];
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('Failed to save DB to disk:', err);
    }
  }

  // --- Product CRUD Operations ---
  public getProducts(search?: string, category?: string, minScore?: number): ProductRecord[] {
    return this.data.products.filter(p => {
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
      if (minScore !== undefined && (p.analysis.health?.score ?? 0) < minScore) {
        return false;
      }
      return true;
    });
  }

  public getProductByBarcode(barcode: string): ProductRecord | null {
    const clean = barcode.trim();
    return this.data.products.find(p => p.barcode === clean) || null;
  }

  public getProductById(id: string): ProductRecord | null {
    return this.data.products.find(p => p.id === id) || null;
  }

  public addProduct(product: Omit<ProductRecord, 'id' | 'addedAt'>): ProductRecord {
    const id = `prod-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecord: ProductRecord = {
      ...product,
      id,
      addedAt: new Date().toISOString(),
    };
    this.data.products.unshift(newRecord);
    if (newRecord.isCommunity) {
      this.data.communityProducts.push({
        id: `comm-${Date.now()}`,
        productId: id,
        userId: 'user-community',
        addedAt: newRecord.addedAt,
      });
    }
    this.save();
    return newRecord;
  }

  // --- Healthier Alternatives ---
  public getAlternatives(productId: string): AlternativeProduct[] {
    const target = this.getProductById(productId);
    if (!target) return [];

    const targetScore = target.analysis.health?.score ?? 5;
    const sameCategoryBetter = this.data.products.filter(p => {
      if (p.id === target.id) return false;
      if (p.category !== target.category) return false;
      return (p.analysis.health?.score ?? 0) > targetScore;
    });

    // Sort by health score descending
    sameCategoryBetter.sort((a, b) => (b.analysis.health?.score ?? 0) - (a.analysis.health?.score ?? 0));

    return sameCategoryBetter.slice(0, 3).map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      healthScore: p.analysis.health?.score ?? 5,
      imageUrl: p.imageUrl,
      reason: `Higher nutritional score (${p.analysis.health?.score ?? 5}/10 vs ${targetScore}/10) with lower processing impact.`,
      analysis: p.analysis,
    }));
  }

  // --- History Operations ---
  public getScanHistory(): ScanHistoryRecord[] {
    return this.data.scanHistory;
  }

  public addScanHistory(historyItem: Omit<ScanHistoryRecord, 'id' | 'timestamp'>): ScanHistoryRecord {
    const record: ScanHistoryRecord = {
      ...historyItem,
      id: `scan-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.scanHistory.unshift(record);
    // Keep last 50 scans
    if (this.data.scanHistory.length > 50) {
      this.data.scanHistory = this.data.scanHistory.slice(0, 50);
    }
    this.save();
    return record;
  }

  public toggleFavoriteHistory(scanId: string): boolean {
    const item = this.data.scanHistory.find(s => s.id === scanId);
    if (item) {
      item.isFavorite = !item.isFavorite;
      this.save();
      return !!item.isFavorite;
    }
    return false;
  }

  public clearScanHistory() {
    this.data.scanHistory = [];
    this.save();
  }

  // --- User Preferences ---
  public getUserPreferences(): UserPreferences {
    return this.data.userPreferences;
  }

  public updateUserPreferences(prefs: Partial<UserPreferences>): UserPreferences {
    this.data.userPreferences = {
      ...this.data.userPreferences,
      ...prefs,
    };
    this.save();
    return this.data.userPreferences;
  }
}

export const db = new DatabaseManager();
