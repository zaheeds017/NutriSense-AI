/**
 * Target JSON Schema Validator and Standardizer for Food Nutrition Scanner
 * Enforces strict FDA/EU measurement unit standards and schema structure.
 */

export const TARGET_SCHEMA_TEMPLATE = {
  serving_info: {
    serving_size: null,
    servings_per_container: null
  },
  macros: {
    calories: { value: null, unit: "kcal" },
    total_fat: { value: null, unit: "g" },
    saturated_fat: { value: null, unit: "g" },
    trans_fat: { value: null, unit: "g" },
    cholesterol: { value: null, unit: "mg" },
    sodium: { value: null, unit: "mg" },
    total_carbohydrates: { value: null, unit: "g" },
    dietary_fiber: { value: null, unit: "g" },
    total_sugars: { value: null, unit: "g" },
    added_sugars: { value: null, unit: "g" },
    protein: { value: null, unit: "g" }
  },
  ingredients: [],
  allergens_identified: []
};

/**
 * Validates and normalizes raw parsed JSON into the exact required schema.
 * @param {Object} inputJson - Raw output from OCR/LLM
 * @returns {Object} { isValid: boolean, errors: string[], normalizedData: Object }
 */
export function validateAndNormalizeSchema(inputJson) {
  const errors = [];
  if (!inputJson || typeof inputJson !== 'object') {
    return {
      isValid: false,
      errors: ['Input is not a valid JSON object'],
      normalizedData: cloneTemplate()
    };
  }

  const result = cloneTemplate();

  // 1. Serving Info
  if (inputJson.serving_info && typeof inputJson.serving_info === 'object') {
    result.serving_info.serving_size = typeof inputJson.serving_info.serving_size === 'string' 
      ? inputJson.serving_info.serving_size 
      : null;

    const spc = inputJson.serving_info.servings_per_container;
    result.serving_info.servings_per_container = (typeof spc === 'number' && !isNaN(spc))
      ? spc
      : (typeof spc === 'string' && !isNaN(parseFloat(spc)) ? parseFloat(spc) : null);
  }

  // 2. Macros Mapping & Unit Enforcement
  const macroKeys = [
    'calories', 'total_fat', 'saturated_fat', 'trans_fat',
    'cholesterol', 'sodium', 'total_carbohydrates', 'dietary_fiber',
    'total_sugars', 'added_sugars', 'protein'
  ];

  if (inputJson.macros && typeof inputJson.macros === 'object') {
    macroKeys.forEach((key) => {
      const targetUnit = key === 'calories' ? 'kcal' : (key === 'cholesterol' || key === 'sodium' ? 'mg' : 'g');
      const item = inputJson.macros[key];

      if (item && typeof item === 'object') {
        let val = item.value;
        if (typeof val === 'string') {
          const parsedVal = parseFloat(val.replace(/[^0-9.]/g, ''));
          val = isNaN(parsedVal) ? null : parsedVal;
        } else if (typeof val !== 'number' || isNaN(val)) {
          val = null;
        }

        // Standardize micro/milli/gram conversions if unit specified incorrectly
        if (item.unit && typeof item.unit === 'string') {
          const rawUnit = item.unit.toLowerCase().trim();
          if (rawUnit === 'mg' && targetUnit === 'g' && val !== null) {
            val = Number((val / 1000).toFixed(2));
          } else if (rawUnit === 'g' && targetUnit === 'mg' && val !== null) {
            val = Number((val * 1000).toFixed(0));
          } else if (rawUnit === 'mcg' || rawUnit === 'µg') {
            if (targetUnit === 'mg' && val !== null) val = Number((val / 1000).toFixed(3));
          }
        }

        result.macros[key] = { value: val, unit: targetUnit };
      } else {
        result.macros[key] = { value: null, unit: targetUnit };
      }
    });
  } else {
    errors.push('Missing "macros" section in JSON output');
  }

  // 3. Ingredients array
  if (Array.isArray(inputJson.ingredients)) {
    result.ingredients = inputJson.ingredients
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim());
  } else {
    result.ingredients = [];
  }

  // 4. Allergens identified array
  if (Array.isArray(inputJson.allergens_identified)) {
    result.allergens_identified = inputJson.allergens_identified
      .filter(item => typeof item === 'string' && item.trim().length > 0)
      .map(item => item.trim());
  } else {
    result.allergens_identified = [];
  }

  return {
    isValid: errors.length === 0,
    errors,
    normalizedData: result
  };
}

function cloneTemplate() {
  return JSON.parse(JSON.stringify(TARGET_SCHEMA_TEMPLATE));
}
