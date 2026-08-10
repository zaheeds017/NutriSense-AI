/**
 * Computer Vision & AI OCR Extraction Engine
 * Parses raw text/images of food labels into schema-validated JSON objects.
 */

import { validateAndNormalizeSchema } from './jsonSchemaValidator.js';
import { SAMPLE_FOOD_PACKAGES } from './sampleDatabase.js';
import { analyzeIngredientsList } from './healthAnalyzer.js';
import { detectHumanFace } from './faceDetector.js';
import { enrichWithHealth } from './rulesEngine.js';
import { getProductByBarcode, addProduct } from './productDatabase.js';
import { fetchOpenFoodFactsProduct } from './openFoodFacts.js';

/**
 * Extracts structured nutrition data from image/canvas or raw text.
 * @param {Object} options - { imageSource, rawText, apiKey, sampleId, productName, brand, userPrefs }
 */
export async function parseNutritionLabel(options = {}) {
  const { imageSource, rawText, apiKey, sampleId, productName, brand, userPrefs } = options;

  // 1. If user selected a preset sample item, return its pre-parsed target JSON
  if (sampleId) {
    const sample = SAMPLE_FOOD_PACKAGES.find(s => s.id === sampleId);
    if (sample) {
      const enriched = enrichWithHealth(
        { ...sample.extractedJson, product_name: sample.name, brand: sample.brand, category: sample.category, barcode: sample.barcode, image_url: sample.imageUrl },
        sample.name,
        sample.brand,
        userPrefs
      );
      return {
        success: true,
        isHumanFace: false,
        source: 'Preset Sample Package',
        rawText: sample.ocrRawText.trim(),
        data: enriched,
        sampleMeta: sample
      };
    }
  }

  // 2. Human Face Detection Check
  if (imageSource) {
    try {
      const faceCheck = await detectHumanFace(imageSource);
      if (faceCheck && faceCheck.hasFace) {
        return {
          success: false,
          isHumanFace: true,
          method: faceCheck.method,
          message: "Human Face Detected! Please scan a packaged food item or nutrition label instead.",
          rawText: "Human face detected in camera/upload frame."
        };
      }
    } catch (err) {
      console.warn("Face detection warning:", err);
    }
  }


  // 2. If user provided a custom Gemini API key and image source, run LLM Multimodal Vision
  if (apiKey && imageSource) {
    try {
      const geminiResult = await runGeminiVisionAnalysis(imageSource, apiKey);
      if (geminiResult && geminiResult.macros) {
        const validated = validateAndNormalizeSchema(geminiResult);
        const enriched = enrichWithHealth(validated.normalizedData, productName, brand, userPrefs);
        return {
          success: true,
          source: 'Gemini AI Multimodal Vision',
          rawText: geminiResult._rawOcr || 'Extracted via Gemini Vision API',
          data: enriched
        };
      }
    } catch (err) {
      console.warn('Gemini Vision API error, falling back to Client OCR engine:', err);
    }
  }

  // 3. Client OCR via Tesseract.js / Canvas rule parsing
  let textToParse = rawText || '';

  if (imageSource && !textToParse) {
    try {
      textToParse = await performClientOcr(imageSource);
    } catch (ocrErr) {
      console.error('OCR Extraction failed:', ocrErr);
      textToParse = '';
    }
  }

  // 4. Rule-Based Natural Language & Regex Extraction
  const extractedRaw = parseTextWithRegexRules(textToParse);
  const validated = validateAndNormalizeSchema(extractedRaw);
  const enriched = enrichWithHealth(validated.normalizedData, productName, brand, userPrefs);

  return {
    success: true,
    source: textToParse ? 'Client OCR + Regex Parser' : 'Intelligent Parser',
    rawText: textToParse || 'No legible text detected on image',
    data: enriched
  };
}

/**
 * Barcode scan pipeline: local product database → Open Food Facts live lookup.
 * @param {string} barcode - UPC/EAN code
 * @param {Object} userPrefs - allergen/diet profile
 */
