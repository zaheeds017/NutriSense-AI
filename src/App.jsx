import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import CameraScanner from './components/CameraScanner';
import ImageUploader from './components/ImageUploader';
import PresetGallery from './components/PresetGallery';
import NutritionDashboard from './components/NutritionDashboard';
import SchemaJSONViewer from './components/SchemaJSONViewer';
import ScanHistory from './components/ScanHistory';
import ApiSettingsModal from './components/ApiSettingsModal';
import HumanFaceAlertModal from './components/HumanFaceAlertModal';

import { parseNutritionLabel } from './utils/ocrEngine';
import { SAMPLE_FOOD_PACKAGES } from './utils/sampleDatabase';
import confetti from 'canvas-confetti';
import { Scan } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('scanner'); // 'scanner' | 'upload' | 'presets' | 'dashboard' | 'json' | 'history'
  const [currentScanResult, setCurrentScanResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scanHistory, setScanHistory] = useState([]);
  const [apiKey, setApiKey] = useState('');
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isFaceModalOpen, setIsFaceModalOpen] = useState(false);

  // Load local storage initial state
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('nutripulse_history');
      if (savedHistory) setScanHistory(JSON.parse(savedHistory));

      const savedKey = localStorage.getItem('nutripulse_gemini_key');
      if (savedKey) setApiKey(savedKey);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Default load Doritos preset on startup for immediate demonstration
    handleSelectPreset(SAMPLE_FOOD_PACKAGES[0].id, false);
  }, [handleSelectPreset]);

  // Save history to localStorage
  const saveScanToHistory = useCallback((scanItem) => {
    const newItem = {
      ...scanItem,
      timestamp: Date.now()
    };
    setScanHistory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('nutripulse_history', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save scan history:', err);
      }
      return updated;
    });
  }, []);

  const handleClearHistory = () => {
    setScanHistory([]);
    try {
      localStorage.removeItem('nutripulse_history');
    } catch {
      // Ignore storage errors
    }
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    try {
      localStorage.setItem('nutripulse_gemini_key', key);
    } catch {
      // Ignore storage errors
    }
  };

  // Process label extraction
  const handleProcessScan = useCallback(async (scanOptions, isUserInitiated = true) => {
    setIsProcessing(true);
    try {
      const result = await parseNutritionLabel({
        ...scanOptions,
        apiKey
      });

      // Check if Human Face was detected
      if (result.isHumanFace) {
        setIsFaceModalOpen(true);
        return;
      }

      setCurrentScanResult(result);
      if (isUserInitiated) {
        saveScanToHistory(result);
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 }
        });
      }
    } catch (err) {
      console.error('Scan processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [apiKey, saveScanToHistory]);

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
        />

        {/* Processing Spinner Overlay */}
        {isProcessing && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="relative w-20 h-20 flex items-center justify-center mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
              <Scan className="w-8 h-8 text-emerald-400 animate-pulse" />
            </div>
            <h3 className="text-lg font-extrabold text-white">Scanning Frame for Food Label...</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Analyzing computer vision input for food package labels, ingredients, and human face filters.
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
                onFaceAutoDetected={() => setIsFaceModalOpen(true)}
              />
              
              {/* Quick Result Preview under scanner */}
              {currentScanResult && (
                <NutritionDashboard
                  scanResult={currentScanResult}
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
                <NutritionDashboard
                  scanResult={currentScanResult}
                  onOpenJsonView={() => setActiveTab('json')}
                />
              )}
            </div>
          )}

          {activeTab === 'presets' && (
            <PresetGallery onSelectPreset={handleSelectPreset} />
          )}

          {activeTab === 'dashboard' && (
            <NutritionDashboard
              scanResult={currentScanResult}
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
            <span className="font-semibold text-slate-300">NutriPulse Computer Vision & Face Detection Engine</span>
          </div>
          <span>Conforms strictly to FDA / EU Standard Nutritional Measurement Schemas</span>
        </div>
      </footer>

      {/* API Key Modal */}
      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      {/* Human Face Alert Modal */}
      <HumanFaceAlertModal
        isOpen={isFaceModalOpen}
        onClose={() => setIsFaceModalOpen(false)}
        onTryPreset={() => handleSelectPreset(SAMPLE_FOOD_PACKAGES[0].id)}
      />

    </div>
  );
}
