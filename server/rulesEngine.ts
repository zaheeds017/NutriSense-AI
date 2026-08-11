import {
  AnalysisResultContract,
  HealthData,
  IngredientFlag,
  DietaryFlag,
  Macros,
  ServingInfo,
  TrafficLightSummary,
  UserPreferences,
} from '../src/types.js';

// Comprehensive Harmful, Amber, and Beneficial Ingredient Dictionaries
const HARMFUL_INGREDIENTS = [
  { pattern: /high fructose corn syrup/i, reason: 'Highly refined fructose linked to metabolic strain and fatty liver.', tag: 'Added Sugar' },
  { pattern: /hydrogenated/i, reason: 'Contains trans fats that significantly elevate heart disease risk.', tag: 'Trans Fat' },
  { pattern: /partially hydrogenated/i, reason: 'Primary industrial source of harmful trans fats.', tag: 'Trans Fat' },
  { pattern: /palm oil|palmate/i, reason: 'High in saturated fats and environmentally controversial.', tag: 'Saturated Fat' },
  { pattern: /red 40|yellow 5|yellow 6|blue 1|red 3/i, reason: 'Artificial synthetic dye linked to hyperactivity in sensitive individuals.', tag: 'Artificial Color' },
  { pattern: /sodium nitrite|sodium nitrate/i, reason: 'Curing preservative associated with potential nitrosamine formation.', tag: 'Preservative' },
  { pattern: /bha|bht|tbhq/i, reason: 'Synthetic antioxidant preservative with controversial safety profile.', tag: 'Preservative' },
  { pattern: /aspartame|acesulfame potassium|sucralose|saccharin/i, reason: 'Artificial intense sweetener that may alter gut microbiome.', tag: 'Artificial Sweetener' },
  { pattern: /potassium bromate/i, reason: 'Dough conditioner banned in many international regions.', tag: 'Additive' },
  { pattern: /monosodium glutamate|msg/i, reason: 'Flavor enhancer that may cause sensitivity reactions in some consumers.', tag: 'Flavor Enhancer' },
  { pattern: /titanium dioxide/i, reason: 'Opacity additive restricted in the EU due to nanoparticle concerns.', tag: 'Additive' },
  { pattern: /carrageenan/i, reason: 'Emulsifying agent linked to potential intestinal inflammation.', tag: 'Emulsifier' },
];

const AMBER_INGREDIENTS = [
  { pattern: /\bsugar\b|cane sugar|invert sugar/i, reason: 'Added sugar source; consume in moderation.', tag: 'Added Sugar' },
  { pattern: /dextrose|maltodextrin|corn syrup/i, reason: 'Rapid-digesting simple carbohydrate that spikes blood glucose.', tag: 'Refined Carbs' },
  { pattern: /canola oil|soybean oil|sunflower oil|vegetable oil/i, reason: 'Refined seed oil high in omega-6 fatty acids.', tag: 'Refined Oil' },
  { pattern: /natural flavor|natural and artificial flavors/i, reason: 'Proprietary flavor blend; source ingredients undisclosed.', tag: 'Flavoring' },
  { pattern: /sodium benzoate|potassium sorbate/i, reason: 'Common chemical preservative to extend shelf life.', tag: 'Preservative' },
  { pattern: /xanthan gum|guar gum|cellulose gum|soy lecithin/i, reason: 'Common food stabilizer/emulsifier; generally safe in low amounts.', tag: 'Emulsifier' },
  { pattern: /salt|sodium chloride/i, reason: 'Sodium contributor; monitor total daily sodium intake.', tag: 'Sodium' },
];

const BENEFICIAL_INGREDIENTS = [
  { pattern: /whole grain|whole wheat|whole oats|rolled oats/i, reason: 'Excellent source of dietary fiber, complex carbs, and B vitamins.', tag: 'Whole Grain' },
  { pattern: /almond|walnut|chia seed|flaxseed|pumpkin seed/i, reason: 'Nutrient-dense with healthy unsaturated omega-3 fats and minerals.', tag: 'Healthy Fats' },
  { pattern: /extra virgin olive oil|avocado oil/i, reason: 'Unrefined heart-healthy monounsaturated fat rich in antioxidants.', tag: 'Healthy Fats' },
  { pattern: /spinach|kale|blueberry|cranberry|apple|banana/i, reason: 'Rich in essential dietary phytonutrients, vitamins, and antioxidants.', tag: 'Superfood' },
  { pattern: /greek yogurt|live active cultures|probiotic/i, reason: 'Supports gut microbiome diversity and provides high quality protein.', tag: 'Probiotic' },
  { pattern: /quinoa|lentils|chickpeas|black beans/i, reason: 'Plant-based complete protein packed with fiber and micronutrients.', tag: 'Plant Protein' },
];

