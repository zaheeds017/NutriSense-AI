import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Barcode, Camera, RefreshCw, Sparkles, CheckCircle2, AlertCircle, Volume2, VolumeX, UserX, AlertTriangle, UserCheck } from 'lucide-react';
import { playScanBeep } from '../lib/sound';
import { detectHumanFace } from '../lib/faceDetector';

interface BarcodeScannerProps {
  onScanSuccess: (barcode: string) => void;
  isLoading: boolean;
}

const SAMPLE_BARCODES = [
  { barcode: '030000062002', name: 'Quaker Whole Oats', score: 9.5, type: 'Grain' },
  { barcode: '3017620422003', name: 'Nutella Hazelnut Spread', score: 2.8, type: 'Spread' },
  { barcode: '041500000251', name: 'FAGE 0% Greek Yogurt', score: 9.2, type: 'Dairy' },
  { barcode: '044000032029', name: 'Oreo Original Cookies', score: 2.1, type: 'Snack' },
  { barcode: '028400090896', name: 'Doritos Nacho Cheese', score: 3.0, type: 'Chips' },
  { barcode: '085239045610', name: 'Unsweetened Almond Milk', score: 8.4, type: 'Plant Milk' },
  { barcode: '602652171015', name: 'KIND Dark Choc Nut Bar', score: 7.2, type: 'Bar' },
];

