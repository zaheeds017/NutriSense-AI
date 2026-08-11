# NutriSense_AI — AI-Powered Mobile & Web Application for Ingredient-Based Food Quality Analysis

NutriSense_AI is an AI-powered food quality analysis platform that allows consumers to scan product barcodes, capture ingredient/nutrition labels via OCR, or paste label text. It extracts structured nutrition data, evaluates ingredient toxicity, detects allergens against personal profiles, computes UK/EU FSA Traffic Light ratings, and calculates an unbiased 1–10 Health Score.

---

## 🌟 Core Features

1. **Barcode Scanning**: Scan product UPC/EAN barcodes via device camera with instant database lookup.
2. **Ingredient Label Scanning (OCR)**: Capture or upload food packaging photos; Gemini Multimodal Vision AI extracts serving size, macros, ingredients, and allergens.
3. **Structured Nutrition Extraction**: Standardizes serving info and 11 core macros (Calories, Total Fat, Saturated Fat, Trans Fat, Cholesterol, Sodium, Carbohydrates, Fiber, Sugars, Added Sugars, Protein) with strict `null` handling for unreadable/missing values.
4. **1–10 AI Health Rating**: Combines rules-based traffic light analysis with Gemini 3.6 Flash reasoning to rate products from 1 (unhealthy/ultra-processed) to 10 (whole food/nutrient dense).
5. **Allergen & Dietary Filtering**: Detects the 14 EU-major allergens + US allergens (Gluten, Milk, Peanuts, Tree Nuts, Soy, Eggs, Fish, Shellfish, Sesame, Mustard, Celery, Sulfites, Lupin, Molluscs) and flags conflicts with saved user profiles (Vegan, Vegetarian, Gluten-Free, Dairy-Free, Nut-Free, Keto, Low Sodium).
6. **Color-Coded Ingredient Highlighting**: Categorizes every ingredient into **Green** (Beneficial), **Amber** (Neutral), or **Red** (Harmful / Ultra-processed) with detailed explanations and category tags (e.g., Added Sugar, Artificial Color, Trans Fat, Preservative).
7. **Side-by-Side Product Comparison**: Compare 2 to 4 products side-by-side across scores, traffic light colors, macros, and allergen matrices.
8. **Healthier Alternatives**: Suggests higher-scoring products in the same category.
9. **Community Contributions**: Enables users to contribute new packaged foods with automatic "User-Added" badges.
10. **Scan History & Saved Favorites**: Local and server persistent scan logs with favorite toggles and search capabilities.

---

## 🚀 Quick Start & Running the Application

### 1. Installation
Install dependencies:
```bash
npm install
```

### 2. Run Development Server
Launch full-stack Express + Vite application on port 3000:
```bash
npm run dev
```
Open `http://localhost:3000` in your web browser.

### 3. Run Automated Unit Tests
Execute the unit tests for US FDA labels, EU format labels, and noisy OCR text parsing:
```bash
npm test
```

### 4. Build for Production
Bundle client and compile CommonJS backend server:
```bash
npm run build
npm start
```

---

## 🤖 AI / Mock Mode Toggle

NutriSense_AI includes a seamless fallback system that allows it to operate either fully online with Gemini AI or 100% offline with zero API keys.

- **Real AI Mode (Gemini 3.6 Flash)**: Set `GEMINI_API_KEY` in `.env` or system environment secrets. Gemini performs OCR, extracts structured JSON, and generates tailored nutritional advice.
- **Mock / Offline Mode (Rule-Based Engine)**: If `GEMINI_API_KEY` is omitted or unavailable, NutriSense_AI automatically switches to its offline food-science rule engine (`server/rulesEngine.ts`), computing UK/EU Traffic Light colors, ingredient health flags, and 1–10 scores offline.

---

## 📡 API Routes Overview

| Method | Endpoint | Description |
| text | text | text |
| `GET` | `/api/health` | Service health status check |
| `GET` | `/api/products` | Search database catalog (query params: `search`, `category`, `minScore`) |
| `GET` | `/api/products/barcode/:barcode` | Look up product by UPC/EAN barcode |
| `GET` | `/api/products/:id` | Get detailed product record |
| `POST` | `/api/products` | Add a new community product |
| `POST` | `/api/scan/barcode` | Barcode scan lookup endpoint |
| `POST` | `/api/scan/image` | Multimodal OCR scan for label image |
| `POST` | `/api/scan/text` | Text paste analysis endpoint |
| `GET` | `/api/alternatives/:productId` | Retrieve healthier alternatives |
| `POST` | `/api/compare` | Compare multiple products side-by-side |
| `GET` | `/api/history` | Retrieve user scan history log |
| `POST` | `/api/history/favorite` | Toggle favorite flag on a scan |
| `DELETE` | `/api/history` | Clear scan history log |
| `GET` | `/api/preferences` | Retrieve user allergen & dietary profile |
| `POST` | `/api/preferences` | Update user allergen & dietary profile |

---

## 🔬 Database Schema Architecture

- `Product`: Stores `ProductID`, `Name`, `Brand`, `Barcode`, `Category`, `ImageUrl`, `IsCommunity`, `AddedAt`.
- `Ingredient`: Stores `IngredientID`, `ProductID`, `Name`, `HealthStatus` (`good` | `neutral` | `harmful`), `CategoryTag`, `Reason`.
- `HealthAnalysis`: Stores `AnalysisID`, `ProductID`, `HealthScore`, `Comments`, `Recommendations`, `TrafficLight`.
- `UserPreferences`: Stores `UserID`, `Allergens`, `DietRestrictions`.
- `CommunityProducts`: Stores `ProductID`, `UserID`, `AddedAt`.
- `ScanHistory`: Stores `ScanID`, `ProductID`, `UserID`, `Timestamp`, `ScannedType`.

---

## ⚖️ Non-Medical Advice Notice
NutriSense_AI provides nutritional guidance based on public health standards (FDA, EU FSA, WHO, NOVA). It is not a substitute for clinical medical advice or medical nutrition therapy.