const ALLERGEN_DICTIONARY = [
  { name: 'Gluten / Wheat', keywords: ['wheat', 'barley', 'rye', 'spelt', 'malt', 'gluten', 'farina', 'semolina'] },
  { name: 'Milk / Dairy', keywords: ['milk', 'whey', 'casein', 'cream', 'butter', 'cheese', 'lactose', 'yogurt', 'milkfat'] },
  { name: 'Peanuts', keywords: ['peanut', 'peanuts', 'peanut butter', 'peanut oil'] },
  { name: 'Tree Nuts', keywords: ['almond', 'walnut', 'cashew', 'pecan', 'hazelnut', 'pistachio', 'macadamia', 'chestnut', 'brazil nut'] },
  { name: 'Soybeans / Soy', keywords: ['soy', 'soybean', 'soy lecithin', 'tofu', 'edamame', 'soy protein'] },
  { name: 'Eggs', keywords: ['egg', 'eggs', 'egg white', 'egg yolk', 'albumin', 'mayonnaise'] },
  { name: 'Fish', keywords: ['fish', 'salmon', 'tuna', 'cod', 'anchovy', 'sardine', 'tilapia'] },
  { name: 'Crustacean Shellfish', keywords: ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'] },
  { name: 'Sesame', keywords: ['sesame', 'tahini', 'sesame oil'] },
  { name: 'Mustard', keywords: ['mustard', 'mustard seed'] },
  { name: 'Celery', keywords: ['celery', 'celery salt', 'celery seed'] },
  { name: 'Sulfites', keywords: ['sulfite', 'sulphite', 'sodium metabisulfite', 'sulfur dioxide'] },
  { name: 'Lupin', keywords: ['lupin', 'lupine'] },
  { name: 'Molluscs', keywords: ['clam', 'mussel', 'oyster', 'squid', 'octopus'] },
];

/**
 * Standardize text string of ingredients into clean list
 */
export function parseIngredientsText(rawText: string): string[] {
  if (!rawText) return [];
  // Clean up label prefixes like "INGREDIENTS:", "CONTAINS:"
  let cleaned = rawText.replace(/ingredients\s*:\s*/gi, '')
                      .replace(/contains\s*:\s*/gi, '')
                      .replace(/\n/g, ' ');
  // Split on commas or semicolons outside parentheses
  const result: string[] = [];
  let current = '';
  let parenDepth = 0;

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i];
    if (char === '(' || char === '[') parenDepth++;
    else if (char === ')' || char === ']') parenDepth = Math.max(0, parenDepth - 1);

    if ((char === ',' || char === ';') && parenDepth === 0) {
      const trimmed = current.trim().replace(/^ingredients\s*:\s*/i, '').replace(/\.$/, '');
      if (trimmed) result.push(trimmed);
      current = '';
    } else {
      current += char;
    }
  }
  const lastTrimmed = current.trim().replace(/^ingredients\s*:\s*/i, '').replace(/\.$/, '');
  if (lastTrimmed) result.push(lastTrimmed);

  return result.filter(item => item.length > 0 && !/^contains\b/i.test(item));
}

/**
 * Identify Allergens from ingredients list
 */
export function detectAllergens(ingredients: string[]): string[] {
  const fullText = ingredients.join(' ').toLowerCase();
  const identified: string[] = [];

  for (const allergen of ALLERGEN_DICTIONARY) {
    for (const kw of allergen.keywords) {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      if (regex.test(fullText)) {
        if (!identified.includes(allergen.name)) {
          identified.push(allergen.name);
        }
        break;
      }
    }
  }
  return identified;
}

/**
 * Compute UK/EU FSA Traffic Light colors for macros
 */