export const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScanSuccess, isLoading }) => {
  const [manualBarcode, setManualBarcode] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [faceDetected, setFaceDetected] = useState(false);
  const [faceWarningMsg, setFaceWarningMsg] = useState<string | null>(null);
  const [simulatedFace, setSimulatedFace] = useState(false);

  const html5QrcodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'barcode-reader-viewfinder';

  const triggerScanFeedback = (barcode: string) => {
    if (soundEnabled) {
      playScanBeep();
    }
    onScanSuccess(barcode);
  };

  useEffect(() => {
    return () => {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch(console.error);
      }
    };
  }, []);

  // Continuous frame analysis for human face detection when camera is active
  useEffect(() => {
    if (!isCameraActive) {
      if (!simulatedFace) {
        setFaceDetected(false);
        setFaceWarningMsg(null);
      }
      return;
    }

    const interval = setInterval(async () => {
      if (simulatedFace) {
        setFaceDetected(true);
        setFaceWarningMsg('Warning: Human face detected in camera view!');
        return;
      }

      const videoEl = document.querySelector(`#${scannerContainerId} video`) as HTMLVideoElement | null;
      if (videoEl && videoEl.readyState >= 2) {
        const result = await detectHumanFace(videoEl);
        if (result.faceDetected) {
          setFaceDetected(true);
          setFaceWarningMsg(result.message || 'Warning: Human face detected in camera view!');
        } else {
          setFaceDetected(false);
          setFaceWarningMsg(null);
        }
      }
    }, 250);

    return () => clearInterval(interval);
  }, [isCameraActive, simulatedFace]);

  const toggleSimulatedFace = () => {
    const nextState = !simulatedFace;
    setSimulatedFace(nextState);
    if (nextState) {
      setFaceDetected(true);
      setFaceWarningMsg('Warning: Human face detected! Scan animation paused.');
    } else {
      setFaceDetected(false);
      setFaceWarningMsg(null);
    }
  };

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!html5QrcodeRef.current) {
        html5QrcodeRef.current = new Html5Qrcode(scannerContainerId);
      }
      setIsCameraActive(true);

      await html5QrcodeRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 280, height: 160 },
          aspectRatio: 1.777778,
        },
        (decodedText) => {
          if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
            html5QrcodeRef.current.stop().catch(console.error);
          }
          setIsCameraActive(false);
          triggerScanFeedback(decodedText);
        },
        () => {
          // Frame scanner ignore
        }
      );
    } catch (err: any) {
      console.error('Camera initialization error:', err);
      setIsCameraActive(false);
      const errStr = String(err?.message || err || '');
      if (errStr.includes('NotAllowedError') || errStr.includes('Permission denied') || err?.name === 'NotAllowedError') {
        setCameraError(
          'Camera permission denied by browser settings. To use the live camera scanner, enable camera permissions for this site in your browser settings or address bar. Alternatively, enter a UPC code below or test with a sample barcode.'
        );
      } else {
        setCameraError('Camera access is unavailable. Please try manual UPC input below or click a sample barcode.');
      }
    }
  };

  const stopCamera = async () => {
    if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
      await html5QrcodeRef.current.stop();
    }
    setIsCameraActive(false);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      triggerScanFeedback(manualBarcode.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Viewfinder Camera Box */}
      <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white overflow-hidden shadow-lg border border-slate-800 relative">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Barcode className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-lg text-slate-100">Live Barcode Viewfinder</h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Human Face Detection Simulation / Override Toggle */}
            <button
              type="button"
              onClick={toggleSimulatedFace}
              id="toggle-face-detector-btn"
              title="Test human face detection warning"
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                faceDetected || simulatedFace
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30 shadow-xs'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              <UserX className={`w-3.5 h-3.5 ${faceDetected || simulatedFace ? 'text-amber-400' : 'text-slate-400'}`} />
              <span className="text-[11px]">{simulatedFace ? 'Face Warning Active' : 'Test Face Detector'}</span>
            </button>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? "Audio feedback enabled" : "Audio feedback muted"}
              className={`p-2 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1 ${
                soundEnabled
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-300'
              }`}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5 text-emerald-400" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline text-[11px]">{soundEnabled ? "Audio On" : "Muted"}</span>
            </button>

            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
              >
                Stop Camera
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-slate-950 hover:bg-emerald-400 flex items-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
              >
                <Camera className="w-4 h-4" />
                Start Camera Scan
              </button>
            )}
          </div>
        </div>

        {/* Viewfinder Container */}
        <div className="relative min-h-[220px] bg-slate-950/80 rounded-xl overflow-hidden flex items-center justify-center border border-slate-800">
          <div id={scannerContainerId} className="w-full h-full min-h-[220px]" />

          {/* Live Scanner Animation Overlay - Active when camera is running and NO human face detected */}
          {isCameraActive && !faceDetected && !simulatedFace && (
            <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
              {/* Moving laser beam */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser w-full" />
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 animate-pulse" />

              {/* Viewfinder reticles */}
              <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm opacity-90 shadow-emerald-500/20 shadow-md" />
              <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm opacity-90 shadow-emerald-500/20 shadow-md" />
              <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm opacity-90 shadow-emerald-500/20 shadow-md" />
              <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 rounded-br-sm opacity-90 shadow-emerald-500/20 shadow-md" />

              {/* Status badge */}
              <div className="absolute top-3 inset-x-0 flex justify-center">
                <div className="bg-slate-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-2 text-[11px] font-semibold text-emerald-300 shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Real-Time UPC Scanner Active</span>
                </div>
              </div>
            </div>
          )}

          {!isCameraActive && !faceDetected && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-950/90 z-10">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3">
                <Barcode className="w-6 h-6" />
              </div>
              <p className="text-sm text-slate-300 font-medium">
                Point your camera at any food product UPC/EAN barcode
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Instant database lookup & instant AI ingredient safety scoring
              </p>
              <button
                onClick={startCamera}
                disabled={isLoading}
                className="mt-4 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs tracking-wide hover:opacity-95 transition-all shadow-md shadow-emerald-500/20"
              >
                Launch Viewfinder
              </button>
            </div>
          )}

          {/* Human Face Warning Banner & Overlay (STOPS SCAN ANIMATION) */}
          {(faceDetected || simulatedFace) && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-30 animate-in fade-in duration-200 border-2 border-amber-500/50 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-3 shadow-lg shadow-amber-500/10">
                <UserX className="w-6 h-6" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                HUMAN FACE DETECTED
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                Warning: Human Face Detected
              </h4>
              <p className="text-xs text-amber-200/90 max-w-sm mb-3">
                {faceWarningMsg || 'Camera is pointed at a person. Please align the camera with a food product label or UPC barcode.'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-[11px] text-amber-400/90 font-mono bg-amber-950/80 px-3 py-1.5 rounded-lg border border-amber-800/50">
                  Scan animation disabled
                </p>
                {simulatedFace && (
                  <button
                    type="button"
                    onClick={() => setSimulatedFace(false)}
                    className="text-xs text-slate-300 underline hover:text-white"
                  >
                    Dismiss Warning
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Loading Overlay - ONLY SHOW SCAN ANIMATION IF NO HUMAN FACE DETECTED */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center z-20 overflow-hidden">
              {/* Laser scanning beam line and pulse - ONLY rendered when NO face detected */}
              {!faceDetected && !simulatedFace && (
                <>
                  <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10b981] animate-laser w-full" />
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 animate-pulse pointer-events-none" />

                  {/* Viewfinder corner reticles */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-emerald-400 rounded-tl-sm opacity-80" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-emerald-400 rounded-tr-sm opacity-80" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-emerald-400 rounded-bl-sm opacity-80" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-emerald-400 rounded-br-sm opacity-80" />
                </>
              )}

              <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mb-2 relative z-10" />
              <p className="text-sm font-semibold text-emerald-300 relative z-10">Scanning Database & Analyzing Ingredients...</p>
              <p className="text-[11px] text-emerald-500/80 font-mono mt-1 relative z-10">Matching UPC signatures & food science rules...</p>
            </div>
          )}
        </div>

        {cameraError && (
          <div className="mt-4 p-3.5 bg-rose-950/70 border border-rose-800/80 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs shadow-inner">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-rose-200">Camera Access Error</p>
              <p className="text-rose-300/90 leading-relaxed">{cameraError}</p>
              <div className="pt-1.5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const sampleBtn = document.getElementById('sample-barcode-016000275263');
                    if (sampleBtn) sampleBtn.click();
                  }}
                  className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 font-semibold text-[11px] transition-colors"
                >
                  Try Sample Barcode
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-[11px] transition-colors"
                >
                  Retry Camera
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Manual Barcode Input */}
      <form onSubmit={handleManualSubmit} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
          Or Enter UPC/EAN Barcode Manually
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="e.g. 030000062002 or 3017620422003"
            id="manual-barcode-input"
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={isLoading || !manualBarcode.trim()}
            id="manual-barcode-submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition-colors shrink-0"
          >
            Lookup Barcode
          </button>
        </div>
      </form>

      {/* Quick Sample Barcodes */}
      <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
            Quick Sample Barcode Scans (1-Click Demo)
          </h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {SAMPLE_BARCODES.map((item) => (
            <button
              key={item.barcode}
              onClick={() => triggerScanFeedback(item.barcode)}
              disabled={isLoading}
              id={`sample-barcode-${item.barcode}`}
              className="flex items-center justify-between p-3 bg-white hover:bg-emerald-50/80 border border-emerald-100/80 hover:border-emerald-300 rounded-xl text-left transition-all shadow-2xs group focus:outline-none"
            >
              <div className="min-w-0 pr-2">
                <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-900 truncate">
                  {item.name}
                </p>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-emerald-700">
                  UPC: {item.barcode}
                </span>
              </div>
              <div
                className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                  item.score >= 8.0
                    ? 'bg-emerald-100 text-emerald-800'
                    : item.score >= 5.0
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {item.score}/10
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
