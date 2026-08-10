# NutriPulse - Packaged Food Nutrition Scanner & AI Vision

NutriPulse is a client-side web app that scans packaged food nutrition labels and ingredients lists, then extracts, validates, and visualizes the data against FDA/EU-standard nutritional schemas.

It combines real-time camera capture, client-side OCR (Tesseract.js), optional Google Gemini multimodal vision, and a human-face detection filter that blocks non-food scans.

## Features

- **Live Camera Scanner** - Real-time viewfinder with laser HUD, corner targeting guides, flash/high-contrast toggles, and automatic human face detection (native `FaceDetector` API with canvas skin-tone fallback).
- **Label Photo Upload** - Drag-and-drop or browse for nutrition label images (JPEG, PNG, WEBP).
- **Client-Side OCR** - Tesseract.js runs entirely in the browser; a regex rule engine parses Nutrition Facts text into the target schema (no server required).
- **Gemini Multimodal Vision (optional)** - Add a free Google Gemini API key to enable high-precision LLM vision extraction for complex or curved labels. Falls back to the client OCR engine automatically.
- **Human Face Detection Filter** - Blocks scans of people; alerts the user to present a packaged food item instead.
- **Sample Package Library** - Real-world presets (Doritos, Oreo, Chobani, Quest bar, Shin Ramyun) to instantly demo scanning and JSON extraction.
- **Nutrition Dashboard** - Nutri-Score rating, NOVA food processing group, % Daily Value per macro, macro calorie balance chart, allergen alerts, and additive watchlist flags.
- **Schema-Validated JSON Output** - Every scan is normalized to an exact FDA/EU schema; view, copy, or download the JSON.
- **Scan History** - Local browser history with cumulative calorie/sodium/protein tracking, search, and CSV export.

## Tech Stack

- React 19 + Vite 8
- Tailwind CSS 4
- Tesseract.js (client OCR)
- Google Gemini API (optional LLM vision)
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
  components/         React UI components (scanner, uploader, dashboard, modals, etc.)
  utils/
    ocrEngine.js      OCR + Gemini vision + regex parsing pipeline
    faceDetector.js   Human face detection (native API + canvas fallback)
    healthAnalyzer.js Nutri-Score, NOVA, %DV, allergen & additive analysis
    jsonSchemaValidator.js FDA/EU schema validation & unit normalization
    sampleDatabase.js Built-in preset sample packages
```

## Data Flow

1. Capture an image (camera snapshot, upload, or preset).
2. A human-face check runs; if a face is detected, the scan is rejected.
3. If a Gemini API key is set, the image is sent for multimodal extraction.
4. Otherwise Tesseract OCR extracts label text, then the regex rule engine parses it.
5. All output is validated/normalized to the target schema and rendered in the dashboard.

## Deployment

Deployed on Vercel with the Vite framework preset (see `vercel.json`):

```bash
vercel --prod
```

Production URL: https://nutri-sense-ai-iota.vercel.app
