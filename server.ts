import express from 'express';
import fs from 'fs';
import path from 'path';
import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
import { db } from './server/db.js';
import { analyzeTextWithAI, analyzeImageWithAI } from './server/geminiService.js';
import { fetchOpenFoodFactsProduct } from './server/openFoodFacts.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// --- API Routes ---

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 2. Get Products (Database Explorer)
app.get('/api/products', (req, res) => {
  try {
    const search = req.query.search as string | undefined;
    const category = req.query.category as string | undefined;
    const minScoreStr = req.query.minScore as string | undefined;
    const minScore = minScoreStr ? parseFloat(minScoreStr) : undefined;

    const products = db.getProducts(search, category, minScore);
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch products' });
  }
});

// 3. Get Product by Barcode
app.get('/api/products/barcode/:barcode', (req, res) => {
  try {
    const barcode = req.params.barcode;
    const product = db.getProductByBarcode(barcode);
    if (!product) {
      return res.status(404).json({ found: false, message: `Product with barcode ${barcode} not found in database.` });
    }
    res.json({ found: true, product });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to lookup barcode' });
  }
});

// 4. Get Product by ID
app.get('/api/products/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Add Community Product
app.post('/api/products', async (req, res) => {
  try {
    const { name, brand, barcode, category, ingredientsText, macros, imageUrl } = req.body;

    if (!name || !barcode) {
      return res.status(400).json({ error: 'Product Name and Barcode are required.' });
    }

    // Check if barcode already exists
    const existing = db.getProductByBarcode(barcode);
    if (existing) {
      return res.status(400).json({ error: `A product with barcode ${barcode} already exists (${existing.name}).` });
    }

    const userPrefs = db.getUserPreferences();
    const analysis = await analyzeTextWithAI(
      ingredientsText || 'Ingredients: Natural Flavors.',
      name,
      brand || 'User Contributed',
      userPrefs
    );

    analysis.product_name = name;
    analysis.brand = brand || 'User Contributed';
    analysis.barcode = barcode;
    analysis.category = category || 'General Food';
    analysis.is_community = true;

    const newProduct = db.addProduct({
      name,
      brand: brand || 'User Contributed',
      barcode,
      category: category || 'General Food',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500&auto=format&fit=crop',
      isCommunity: true,
      analysis,
    });

    res.status(201).json(newProduct);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to add community product' });
  }
});

// 6. Scan Text Endpoint
app.post('/api/scan/text', async (req, res) => {
  try {
    const { text, productName, brand } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text prompt or ingredient label text is required.' });
    }

    const userPrefs = db.getUserPreferences();
    const analysis = await analyzeTextWithAI(text, productName, brand, userPrefs);

    // Record in history
    db.addScanHistory({
      productName: analysis.product_name || productName || 'Text Scan Product',
      brand: analysis.brand || brand || 'Unknown Brand',
      scanType: 'text',
      healthScore: analysis.health?.score ?? 5,
      analysis,
    });

    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to analyze label text' });
  }
});

// 7. Scan Image OCR Endpoint
app.post('/api/scan/image', async (req, res) => {
  try {
    const { imageBase64, mimeType, productName, brand } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'Base64 image content is required.' });
    }

    const userPrefs = db.getUserPreferences();
    const analysis = await analyzeImageWithAI(
      imageBase64,
      mimeType || 'image/jpeg',
      productName,
      brand,
      userPrefs
    );

    db.addScanHistory({
      productName: analysis.product_name || productName || 'Scanned Label Product',
      brand: analysis.brand || brand || 'Scanned Brand',
      scanType: 'ocr',
      healthScore: analysis.health?.score ?? 5,
      analysis,
    });

    res.json(analysis);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to perform OCR image analysis' });
  }
});

// 8. Scan Barcode Endpoint
app.post('/api/scan/barcode', async (req, res) => {
  try {
    const { barcode } = req.body;
    if (!barcode) {
      return res.status(400).json({ error: 'Barcode parameter is required.' });
    }

    // 1. Check local database first
    const product = db.getProductByBarcode(barcode);
    if (product) {
      db.addScanHistory({
        productName: product.name,
        brand: product.brand,
        barcode: product.barcode,
        scanType: 'barcode',
        healthScore: product.analysis.health?.score ?? 5,
        analysis: product.analysis,
      });
      return res.json({ found: true, product, analysis: product.analysis });
    }

    // 2. Fetch live product data from Open Food Facts API (rezahedi/NutriSense_AI integration)
    const userPrefs = db.getUserPreferences();
    const offAnalysis = await fetchOpenFoodFactsProduct(barcode, userPrefs);

    if (offAnalysis) {
      // Cache fetched product in database
      const cachedProduct = db.addProduct({
        name: offAnalysis.product_name || 'Scanned Food Product',
        brand: offAnalysis.brand || 'Open Food Facts Item',
        barcode: barcode.trim(),
        category: offAnalysis.category || 'General Food',
        imageUrl: offAnalysis.image_url,
        isCommunity: false,
        analysis: offAnalysis,
      });

      db.addScanHistory({
        productName: cachedProduct.name,
        brand: cachedProduct.brand,
        barcode: cachedProduct.barcode,
        scanType: 'barcode',
        healthScore: cachedProduct.analysis.health?.score ?? 5,
        analysis: cachedProduct.analysis,
      });

      return res.json({ found: true, product: cachedProduct, analysis: cachedProduct.analysis, source: 'open_food_facts' });
    }

    res.json({
      found: false,
      barcode,
      message: `Barcode ${barcode} not found in database or Open Food Facts. Proceed to scan ingredient label or add product manually.`,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get Healthier Alternatives
app.get('/api/alternatives/:productId', (req, res) => {
  try {
    const alternatives = db.getAlternatives(req.params.productId);
    res.json(alternatives);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Compare Products Side-by-Side
app.post('/api/compare', (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ error: 'Provide array of productIds to compare.' });
    }

    const products = productIds.map(id => db.getProductById(id)).filter(Boolean) as any[];
    res.json(products);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Scan History Routes
app.get('/api/history', (req, res) => {
  res.json(db.getScanHistory());
});

app.post('/api/history/favorite', (req, res) => {
  const { scanId } = req.body;
  if (!scanId) return res.status(400).json({ error: 'scanId is required' });
  const isFavorite = db.toggleFavoriteHistory(scanId);
  res.json({ success: true, isFavorite });
});

app.delete('/api/history', (req, res) => {
  db.clearScanHistory();
  res.json({ success: true, message: 'Scan history cleared' });
});

// 12. User Preferences Routes
app.get('/api/preferences', (req, res) => {
  res.json(db.getUserPreferences());
});

app.post('/api/preferences', (req, res) => {
  const updated = db.updateUserPreferences(req.body);
  res.json(updated);
});

// --- Server Lifecycle & Vite Setup ---
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<h1>NutriSense_AI API is running.</h1><p>Static frontend is served separately.</p>');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NutriSense_AI Server running on http://localhost:${PORT}`);
  });
}

// Run the HTTP server only when executed directly (e.g. `node dist/server.cjs`).
// When imported by a Vercel serverless function (api/index.ts), export the app instead.
function isDirectRunEntry(): boolean {
  if (typeof require !== 'undefined') {
    return require.main === module;
  }
  if (process.argv[1]) {
    return import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
  }
  return false;
}

if (isDirectRunEntry()) {
  startServer();
}

export default app;
