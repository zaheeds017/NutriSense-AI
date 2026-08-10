import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import CameraScanner from './components/CameraScanner';
import ImageUploader from './components/ImageUploader';
import PresetGallery from './components/PresetGallery';
import NutritionDashboard from './components/NutritionDashboard';
import HealthScorePanel from './components/HealthScorePanel';
import SchemaJSONViewer from './components/SchemaJSONViewer';
import ScanHistory from './components/ScanHistory';
import ApiSettingsModal from './components/ApiSettingsModal';
import HumanFaceAlertModal from './components/HumanFaceAlertModal';
import BarcodeScanner from './components/BarcodeScanner';
import TextScanner from './components/TextScanner';
import DatabaseExplorer from './components/DatabaseExplorer';
import ProductCompare from './components/ProductCompare';
import UserProfileModal from './components/UserProfileModal';
import CommunityAddModal from './components/CommunityAddModal';

import { parseNutritionLabel, parseBarcode } from './utils/ocrEngine';
import { SAMPLE_FOOD_PACKAGES } from './utils/sampleDatabase';
import { SOUNDS } from './utils/soundUtils';
import {
  getAllProducts,
  getUserPreferences,
  updateUserPreferences,
  addProduct,
  getAlternatives,
} from './utils/productDatabase';
import confetti from 'canvas-confetti';
import { Scan } from 'lucide-react';

const MAX_COMPARE = 3;