export async function parseBarcode(barcode, userPrefs) {
  const clean = String(barcode || '').trim();
  if (!clean) {
    return { success: false, isHumanFace: false, message: 'Please provide a valid barcode.' };
  }

  // 1. Local product database (seed + community + previously cached)
  const localProduct = getProductByBarcode(clean);
  if (localProduct) {
    return {
      success: true,
      isHumanFace: false,
      source: 'Barcode Database Lookup',
      rawText: `Matched barcode ${clean} in the built-in product catalog (${localProduct.name}).`,
      data: localProduct.analysis,
      sampleMeta: null,
      productRecord: localProduct,
      scanType: 'barcode'
    };
  }

  // 2. Live Open Food Facts lookup
  const offAnalysis = await fetchOpenFoodFactsProduct(clean, userPrefs);
  if (offAnalysis) {
    const cached = addProduct({
      name: offAnalysis.product_name || 'Scanned Food Product',
      brand: offAnalysis.brand || 'Open Food Facts Item',
      barcode: clean,
      category: offAnalysis.category || 'General Food',
      imageUrl: offAnalysis.image_url,
      analysis: offAnalysis,
      isCommunity: false,
    });
    return {
      success: true,
      isHumanFace: false,
      source: 'Barcode Scan (Open Food Facts)',
      rawText: `Live product data retrieved from Open Food Facts for barcode ${clean}.`,
      data: offAnalysis,
      sampleMeta: null,
      productRecord: cached,
      scanType: 'barcode'
    };
  }

  return {
    success: false,
    isHumanFace: false,
    source: 'Barcode Scan',
    rawText: '',
    notFound: true,
    message: `Barcode ${clean} not found in the catalog or Open Food Facts. Capture the ingredients label or add the product manually.`
  };
}

/**
 * Perform Tesseract client OCR on an image URL, base64 string, or File/Blob
 */
async function performClientOcr(imageSource) {
  try {
    const { createWorker } = await import('tesseract.js');
    const worker = await createWorker('eng');
    const ret = await worker.recognize(imageSource);
    await worker.terminate();
    return ret.data.text || '';
  } catch (err) {
    console.warn('Tesseract OCR engine unavailable or failed:', err);
    return '';
  }
}

/**
 * Regex-based Natural Language OCR Rule Engine to parse Nutrition Facts text into target schema
 */
export function parseTextWithRegexRules(ocrText = '') {
  // Serving info
  let servingSize = null;
  let servingsPerContainer = null;

  const sizeMatch = ocrText.match(/serving\s*size:?\s*([^\n\r,]+)/i);
  if (sizeMatch) {
    servingSize = sizeMatch[1].trim();
  }

  const containerMatch = ocrText.match(/servings?\s*per\s*container:?\s*(about\s*)?([0-9.]+)/i);
  if (containerMatch) {
    servingsPerContainer = parseFloat(containerMatch[2]);
  }

  // Regex macro extractor helper
  const getNumberValue = (patterns) => {
    for (const pat of patterns) {
      const match = ocrText.match(pat);
      if (match && match[1]) {
        const val = parseFloat(match[1].replace(/[^0-9.]/g, ''));
        if (!isNaN(val)) return val;
      }
    }
    return null;
  };

  const calories = getNumberValue([
    /calories:?\s*([0-9]+)/i,
    /energy:?\s*([0-9]+)\s*kcal/i,
    /amount\s*per\s*serving\s*calories:?\s*([0-9]+)/i
  ]);

  const totalFat = getNumberValue([
    /total\s*fat:?\s*([0-9.]+)\s*g/i,
    /fat:?\s*([0-9.]+)\s*g/i
  ]);

  const saturatedFat = getNumberValue([
    /saturated\s*fat:?\s*([0-9.]+)\s*g/i,
    /sat\s*fat:?\s*([0-9.]+)\s*g/i
  ]);

  const transFat = getNumberValue([
    /trans\s*fat:?\s*([0-9.]+)\s*g/i
  ]);

  const cholesterol = getNumberValue([
    /cholesterol:?\s*([0-9.]+)\s*mg/i
  ]);

  const sodium = getNumberValue([
    /sodium:?\s*([0-9.]+)\s*mg/i,
    /salt:?\s*([0-9.]+)\s*g/i // Will convert g to mg if needed
  ]);

  const totalCarbs = getNumberValue([
    /total\s*carbohydrates?:?\s*([0-9.]+)\s*g/i,
    /carbohydrates?:?\s*([0-9.]+)\s*g/i,
    /carbs:?\s*([0-9.]+)\s*g/i
  ]);

  const dietaryFiber = getNumberValue([
    /dietary\s*fiber:?\s*([0-9.]+)\s*g/i,
    /fiber:?\s*([0-9.]+)\s*g/i
  ]);

  const totalSugars = getNumberValue([
    /total\s*sugars?:?\s*([0-9.]+)\s*g/i,
    /sugars?:?\s*([0-9.]+)\s*g/i
  ]);

  const addedSugars = getNumberValue([
    /includes?\s*([0-9.]+)\s*g\s*added\s*sugars?/i,
    /added\s*sugars?:?\s*([0-9.]+)\s*g/i
  ]);

  const protein = getNumberValue([
    /protein:?\s*([0-9.]+)\s*g/i
  ]);

  // Ingredients extraction
  let ingredientsList = [];
  const ingMatch = ocrText.match(/ingredients?:?\s*([\s\S]+?)(?=\n\n|contains|distributed|manufactured|\.|$)/i);
  if (ingMatch && ingMatch[1]) {
    ingredientsList = ingMatch[1]
      .split(/[,;\n]/)
      .map(i => i.replace(/^[:.\-\s]+/, '').trim())
      .filter(i => i.length > 1 && !i.toLowerCase().includes('nutrition facts'));
  }

  // Allergens identified
  let allergens = [];
  const containsMatch = ocrText.match(/contains:?\s*([^\n.]+)/i);
  if (containsMatch && containsMatch[1]) {
    allergens = containsMatch[1]
      .split(/[,;\s]+and\s+|[,;]+/)
      .map(a => a.trim())
      .filter(Boolean);
  } else {
    const analysis = analyzeIngredientsList(ingredientsList);
    allergens = analysis.allergens;
  }

  return {
    serving_info: {
      serving_size: servingSize,
      servings_per_container: servingsPerContainer
    },
    macros: {
      calories: { value: calories, unit: "kcal" },
      total_fat: { value: totalFat, unit: "g" },
      saturated_fat: { value: saturatedFat, unit: "g" },
      trans_fat: { value: transFat, unit: "g" },
      cholesterol: { value: cholesterol, unit: "mg" },
      sodium: { value: sodium, unit: "mg" },
      total_carbohydrates: { value: totalCarbs, unit: "g" },
      dietary_fiber: { value: dietaryFiber, unit: "g" },
      total_sugars: { value: totalSugars, unit: "g" },
      added_sugars: { value: addedSugars, unit: "g" },
      protein: { value: protein, unit: "g" }
    },
    ingredients: ingredientsList,
    allergens_identified: allergens
  };
}

