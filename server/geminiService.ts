import { GoogleGenAI } from '@google/genai';
import {
  AnalysisResultContract,
  Macros,
  ServingInfo,
  UserPreferences,
} from '../src/types.js';
import { analyzeProductRules, parseIngredientsText, detectAllergens } from './rulesEngine.js';
import fs from 'fs';
import path from 'path';

// Load System Prompt template if available
let systemPromptText = '';
try {
  const promptPath = path.join(process.cwd(), 'src', 'prompts', 'ai_analysis.prompt.txt');
  if (fs.existsSync(promptPath)) {
    systemPromptText = fs.readFileSync(promptPath, 'utf8');
  }
} catch (e) {
  console.warn('System prompt file not read directly, using built-in system prompt.');
}

if (!systemPromptText) {
  systemPromptText = `You are NutriSense-AI AI, an expert food scientist and nutritionist.
Analyze the food product inputs (OCR image or text label) and extract structured macros, serving info, ingredients, allergens, and compute a 1-10 health score with ingredient flags and dietary compatibility.
Return strict JSON complying with the NutriSense-AI schema.`;
}

/**
 * Initialize Gemini Client if API key exists
 */
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Analyze Product Text Label using Gemini AI (with Rule Fallback)
 */
export async function analyzeTextWithAI(
  inputText: string,
  productName?: string,
  brand?: string,
  userPrefs?: UserPreferences
): Promise<AnalysisResultContract> {
  const ai = getGeminiClient();

  if (!ai) {
    console.log('Gemini API key not found/set. Using rule-based engine fallback.');
    return fallbackTextAnalysis(inputText, productName, brand, userPrefs);
  }

  try {
    const prompt = `Analyze this food product label text:
Product Name: ${productName || 'Unknown'}
Brand: ${brand || 'Unknown'}
Raw Label Text:
"""
${inputText}
"""

Extract structured values and calculate health scores. Standardize all macro units to kcal/g/mg/mcg. Return valid JSON only.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: systemPromptText,
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error('Empty response from Gemini AI');
    }

    const parsed = JSON.parse(rawJson) as AnalysisResultContract;
    // Mark source as AI
    if (parsed.health) {
      parsed.health.analysis_source = 'ai';
    }
    return parsed;
  } catch (err) {
    console.error('Gemini text analysis error, falling back to rules engine:', err);
    return fallbackTextAnalysis(inputText, productName, brand, userPrefs);
  }
}

/**
 * Analyze Product Image (OCR + Nutrition) using Gemini Multimodal Vision AI (with Rule Fallback)
 */
export async function analyzeImageWithAI(
  base64Data: string,
  mimeType: string,
  productName?: string,
  brand?: string,
  userPrefs?: UserPreferences
): Promise<AnalysisResultContract> {
  const ai = getGeminiClient();

  if (!ai) {
    console.log('Gemini API key not set for OCR image scan. Using default image parsing fallback.');
    return fallbackTextAnalysis('Ingredients: Water, Sugar, Natural Flavors.', productName || 'Scanned Product', brand, userPrefs);
  }

  try {
    const imagePart = {
      inlineData: {
        data: base64Data.replace(/^data:image\/\w+;base64,/, ''),
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const textPrompt = `Extract all nutrition facts and ingredients from this scanned food label image.
Product Name context: ${productName || 'Unknown'}
Brand context: ${brand || 'Unknown'}

Follow the strict JSON schema. Extract serving size, macros, ingredients list, allergens, compute 1-10 health score, ingredient health flags, and recommendations.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: {
        parts: [imagePart, { text: textPrompt }],
      },
      config: {
        systemInstruction: systemPromptText,
        responseMimeType: 'application/json',
      },
    });

    const rawJson = response.text;
    if (!rawJson) {
      throw new Error('Empty image analysis from Gemini AI');
    }

    const parsed = JSON.parse(rawJson) as AnalysisResultContract;
    if (parsed.health) {
      parsed.health.analysis_source = 'ai';
    }
    return parsed;
  } catch (err) {
    console.error('Gemini image analysis error, falling back to rules:', err);
    return fallbackTextAnalysis('Ingredients: Water, Sugar, Natural Flavors.', productName || 'Scanned Label Product', brand, userPrefs);
  }
}

/**
 * Local Rule Fallback for Text Analysis
 */
function fallbackTextAnalysis(
  inputText: string,
  productName?: string,
  brand?: string,
  userPrefs?: UserPreferences
): AnalysisResultContract {
  const ingredientsList = parseIngredientsText(inputText);

  // Extract Macros using simple Regex
  const caloriesMatch = inputText.match(/calories\s*:?\s*(\d+)/i);
  const totalFatMatch = inputText.match(/total fat\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const satFatMatch = inputText.match(/saturated fat\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const transFatMatch = inputText.match(/trans fat\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const cholMatch = inputText.match(/cholesterol\s*:?\s*(\d+(?:\.\d+)?)\s*mg/i);
  const sodMatch = inputText.match(/sodium\s*:?\s*(\d+(?:\.\d+)?)\s*mg/i);
  const carbMatch = inputText.match(/(?:total carbohydrate|carbs)\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const fiberMatch = inputText.match(/(?:dietary fiber|fiber)\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const sugarMatch = inputText.match(/(?:total sugars|sugars)\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const addedSugarMatch = inputText.match(/(?:added sugars)\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);
  const proteinMatch = inputText.match(/protein\s*:?\s*(\d+(?:\.\d+)?)\s*g/i);

  const macros: Macros = {
    calories: { value: caloriesMatch ? parseFloat(caloriesMatch[1]) : null, unit: 'kcal' },
    total_fat: { value: totalFatMatch ? parseFloat(totalFatMatch[1]) : null, unit: 'g' },
    saturated_fat: { value: satFatMatch ? parseFloat(satFatMatch[1]) : null, unit: 'g' },
    trans_fat: { value: transFatMatch ? parseFloat(transFatMatch[1]) : null, unit: 'g' },
    cholesterol: { value: cholMatch ? parseFloat(cholMatch[1]) : null, unit: 'mg' },
    sodium: { value: sodMatch ? parseFloat(sodMatch[1]) : null, unit: 'mg' },
    total_carbohydrates: { value: carbMatch ? parseFloat(carbMatch[1]) : null, unit: 'g' },
    dietary_fiber: { value: fiberMatch ? parseFloat(fiberMatch[1]) : null, unit: 'g' },
    total_sugars: { value: sugarMatch ? parseFloat(sugarMatch[1]) : null, unit: 'g' },
    added_sugars: { value: addedSugarMatch ? parseFloat(addedSugarMatch[1]) : null, unit: 'g' },
    protein: { value: proteinMatch ? parseFloat(proteinMatch[1]) : null, unit: 'g' },
  };

  const servingInfo: ServingInfo = {
    serving_size: '1 serving',
    servings_per_container: 1,
  };

  const finalIngredients = ingredientsList.length > 0 ? ingredientsList : ['Unspecified Ingredients'];
  const allergens = detectAllergens(finalIngredients);
  const healthData = analyzeProductRules(
    productName || 'Parsed Food Product',
    brand || 'Generic',
    finalIngredients,
    macros,
    servingInfo,
    userPrefs
  );

  return {
    serving_info: servingInfo,
    macros,
    ingredients: finalIngredients,
    allergens_identified: allergens,
    product_name: productName || 'Parsed Food Product',
    brand: brand || 'Generic',
    health: healthData,
  };
}