export function computeTrafficLights(macros: Macros): TrafficLightSummary {
  const fatVal = macros.total_fat.value ?? 0;
  const satVal = macros.saturated_fat.value ?? 0;
  const sugarVal = macros.total_sugars.value ?? 0;
  const sodiumVal = macros.sodium.value ?? 0;

  // Salt in grams = sodium mg * 2.5 / 1000
  const saltVal = (sodiumVal * 2.5) / 1000;

  return {
    fat: fatVal > 17.5 ? 'red' : fatVal > 3.0 ? 'amber' : 'green',
    saturated_fat: satVal > 5.0 ? 'red' : satVal > 1.5 ? 'amber' : 'green',
    sugars: sugarVal > 22.5 ? 'red' : sugarVal > 5.0 ? 'amber' : 'green',
    salt: saltVal > 1.5 ? 'red' : saltVal > 0.3 ? 'amber' : 'green',
  };
}

/**
 * Evaluate Dietary Restrictions
 */
export function evaluateDietaryFlags(ingredients: string[], macros: Macros, allergens: string[], userPrefs?: UserPreferences): DietaryFlag[] {
  const text = ingredients.join(' ').toLowerCase();
  const flags: DietaryFlag[] = [];

  // Vegan check
  const nonVeganKeywords = ['milk', 'whey', 'casein', 'butter', 'cheese', 'honey', 'egg', 'gelatin', 'lard', 'tallow', 'carmine', 'cochineal', 'fish', 'anchovy', 'chicken', 'beef', 'pork'];
  const nonVeganFound = nonVeganKeywords.filter(kw => new RegExp(`\\b${kw}\\b`, 'i').test(text));
  flags.push({
    diet: 'Vegan',
    suitable: nonVeganFound.length === 0,
    reason: nonVeganFound.length > 0 ? `Contains animal derivatives: ${nonVeganFound.slice(0, 3).join(', ')}` : 'No animal derivatives detected in ingredient list.',
  });

  // Gluten-Free check
  const glutenAllergen = allergens.find(a => a.includes('Gluten'));
  flags.push({
    diet: 'Gluten-Free',
    suitable: !glutenAllergen,
    reason: glutenAllergen ? 'Contains gluten-containing grains (wheat, barley, rye, or malt).' : 'Free from gluten-containing grains.',
  });

  // Nut-Free check
  const nutAllergen = allergens.find(a => a.includes('Peanuts') || a.includes('Tree Nuts'));
  flags.push({
    diet: 'Nut-Free',
    suitable: !nutAllergen,
    reason: nutAllergen ? 'Contains nuts or nut oils.' : 'No peanuts or tree nuts detected.',
  });

  // Dairy-Free check
  const dairyAllergen = allergens.find(a => a.includes('Milk'));
  flags.push({
    diet: 'Dairy-Free',
    suitable: !dairyAllergen,
    reason: dairyAllergen ? 'Contains dairy/milk ingredients.' : 'No dairy ingredients detected.',
  });

  // Keto-Friendly check (low net carbs)
  const totalCarbs = macros.total_carbohydrates.value ?? 0;
  const fiber = macros.dietary_fiber.value ?? 0;
  const netCarbs = Math.max(0, totalCarbs - fiber);
  flags.push({
    diet: 'Keto-Friendly',
    suitable: netCarbs <= 5,
    reason: netCarbs <= 5 ? `Low net carbohydrate count (${netCarbs}g per serving).` : `High net carbs (${netCarbs}g per serving) exceeds keto threshold.`,
  });

  // Low Sodium check (< 140mg per serving)
  const sodium = macros.sodium.value ?? 0;
  flags.push({
    diet: 'Low Sodium',
    suitable: sodium <= 140,
    reason: sodium <= 140 ? `Contains ${sodium}mg sodium per serving.` : `Sodium level (${sodium}mg) exceeds low-sodium target (140mg).`,
  });

  return flags;
}

/**
 * Main Rule-Based Analysis Engine
 */