/**
 * Gemini Multimodal Vision API call to parse food label image into exact JSON schema
 */
async function runGeminiVisionAnalysis(imageSource, apiKey) {
  const prompt = `Analyze this image of a packaged food nutrition label or ingredients list and extract the data into a perfectly structured, schema-validated JSON format conforming EXACTLY to this schema:

{
  "serving_info": {
    "serving_size": "string or null",
    "servings_per_container": "number or null"
  },
  "macros": {
    "calories": { "value": "number", "unit": "kcal" },
    "total_fat": { "value": "number", "unit": "g" },
    "saturated_fat": { "value": "number", "unit": "g" },
    "trans_fat": { "value": "number", "unit": "g" },
    "cholesterol": { "value": "number", "unit": "mg" },
    "sodium": { "value": "number", "unit": "mg" },
    "total_carbohydrates": { "value": "number", "unit": "g" },
    "dietary_fiber": { "value": "number", "unit": "g" },
    "total_sugars": { "value": "number", "unit": "g" },
    "added_sugars": { "value": "number", "unit": "g" },
    "protein": { "value": "number", "unit": "g" }
  },
  "ingredients": ["string"],
  "allergens_identified": ["string"]
}

Instructions:
1. Identify and extract all standard nutritional facts.
2. Extract serving size and servings per container if visible.
3. Extract complete list of ingredients exactly as written.
4. If an ingredient or nutrient value is partially obscured, extract legible portions or use null. Do not guess.
5. Standardize all units of measurement to grams (g), milligrams (mg), or micrograms (mcg) (calories unit: "kcal").
6. Return ONLY a valid JSON object. Do not wrap in markdown code blocks or text.`;

  // Convert base64 or fetch image blob
  let base64Data = imageSource;
  let mimeType = 'image/jpeg';

  if (imageSource.startsWith('data:')) {
    const parts = imageSource.split(',');
    mimeType = parts[0].match(/:(.*?);/)[1];
    base64Data = parts[1];
  } else if (imageSource.startsWith('blob:') || imageSource.startsWith('http')) {
    const resp = await fetch(imageSource);
    const blob = await resp.blob();
    mimeType = blob.type || 'image/jpeg';
    base64Data = await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(blob);
    });
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: mimeType,
              data: base64Data
            }
          }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json"
    }
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!res.ok) {
    throw new Error(`Gemini API error status ${res.status}`);
  }

  const jsonRes = await res.json();
  const textOutput = jsonRes.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!textOutput) throw new Error("Empty response from Gemini Vision API");

  const cleanJsonText = textOutput.replace(/```json/g, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJsonText);
  parsed._rawOcr = "Successfully parsed using Gemini Multimodal Vision AI Model";
  return parsed;
}

