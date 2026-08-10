import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Barcode, Camera, CameraOff, Loader2, ScanBarcode, AlertTriangle, BookOpen,
  ImageUp, X,
} from 'lucide-react';

export default function BarcodeScanner({ onBarcodeScanned, isProcessing, lastResult }) {
  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [manuallyEntered, setManuallyEntered] = useState('');
  const [isDecodingFile, setIsDecodingFile] = useState(false);
  const [fileError, setFileError] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const lastCodeRef = useRef('');
  const html5Ref = useRef(null);
  const fileScannerRef = useRef(null);
  const fileInputRef = useRef(null);

  const stopScanner = async () => {
    if (html5Ref.current && html5Ref.current.isScanning) {
      try {
        await html5Ref.current.stop();
      } catch (err) {
        console.warn('Failed to stop barcode scanner:', err);
      }
    }
    setIsScanning(false);
  };

  const startScanner = async () => {
    if (!html5Ref.current) {
      html5Ref.current = new Html5Qrcode('barcode-reader-region');
    }
    setCameraError('');
    setIsScanning(true);
    try {
      await html5Ref.current.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        (decodedText) => {
          if (lastCodeRef.current !== decodedText && !isProcessing) {
            lastCodeRef.current = decodedText;
            onBarcodeScanned(decodedText);
          }
        },
        () => {}
      );
    } catch {
      setCameraError('Camera unavailable or permission denied. Try entering the barcode manually below.');
      setIsScanning(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    const code = manuallyEntered.trim();
    if (code && !isProcessing) {
      lastCodeRef.current = code;
      onBarcodeScanned(code);
    }
  };

  const decodeBarcodeFile = async (file) => {
    if (!file || isProcessing) return;
    setFileError('');
    setIsDecodingFile(true);
    setPreviewUrl(URL.createObjectURL(file));

    try {
      if (!fileScannerRef.current) {
        fileScannerRef.current = new Html5Qrcode('barcode-file-region');
      }
      const decoded = await fileScannerRef.current.scanFile(file, false);
      lastCodeRef.current = decoded;
      onBarcodeScanned(decoded);
    } catch {
      setFileError('No readable barcode found in that image. Use a sharp, well-lit, straight-on photo of the barcode.');
    } finally {
      setIsDecodingFile(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) decodeBarcodeFile(file);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (file) decodeBarcodeFile(file);
  };

  const clearPreview = () => {
    setPreviewUrl('');
    setFileError('');
  };

  useEffect(() => {
    return () => {
      if (html5Ref.current && html5Ref.current.isScanning) {
        html5Ref.current.stop().catch(() => {});
      }
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">Barcode Scanner</h2>
              <p className="text-xs text-slate-400">Scan UPC/EAN codes for instant health analysis</p>
            </div>
          </div>

          {!isScanning ? (
            <button
              onClick={startScanner}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:opacity-90 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Camera className="w-4 h-4" /> Start Camera Scanner
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="px-5 py-2.5 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold text-xs border border-rose-500/30 transition-all flex items-center justify-center gap-2"
            >
              <CameraOff className="w-4 h-4" /> Stop Camera
            </button>
          )}
        </div>

        {isProcessing && (
          <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center gap-3 text-xs text-cyan-300 font-semibold">
            <Loader2 className="w-4 h-4 animate-spin" />
            Looking up barcode in the product catalog and Open Food Facts...
          </div>
        )}

        {cameraError && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300 font-semibold">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{cameraError}</span>
          </div>
        )}

        <div className="rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 relative">
          <div id="barcode-reader-region" className="w-full [&_video]:w-full [&_video]:object-cover" style={{ minHeight: isScanning ? '280px' : '180px' }} />
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
              <Barcode className="w-12 h-12 text-slate-700 mb-3" />
              <p className="text-xs text-slate-500 max-w-sm">
                The scanner supports EAN-13, EAN-8, UPC-A, UPC-E, Code 128 and QR codes printed on food packaging.
              </p>
            </div>
          )}
          {isScanning && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-2xl border-2 border-emerald-400/70 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] animate-pulse" />
            </div>
          )}
        </div>

        {/* Upload Barcode Image From Local File */}
        <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/30 shrink-0">
                <ImageUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white tracking-tight">Upload Barcode Image</h3>
                <p className="text-xs text-slate-400">
                  Decode a UPC/EAN barcode from a saved photo or screenshot on your device.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="barcode-file-input"
              />
              <button
                onClick={() => fileInputRef.current && fileInputRef.current.click()}
                disabled={isDecodingFile || isProcessing}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:opacity-90 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-violet-500/25"
              >
                {isDecodingFile ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageUp className="w-4 h-4" />}
                {isDecodingFile ? 'Decoding...' : 'Choose Image'}
              </button>
            </div>
          </div>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="mt-4 rounded-2xl bg-slate-950/80 border border-slate-800 relative min-h-[140px] overflow-hidden"
          >
            <div id="barcode-file-region" className="hidden" />

            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Barcode preview" className="w-full h-44 object-contain bg-slate-950" />
                <button
                  onClick={clearPreview}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/90 text-slate-400 hover:text-rose-400 border border-slate-700 transition-colors"
                  title="Clear preview"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 pointer-events-none">
                <Barcode className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-[11px] text-slate-500 max-w-md">
                  Drop an image here or click <strong className="text-violet-400">Choose Image</strong>. Supports JPG, PNG, and
                  WEBP photos of barcodes and QR codes.
                </p>
              </div>
            )}

            {isDecodingFile && (
              <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                <p className="text-xs text-slate-300 font-semibold">Searching for a barcode in the image...</p>
              </div>
            )}
          </div>

          {fileError && (
            <div className="mt-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-300 font-semibold">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{fileError}</span>
            </div>
          )}
        </div>

        <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={manuallyEntered}
            onChange={(e) => setManuallyEntered(e.target.value.replace(/\D/g, ''))}
            placeholder="Or type a barcode manually, e.g. 028400083832"
            className="flex-1 px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-emerald-500 transition-all"
          />
          <button
            type="submit"
            disabled={!manuallyEntered || isProcessing}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-slate-700"
          >
            <Barcode className="w-4 h-4 text-emerald-400" /> Look Up Code
          </button>
        </form>

        {lastResult && !lastResult.success && lastResult.message && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-xs text-rose-300 font-semibold">
            <BookOpen className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{lastResult.message}</span>
          </div>
        )}
      </div>
    </div>
  );
}