export function analyzeProductRules(
  productName: string,
  brand: string,
  ingredientsList: string[],
  macros: Macros,
  servingInfo: ServingInfo,
  userPrefs?: UserPreferences
): HealthData {
  const ingredientsWithFlags: IngredientFlag[] = [];
  let scorePoints = 7.0; // Baseline neutral score out of 10

  // 1. Evaluate ingredients
  for (const ing of ingredientsList) {
    let matched = false;

    // Check harmful
    for (const h of HARMFUL_INGREDIENTS) {
      if (h.pattern.test(ing)) {
        ingredientsWithFlags.push({
          name: ing,
          status: 'harmful',
          color: 'red',
          reason: h.reason,
          categoryTag: h.tag,
        });
        scorePoints -= 1.2;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check beneficial
    for (const b of BENEFICIAL_INGREDIENTS) {
      if (b.pattern.test(ing)) {
        ingredientsWithFlags.push({
          name: ing,
          status: 'good',
          color: 'green',
          reason: b.reason,
          categoryTag: b.tag,
        });
        scorePoints += 0.8;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check amber
    for (const a of AMBER_INGREDIENTS) {
      if (a.pattern.test(ing)) {
        ingredientsWithFlags.push({
          name: ing,
          status: 'neutral',
          color: 'amber',
          reason: a.reason,
          categoryTag: a.tag,
        });
        scorePoints -= 0.4;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Default neutral
    ingredientsWithFlags.push({
      name: ing,
      status: 'neutral',
      color: 'amber',
      reason: 'Standard food ingredient; no elevated concern or unique benefit detected.',
      categoryTag: 'Ingredient',
    });
  }

  // 2. Evaluate Macro balance impacts
  const trafficLight = computeTrafficLights(macros);
  if (trafficLight.sugars === 'red') scorePoints -= 1.5;
  if (trafficLight.saturated_fat === 'red') scorePoints -= 1.0;
  if (trafficLight.salt === 'red') scorePoints -= 1.0;
  if (trafficLight.fat === 'red') scorePoints -= 0.5;

  // Fiber boost
  const fiber = macros.dietary_fiber.value ?? 0;
  if (fiber >= 5) scorePoints += 1.0;
  else if (fiber >= 3) scorePoints += 0.5;

  // Protein boost
  const protein = macros.protein.value ?? 0;
  if (protein >= 10) scorePoints += 0.8;
  else if (protein >= 5) scorePoints += 0.4;

  // Clamp final score 1.0 to 10.0
  const finalScore = Math.min(10, Math.max(1, Math.round(scorePoints * 10) / 10));

  let overall: HealthData['overall'] = 'Moderate';
  if (finalScore >= 8.5) overall = 'Excellent';
  else if (finalScore >= 7.0) overall = 'Good';
  else if (finalScore >= 5.0) overall = 'Moderate';
  else if (finalScore >= 3.0) overall = 'Poor';
  else overall = 'Unhealthy';

  const allergens = detectAllergens(ingredientsList);
  const dietaryFlags = evaluateDietaryFlags(ingredientsList, macros, allergens, userPrefs);

  // Recommendations generator
  const recommendations: string[] = [];
  if (trafficLight.sugars === 'red' || (macros.added_sugars.value ?? 0) > 10) {
    recommendations.push('Consider replacing with unsweetened or lower-sugar alternatives to avoid glucose spikes.');
  }
  if (trafficLight.salt === 'red') {
    recommendations.push('High sodium content — monitor total daily salt intake or choose reduced-sodium options.');
  }
  if (ingredientsWithFlags.some(i => i.status === 'harmful')) {
    recommendations.push('Contains ultra-processed additives or artificial ingredients; prioritize whole-food options when possible.');
  }
  if (fiber < 3) {
    recommendations.push('Low in dietary fiber — pair with fiber-rich fresh vegetables or whole grains.');
  }
  if (recommendations.length === 0) {
    recommendations.push('Great nutritional balance! Fits well as part of a healthy, varied diet.');
  }

  const comments = `${productName || 'Product'} receives a ${finalScore}/10 (${overall}) score based on ingredient processing levels and macro balance. Key factors include ${
    trafficLight.sugars === 'red' ? 'high sugar' : 'balanced carbs'
  }, ${
    trafficLight.salt === 'red' ? 'high sodium' : 'controlled salt'
  }, and ${
    ingredientsWithFlags.filter(i => i.status === 'good').length
  } beneficial ingredient(s).`;

  return {
    score: finalScore,
    overall,
    comments,
    recommendations: recommendations.slice(0, 3),
    ingredients_with_flags: ingredientsWithFlags,
    dietary_flags: dietaryFlags,
    traffic_light: trafficLight,
    analysis_source: 'rules_fallback',
  };
}
