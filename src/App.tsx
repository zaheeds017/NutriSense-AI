import React, { useEffect, useState } from 'react';
import {
  AnalysisResultContract,
  UserPreferences,
  ProductRecord,
  ScanHistoryRecord,
  AlternativeProduct,
} from './types';
import { Navbar } from './components/Navbar';
import { BarcodeScanner } from './components/BarcodeScanner';
import { LabelScanner } from './components/LabelScanner';
import { TextScanner } from './components/TextScanner';
import { AnalysisResultView } from './components/AnalysisResultView';
import { ProductCompare } from './components/ProductCompare';
import { UserProfileModal } from './components/UserProfileModal';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { CommunityAddModal } from './components/CommunityAddModal';
import { HistoryView } from './components/HistoryView';
import { Barcode, Camera, AlignLeft, AlertCircle, RefreshCw, Sparkles } from 'lucide-react';
import { playSuccessChime } from './lib/sound';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'scan' | 'explore' | 'compare' | 'history' | 'profile' | 'contribute'
  >('scan');
  const [scanMode, setScanMode] = useState<'barcode' | 'image' | 'text'>('barcode');

  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisResultContract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);

  const [userPrefs, setUserPrefs] = useState<UserPreferences>({
    allergens: [],
    dietRestrictions: [],
  });

  const [compareList, setCompareList] = useState<AnalysisResultContract[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [history, setHistory] = useState<ScanHistoryRecord[]>([]);
  const [alternatives, setAlternatives] = useState<AlternativeProduct[]>([]);

  // Initialize data on load
  useEffect(() => {
    fetchPreferences();
    fetchProducts();
    fetchHistory();
  }, []);

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences');
      if (res.ok) {
        const data = await res.json();
        setUserPrefs(data);
      }
    } catch (e) {
      console.error('Failed to fetch preferences', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (e) {
      console.error('Failed to fetch products', e);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.error('Failed to fetch scan history', e);
    }
  };

  const fetchAlternativesForProduct = async (productId?: string) => {
    if (!productId) {
      setAlternatives([]);
      return;
    }
    try {
      const res = await fetch(`/api/alternatives/${productId}`);
      if (res.ok) {
        const data = await res.json();
        setAlternatives(data);
      }
    } catch (e) {
      console.error('Failed to fetch alternatives', e);
    }
  };

  // --- Handlers ---
  const handleBarcodeScan = async (barcode: string) => {
    setIsLoading(true);
    setScanError(null);
    try {
      const res = await fetch('/api/scan/barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode }),
      });
      const data = await res.json();

      if (data.found && data.analysis) {
        setCurrentAnalysis(data.analysis);
        playSuccessChime();
        if (data.product?.id) {
          fetchAlternativesForProduct(data.product.id);
        }
        fetchHistory();
      } else {
        setScanError(
          `Barcode ${barcode} is not in our database. You can capture its ingredients label or add it via "Add Food".`
        );
      }
    } catch (err: any) {
      setScanError(err.message || 'Error processing barcode lookup.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageScan = async (
    imageBase64: string,
    mimeType: string,
    productName?: string,
    brand?: string
  ) => {
    setIsLoading(true);
    setScanError(null);
    try {
      const res = await fetch('/api/scan/image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType, productName, brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to scan label image');

      setCurrentAnalysis(data);
      playSuccessChime();
      fetchHistory();
    } catch (err: any) {
      setScanError(err.message || 'Error processing image scan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextScan = async (text: string, productName?: string, brand?: string) => {
    setIsLoading(true);
    setScanError(null);
    try {
      const res = await fetch('/api/scan/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, productName, brand }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to analyze label text');

      setCurrentAnalysis(data);
      playSuccessChime();
      fetchHistory();
    } catch (err: any) {
      setScanError(err.message || 'Error processing text scan');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    try {
      const res = await fetch('/api/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs),
      });
      if (res.ok) {
        const updated = await res.json();
        setUserPrefs(updated);
      }
    } catch (e) {
      console.error('Failed to save preferences', e);
    }
  };

  const handleAddToCompare = (analysis: AnalysisResultContract) => {
    if (compareList.length >= 4) {
      alert('Comparison limit reached (max 4 products). Remove one to add more.');
      return;
    }
    const already = compareList.some(
      (item) => item.product_name === analysis.product_name && item.barcode === analysis.barcode
    );
    if (!already) {
      setCompareList((prev) => [...prev, analysis]);
    }
    setActiveTab('compare');
  };

  const handleRemoveFromCompare = (index: number) => {
    setCompareList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleFavoriteHistory = async (scanId: string) => {
    try {
      await fetch('/api/history/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanId }),
      });
      fetchHistory();
    } catch (e) {
      console.error('Failed to toggle favorite', e);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetch('/api/history', { method: 'DELETE' });
      setHistory([]);
    } catch (e) {
      console.error('Failed to clear history', e);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      {/* Top App Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'scan') {
            // Keep current view or mode
          }
        }}
        userPrefs={userPrefs}
        compareCount={compareList.length}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* TAB 1: SCANNER & ANALYSIS OUTCOME */}
        {activeTab === 'scan' && (
          <div className="space-y-6">
            {!currentAnalysis ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Hero Introduction */}
                <div className="text-center space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                    <Sparkles className="w-3.5 h-3.5" />
                    AI Food Quality & Ingredient Analyzer
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                    Know What's Inside Your Packaged Food
                  </h1>
                  <p className="text-sm text-slate-600 max-w-xl mx-auto">
                    Scan any UPC barcode, upload a photo of the ingredient list, or paste text to receive a 1–10 AI health score, allergen flags, and cleaner alternatives.
                  </p>
                </div>

                {/* Scan Input Selector Tabs */}
                <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
                  <button
                    onClick={() => setScanMode('barcode')}
                    id="mode-tab-barcode"
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      scanMode === 'barcode'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Barcode className="w-4 h-4" />
                    <span>Barcode Scan</span>
                  </button>

                  <button
                    onClick={() => setScanMode('image')}
                    id="mode-tab-image"
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      scanMode === 'image'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Camera className="w-4 h-4" />
                    <span>OCR Label Scan</span>
                  </button>

                  <button
                    onClick={() => setScanMode('text')}
                    id="mode-tab-text"
                    className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      scanMode === 'text'
                        ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <AlignLeft className="w-4 h-4" />
                    <span>Paste Text</span>
                  </button>
                </div>

                {scanError && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-start gap-3 text-xs shadow-xs">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">Scan Lookup Notice</p>
                      <p>{scanError}</p>
                      <button
                        onClick={() => setScanMode('image')}
                        className="mt-1 font-bold underline text-rose-700 hover:text-rose-900"
                      >
                        Switch to Label OCR Scan
                      </button>
                    </div>
                  </div>
                )}

                {/* Sub-mode Panels */}
                {scanMode === 'barcode' && (
                  <BarcodeScanner onScanSuccess={handleBarcodeScan} isLoading={isLoading} />
                )}

                {scanMode === 'image' && (
                  <LabelScanner onScanImage={handleImageScan} isLoading={isLoading} />
                )}

                {scanMode === 'text' && (
                  <TextScanner onAnalyzeText={handleTextScan} isLoading={isLoading} />
                )}
              </div>
            ) : (
              <AnalysisResultView
                analysis={currentAnalysis}
                userPrefs={userPrefs}
                alternatives={alternatives}
                onAddToCompare={handleAddToCompare}
                onRescan={() => {
                  setCurrentAnalysis(null);
                  setScanError(null);
                }}
                isInCompare={compareList.some(
                  (c) => c.product_name === currentAnalysis.product_name
                )}
              />
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS DATABASE CATALOG */}
        {activeTab === 'explore' && (
          <DatabaseExplorer
            products={products}
            onSelectProduct={(analysis) => {
              setCurrentAnalysis(analysis);
              setActiveTab('scan');
            }}
            onAddToCompare={handleAddToCompare}
          />
        )}

        {/* TAB 3: PRODUCT COMPARISON MATRIX */}
        {activeTab === 'compare' && (
          <ProductCompare
            compareList={compareList}
            onRemoveFromCompare={handleRemoveFromCompare}
            onClearCompare={() => setCompareList([])}
          />
        )}

        {/* TAB 4: SCAN HISTORY */}
        {activeTab === 'history' && (
          <HistoryView
            history={history}
            onSelectScan={(analysis) => {
              setCurrentAnalysis(analysis);
              setActiveTab('scan');
            }}
            onToggleFavorite={handleToggleFavoriteHistory}
            onClearHistory={handleClearHistory}
          />
        )}

        {/* TAB 5: DIET & ALLERGEN PROFILE */}
        {activeTab === 'profile' && (
          <UserProfileModal userPrefs={userPrefs} onSavePrefs={handleSavePreferences} />
        )}

        {/* TAB 6: COMMUNITY ADD FOOD */}
        {activeTab === 'contribute' && (
          <CommunityAddModal
            onAddProductSuccess={(newAnalysis) => {
              fetchProducts();
              fetchHistory();
              setCurrentAnalysis(newAnalysis);
              setActiveTab('scan');
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-medium text-slate-700">
            NutriSense-AI © 2025–2026 — AI-Powered Food Quality Analysis System
          </p>
          <div className="flex items-center gap-4 text-slate-500">
            <span>FDA & EU FSA Standards</span>
            <span>NOVA Food Classification</span>
            <span>14 Major Allergens</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