function ScanResultArea({ scanResult, userPrefs, alternatives, onAddToCompare, isInCompare, onOpenJsonView }) {
  if (!scanResult || !scanResult.data) return null;
  return (
    <div className="space-y-8">
      <NutritionDashboard scanResult={scanResult} onOpenJsonView={onOpenJsonView} />
      <HealthScorePanel
        scanResult={scanResult}
        userPrefs={userPrefs}
        alternatives={alternatives}
        onAddToCompare={onAddToCompare}
        isInCompare={isInCompare}
      />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner');
  const [currentScanResult, setCurrentScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCommunityModalOpen, setIsCommunityModalOpen] = useState(false);
  const [userPrefs, setUserPrefs] = useState({ allergens: [], dietRestrictions: [] });
  const [compareList, setCompareList] = useState([]);
  const [dbVersion, setDbVersion] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    setProducts(getAllProducts());
  }, [dbVersion]);

  // Save history to localStorage
  const saveScanToHistory = useCallback((scanItem) => {
    const newItem = {
      ...scanItem,
      timestamp: Date.now()
    };
    setScanHistory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('nutrisense_ai_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save scan history:', err);
      }
      return updated;
    });
  }, []);

  const handleClearHistory = () => {
    setScanHistory([]);
    try {
      localStorage.removeItem('nutrisense_ai_history');
    } catch {
      // Ignore storage errors
    }
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    try {
      localStorage.setItem('nutrisense_ai_gemini_key', key);
    } catch {
      // Ignore storage errors
    }
  };

  // Process label extraction (camera, upload, presets, text)
  const handleProcessScan = useCallback(async (scanOptions, isUserInitiated = true) => {
    setIsProcessing(true);
    if (isUserInitiated) SOUNDS.scanStart();
    try {
      const result = await parseNutritionLabel({
        ...scanOptions,
        apiKey,
        userPrefs,
      });

      if (result.isHumanFace) {
        SOUNDS.faceDetected();
        setIsFaceModalOpen(true);
        return;
      }

      setCurrentScanResult(result);
      if (!isUserInitiated) return;

      if (result.success) {
        SOUNDS.scanSuccess();
        saveScanToHistory(result);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      } else if (result.notFound) {
        SOUNDS.scanError();
      }
    } catch (err) {
      console.error('Scan processing error:', err);
      if (isUserInitiated) SOUNDS.scanError();
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, userPrefs, saveScanToHistory]);

  // Barcode pipeline
  const handleBarcodeScanned = useCallback(async (barcode) => {
    setIsProcessing(true);
    SOUNDS.scanStart();
    try {
      const result = await parseBarcode(barcode, userPrefs);
      setCurrentScanResult(result);
      if (result.success) {
        SOUNDS.scanSuccess();
        saveScanToHistory(result);
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
        setActiveTab('dashboard');
      } else {
        SOUNDS.scanError();
      }
    } catch (err) {
      console.error('Barcode scan error:', err);
      SOUNDS.scanError();
    } finally {
      setIsProcessing(false);
    }
  }, [userPrefs, saveScanToHistory]);

  // Text paste pipeline
  const handleTextScanned = useCallback(async ({ rawText, productName, brand }) => {
    setIsProcessing(true);
    SOUNDS.scanStart();
    try {
      const result = await parseNutritionLabel({ rawText, productName, brand, userPrefs });
      if (result.isHumanFace) {
        SOUNDS.faceDetected();
        setIsFaceModalOpen(true);
        return;
      }
      setCurrentScanResult(result);
      if (result.success) {
        SOUNDS.scanSuccess();
        saveScanToHistory(result);
        confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
        setActiveTab('dashboard');
      } else {
        SOUNDS.scanError();
      }
    } catch (err) {
      console.error('Text scan error:', err);
      SOUNDS.scanError();
    } finally {
      setIsProcessing(false);
    }
  }, [userPrefs, saveScanToHistory]);

  // Stable callback for real-time face auto-detection from the live scanner
  const handleFaceAutoDetected = useCallback(() => {
    setIsFaceModalOpen(true);
  }, []);

  // Preset quick click
  const handleSelectPreset = useCallback((sampleId, isUserInitiated = true) => {
    handleProcessScan({ sampleId }, isUserInitiated);
    if (isUserInitiated) setActiveTab('dashboard');
  }, [handleProcessScan]);

  // Camera or upload snap
  const handleCaptureLabel = (data) => {
    handleProcessScan(data, true);
    setActiveTab('dashboard');
  };

  // Profile management
  const handleSavePrefs = (prefs) => {
    const updated = updateUserPreferences(prefs);
    setUserPrefs(updated);
  };

  // Comparison tray
  const handleAddToCompare = useCallback((analysis) => {
    if (!analysis) return;
    const name = analysis.product_name || analysis.name || 'Product';
    setCompareList((prev) => {
      if (prev.some((p) => (p.product_name || p.name) === name)) return prev;
      if (prev.length >= MAX_COMPARE) {
        alert(`Comparison tray is full (${MAX_COMPARE} products max). Remove one first.`);
        return prev;
      }
      return [...prev, { ...analysis, _compareId: `${name}-${Date.now()}` }];
    });
  }, []);

  const handleRemoveFromCompare = (compareId) => {
    setCompareList((prev) => prev.filter((p) => (p._compareId || (p.product_name || p.name)) !== compareId));
  };

  const handleClearCompare = () => setCompareList([]);

  // Healthier alternatives for the current scan result
  const currentAlternatives = useMemo(() => {
    const name = currentScanResult?.data?.product_name || currentScanResult?.sampleMeta?.name;
    if (!name) return [];
    const target = getAllProducts().find((p) => p.name.toLowerCase() === name.toLowerCase());
    return target ? getAlternatives(target.id) : [];
  }, [currentScanResult]);

  const currentIsInCompare = useMemo(() => {
    const name = currentScanResult?.data?.product_name || currentScanResult?.sampleMeta?.name;
    return Boolean(name && compareList.some((p) => (p.product_name || p.name) === name));
  }, [currentScanResult, compareList]);

  // Load local storage initial state and default Doritos preset on startup
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('nutrisense_ai_history');
      if (savedHistory) setScanHistory(JSON.parse(savedHistory));

      const savedKey = localStorage.getItem('nutrisense_ai_gemini_key');
      if (savedKey) {
        setApiKey(savedKey);
      } else if (import.meta.env.VITE_GEMINI_API_KEY) {
        setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    setUserPrefs(getUserPreferences());

    // Default load Doritos preset on startup for immediate demonstration
    handleSelectPreset(SAMPLE_FOOD_PACKAGES[0].id, false);
  }, [handleSelectPreset]);

  const openFromDatabase = (product) => {
    setCurrentScanResult({
      success: true,
      isHumanFace: false,
      source: product.isCommunity ? 'Community Product Catalog' : 'Product Catalog',
      rawText: '',
      data: product.analysis,
      sampleMeta: null,
      productRecord: product,
      scanType: 'database',
    });
    setActiveTab('dashboard');
  };

  const handleCommunitySave = (payload) => {
    addProduct(payload);
    setDbVersion((v) => v + 1);
    SOUNDS.scanSuccess();
    confetti({ particleCount: 40, spread: 55, origin: { y: 0.8 } });
  };

  const hasProfile = userPrefs.allergens.length > 0 || userPrefs.dietRestrictions.length > 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 flex flex-col justify-between">

      <div>
        {/* Navigation Header */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenApiModal={() => setIsApiModalOpen(true)}
          hasApiKey={Boolean(apiKey)}
          scanCount={scanHistory.length}
          compareCount={compareList.length}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          hasProfile={hasProfile}
        />

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Scan className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Analyzing Food Product...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Parsing label data and running the nutritional health rules engine (score, traffic lights, allergens, diet flags).
            </p>
          </div>
        )}

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">

          {activeTab === 'scanner' && (
            <div className="space-y-10">
              <CameraScanner
                onCaptureLabel={handleCaptureLabel}
                onSelectPreset={handleSelectPreset}
                onFaceAutoDetected={handleFaceAutoDetected}
              />

              {currentScanResult && (
                <ScanResultArea
                  scanResult={currentScanResult}
                  userPrefs={userPrefs}
                  alternatives={currentAlternatives}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={currentIsInCompare}
                  onOpenJsonView={() => setActiveTab('json')}
                />
              )}
            </div>
          )}

          {activeTab === 'barcode' && (
            <div className="space-y-10">
              <BarcodeScanner
                onBarcodeScanned={handleBarcodeScanned}
                isProcessing={isProcessing}
                lastResult={currentScanResult}
              />

              {currentScanResult && currentScanResult.success && (
                <ScanResultArea
                  scanResult={currentScanResult}
                  userPrefs={userPrefs}
                  alternatives={currentAlternatives}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={currentIsInCompare}
                  onOpenJsonView={() => setActiveTab('json')}
                />
              )}
            </div>
          )}

          {activeTab === 'text' && (
            <div className="space-y-10">
              <TextScanner onTextScanned={handleTextScanned} isProcessing={isProcessing} />

              {currentScanResult && currentScanResult.success && (
                <ScanResultArea
                  scanResult={currentScanResult}
                  userPrefs={userPrefs}
                  alternatives={currentAlternatives}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={currentIsInCompare}
                  onOpenJsonView={() => setActiveTab('json')}
                />
              )}
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-10">
              <ImageUploader
                onCaptureLabel={handleCaptureLabel}
                onSelectPreset={handleSelectPreset}
              />

              {currentScanResult && (
                <ScanResultArea
                  scanResult={currentScanResult}
                  userPrefs={userPrefs}
                  alternatives={currentAlternatives}
                  onAddToCompare={handleAddToCompare}
                  isInCompare={currentIsInCompare}
                  onOpenJsonView={() => setActiveTab('json')}
                />
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <PresetGallery onSelectPreset={handleSelectPreset} />
          )}

          {activeTab === 'database' && (
            <DatabaseExplorer
              products={products}
              onOpenProduct={openFromDatabase}
              onAddCommunity={() => setIsCommunityModalOpen(true)}
            />
          )}

          {activeTab === 'compare' && (
            <ProductCompare
              compareList={compareList}
              onRemoveFromCompare={handleRemoveFromCompare}
              onClearCompare={handleClearCompare}
            />
          )}

          {activeTab === 'dashboard' && (
            <ScanResultArea
              scanResult={currentScanResult}
              userPrefs={userPrefs}
              alternatives={currentAlternatives}
              onAddToCompare={handleAddToCompare}
              isInCompare={currentIsInCompare}
              onOpenJsonView={() => setActiveTab('json')}
            />
          )}

          {activeTab === 'json' && (
            <SchemaJSONViewer scanResult={currentScanResult} />
          )}

          {activeTab === 'history' && (
            <ScanHistory
              scanHistory={scanHistory}
              onClearHistory={handleClearHistory}
              onSelectScan={(item) => {
                setCurrentScanResult(item);
                setActiveTab('dashboard');
              }}
            />
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Scan className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">NutriSense_AI Computer Vision & Nutrition Intelligence Engine</span>
          </div>
          <span>Conforms strictly to FDA / EU Standard Nutritional Measurement Schemas</span>
        </div>
      </footer>

      {/* Modals */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <HumanFaceAlertModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onTryPreset={() => handleSelectPreset(SAMPLE_FOOD_PACKAGES[0].id)}
      />

      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSavePrefs}
        prefs={userPrefs}
      />

      <CommunityAddModal
        isOpen={isCommunityModalOpen}
        onClose={() => setIsCommunityModalOpen(false)}
        onSave={handleCommunitySave}
      />

    </div>
  );
}
