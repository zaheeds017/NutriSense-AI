/**
 * NutriSense-AI Types & JSON Contract Interfaces
 */

export interface MacroValue {
  value: number | null;
  unit: 'kcal' | 'g' | 'mg' | 'mcg';
}

export interface Macros {
  calories: MacroValue;
  total_fat: MacroValue;
  saturated_fat: MacroValue;
  trans_fat: MacroValue;
  cholesterol: MacroValue;
  sodium: MacroValue;
  total_carbohydrates: MacroValue;
  dietary_fiber: MacroValue;
  total_sugars: MacroValue;
  added_sugars: MacroValue;
  protein: MacroValue;
}

export interface ServingInfo {
  serving_size: string | null;
  servings_per_container: number | null;
}

export interface IngredientFlag {
  name: string;
  status: 'good' | 'neutral' | 'harmful';
  color: 'green' | 'amber' | 'red';
  reason: string;
  categoryTag?: string;
}

export interface DietaryFlag {
  diet: string;
  suitable: boolean;
  reason: string;
}

export interface TrafficLightSummary {
  fat: 'green' | 'amber' | 'red';
  saturated_fat: 'green' | 'amber' | 'red';
  sugars: 'green' | 'amber' | 'red';
  salt: 'green' | 'amber' | 'red';
}

export interface HealthData {
  score: number; // 1 to 10
  overall: 'Excellent' | 'Good' | 'Moderate' | 'Poor' | 'Unhealthy';
  comments: string;
  recommendations: string[];
  ingredients_with_flags: IngredientFlag[];
  dietary_flags: DietaryFlag[];
  traffic_light: TrafficLightSummary;
  analysis_source: 'ai' | 'rules_fallback';
}

/**
 * Strict JSON Contract specified in NutriSense-AI Dissertation
 */
export interface AnalysisResultContract {
  serving_info: ServingInfo;
  macros: Macros;
  ingredients: string[];
  allergens_identified: string[];
  product_id?: string;
  product_name?: string;
  brand?: string;
  barcode?: string;
  category?: string;
  image_url?: string;
  is_community?: boolean;
  health?: HealthData;
}

export interface UserPreferences {
  allergens: string[];
  dietRestrictions: string[];
  maxSodiumMg?: number;
  maxSugarG?: number;
}

export interface ProductRecord {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  category: string;
  imageUrl?: string;
  isCommunity?: boolean;
  addedAt?: string;
  analysis: AnalysisResultContract;
}

export interface ScanHistoryRecord {
  id: string;
  productName: string;
  brand: string;
  barcode?: string;
  scanType: 'barcode' | 'ocr' | 'text';
  timestamp: string;
  healthScore: number;
  analysis: AnalysisResultContract;
  isFavorite?: boolean;
}

export interface AlternativeProduct {
  id: string;
  name: string;
  brand: string;
  healthScore: number;
  category: string;
  reason: string;
  imageUrl?: string;
  analysis: AnalysisResultContract;
}
