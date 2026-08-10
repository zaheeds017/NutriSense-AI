# NutriSense_AI - Packaged Food Nutrition Scanner & AI Vision

NutriSense_AI is a client-side web app that scans packaged food nutrition labels and ingredients lists, then extracts, validates, and visualizes the data against FDA/EU-standard nutritional schemas.

It combines real-time camera capture, client-side OCR (Tesseract.js), optional Google Gemini multimodal vision, barcode lookup, and a human-face detection filter that blocks non-food scans. Every scan runs through a rules engine that produces a 1-10 health score, UK/EU traffic lights, color-coded ingredient flags, and personalized allergen/diet warnings.

## Features

### Scanning
- **Live Camera Scanner** - Real-time viewfinder with laser HUD, corner targeting guides, flash/high-contrast toggles, and automatic human face detection (native `FaceDetector` API with a multi-model skin-tone canvas fallback).
- **Barcode Scanner** - Scan UPC/EAN/QR codes with the camera, upload a barcode image from a local file (drag-and-drop), or type the code manually. Looks up products in the built-in catalog first, then falls back to a live Open Food Facts query.
- **Label Text Scanner** - Paste or type an ingredients & Nutrition Facts list (with clipboard button and sample presets) for instant analysis.
- **Label Photo Upload** - Drag-and-drop or browse for nutrition label images (JPEG, PNG, WEBP).
- **Client-Side OCR** - Tesseract.js runs entirely in the browser; a regex rule engine parses Nutrition Facts text into the target schema (no server required).
- **Gemini Multimodal Vision (optional)** - Add a free Google Gemini API key to enable high-precision LLM vision extraction for complex or curved labels. Falls back to the client OCR engine automatically.
- **Human Face Detection Filter** - Blocks scans of people; alerts the user to present a packaged food item instead.

### Health Intelligence
- **NutriSense_AI Health Score (1-10)** - Rule-based engine scoring ingredient processing levels and macro balance, with tiered quality labels (Excellent / Good / Moderate / Poor / Unhealthy).
- **UK/EU FSA Traffic Lights** - Per-serving red/amber/green breakdown for fat, saturated fat, sugars, and sodium.
- **Color-Coded Ingredients** - Every ingredient is flagged green (beneficial), amber (moderate), or red (harmful / ultra-processed) with expandable reasons and filters.
- **Dietary Compatibility** - Auto-checks Vegan, Gluten-Free, Nut-Free, Dairy-Free, Keto, and Low-Sodium suitability.
- **Personal Profile** - Set your allergens and diet restrictions; scans show red conflict banners and score penalties for products that don't fit your profile.
- **Healthier Alternatives** - Suggests higher-scoring products in the same category for anything you scan.
- **Nutrition Dashboard** - Nutri-Score rating, NOVA food processing group, % Daily Value per macro, macro calorie balance chart, allergen alerts, and additive watchlist flags.

### Catalog & Tools
- **Product Database Explorer** - Searchable/filterable catalog of seeded products plus community-contributed items (by name, brand, barcode, category, and minimum health score).
- **Community Adds** - Contribute a product (name, brand, barcode, ingredients, nutrition facts) that gets analyzed and cached locally.
- **Side-by-Side Comparison** - Compare up to 3 products on health score and every macro, with best-value highlighting per metric.
- **Schema-Validated JSON Output** - Every scan is normalized to an exact FDA/EU schema; view, copy, or download the JSON.
- **Scan History** - Local browser history with cumulative calorie/sodium/protein tracking, average health score, type filters (camera/barcode/text/upload/preset), search, and CSV export.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS 4
- Tesseract.js (client OCR)
- html5-qrcode / ZXing (camera + image barcode decoding)
- Google Gemini API (optional LLM vision)
- Open Food Facts public API (live barcode lookup)
- lucide-react icons, canvas-confetti

## Getting Started

```bash
npm install
npm run dev
```

Open the local dev server URL printed in the terminal.

### Build for production

```bash
npm run build
npm run preview
```

### Lint

```bash
npm run lint
```

## Project Structure

```
src/
  components/           React UI (scanner, barcode, text, dashboard, database, compare, modals, etc.)
  utils/
    ocrEngine.js        OCR + Gemini vision + regex parsing + barcode pipeline
    rulesEngine.js      1-10 health score, traffic lights, ingredient flags, dietary & personal conflicts
    faceDetector.js     Human face detection (native API + multi-model canvas fallback)
    healthAnalyzer.js   Nutri-Score, NOVA, %DV, allergen & additive analysis
    jsonSchemaValidator.js FDA/EU schema validation & unit normalization
    sampleDatabase.js   Built-in preset sample packages
    productDatabase.js  Client-side product catalog & user profile store (localStorage)
    seedProducts.js     Seeded product catalog with authentic UPC/EAN barcodes
    openFoodFacts.js    Live Open Food Facts barcode lookup (CORS-enabled)
    soundUtils.js       Scanner feedback sounds
```

## Data Flow

1. Capture input: camera snapshot, barcode (camera/image/manual), pasted label text, uploaded label, or preset.
2. Barcodes are matched against the local catalog, then the Open Food Facts live API.
3. A human-face check runs on camera input; if a face is detected, the scan is rejected.
4. If a Gemini API key is set, the image is sent for multimodal extraction; otherwise Tesseract OCR + regex parsing extracts label text.
5. All output is validated/normalized to the target schema, enriched with the health rules engine (score, traffic lights, flags, personal conflicts), and rendered in the dashboard.
6. Scans are saved to local history and can be compared side-by-side or explored in the product database.

## Deployment

Deployed on Vercel with the Vite framework preset (see `vercel.json`):

```bash
vercel --prod
```

Production URL: https://nutri-sense-ai-iota.vercel.app
