import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Zap, Sliders, ScanLine, Sparkles, UserCheck } from 'lucide-react';
import { SAMPLE_FOOD_PACKAGES } from '../utils/sampleDatabase';
import { detectHumanFace } from '../utils/faceDetector';
import { SOUNDS } from '../utils/soundUtils';

export default function CameraScanner({ onCaptureLabel, onSelectPreset, onFaceAutoDetected }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wasFaceDetectedRef = useRef(false);

  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [flash, setFlash] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [isScanning] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [realtimeFaceDetected, setRealtimeFaceDetected] = useState(false);

  // 1. Initialize camera stream
  useEffect(() => {
    let currentStream = null;

    async function initCamera() {
      setErrorMsg('');
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera access API is not supported in this browser environment.');
        }

        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });

        currentStream = mediaStream;
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.warn('WebRTC Camera initialize warning:', err.message);
        setErrorMsg('Camera access is restricted or unavailable. You can test Real-Time Auto Face Detection or choose a Preset Package below.');
      }
    }

    initCamera();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  // 2. Real-Time Auto Face Detection Loop (requestAnimationFrame + throttled frame analysis)
  useEffect(() => {
    let rafId = null;
    let lastCheck = 0;
    const CHECK_INTERVAL = 250;

    const runRealtimeFaceCheck = async (timestamp) => {
      if (timestamp - lastCheck >= CHECK_INTERVAL && videoRef.current && videoRef.current.readyState >= 2) {
        lastCheck = timestamp;
        try {
          const faceRes = await detectHumanFace(videoRef.current);
          const hasFace = Boolean(faceRes && faceRes.hasFace);
          setRealtimeFaceDetected(hasFace);

          // Fire alert (beep + modal) only on the rising edge of detection
          if (hasFace && !wasFaceDetectedRef.current) {
            wasFaceDetectedRef.current = true;
            SOUNDS.faceDetected();
            if (onFaceAutoDetected) onFaceAutoDetected();
          } else if (!hasFace) {
            wasFaceDetectedRef.current = false;
          }
        } catch (err) {
          console.warn('Realtime face check error:', err);
        }
      }
      rafId = requestAnimationFrame(runRealtimeFaceCheck);
    };

    rafId = requestAnimationFrame(runRealtimeFaceCheck);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [onFaceAutoDetected]);

  // Handle Snapshot Capture
  const handleSnapImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    if (highContrast) {
      ctx.filter = 'contrast(150%) brightness(110%) grayscale(20%)';
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    onCaptureLabel({ imageSource: dataUrl });
  };

  // Switch Camera
  const toggleFacingMode = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Manual Trigger for Face Simulation Test
  const handleSimulateFaceDetection = () => {
    setRealtimeFaceDetected(true);
    wasFaceDetectedRef.current = true;
    SOUNDS.faceDetected();
    if (onFaceAutoDetected) {
      onFaceAutoDetected();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Scanner Viewfinder Box */}
      <div className={`relative w-full aspect-[4/3] md:aspect-[16/9] bg-slate-950 rounded-3xl overflow-hidden border transition-all duration-300 shadow-2xl group ${
        realtimeFaceDetected ? 'border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)]' : 'border-slate-800'
      }`}>
        
        {/* Video stream or camera fallback */}
        {!errorMsg ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={`w-full h-full object-cover transition-all duration-300 ${
              highContrast ? 'contrast-[130%] brightness-110' : ''
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Camera Viewfinder Ready</h3>
            <p className="text-xs text-slate-400 max-w-md mb-6">{errorMsg}</p>
            
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleSimulateFaceDetection}
                className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl font-extrabold text-xs shadow-lg shadow-amber-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" /> Test Auto Face Detection Alert
              </button>

              <button
                onClick={() => onSelectPreset(SAMPLE_FOOD_PACKAGES[0].id)}
                className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" /> Scan Food Package (Doritos)
              </button>
            </div>
          </div>
        )}

        {/* Laser HUD Overlay */}
        {!errorMsg && (
          <>
            {/* Dark vignette gradient */}
            <div className="absolute inset-0 bg-radial-vignette pointer-events-none" />

            {/* Real-time Face Warning Banner inside viewfinder */}
            {realtimeFaceDetected ? (
              <div className="absolute inset-10 md:inset-16 border-4 border-amber-500 rounded-2xl pointer-events-none flex flex-col items-center justify-between p-4 bg-amber-500/10 backdrop-blur-xs animate-pulse">
                <div className="px-4 py-1.5 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg">
                  <UserCheck className="w-4 h-4" /> Human Face Auto-Detected!
                </div>
                <p className="text-xs font-bold text-amber-300 bg-slate-950/80 px-3 py-1 rounded-lg border border-amber-500/30">
                  Please align a packaged food label in frame
                </p>
              </div>
            ) : (
              /* Corner Targeting Guides for Food Package */
              <div className="absolute inset-10 md:inset-16 border-2 border-dashed border-emerald-400/40 rounded-2xl pointer-events-none transition-all flex flex-col justify-between p-2">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-lg shadow-[0_0_15px_#10b981]" />
                  <div className="w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-lg shadow-[0_0_15px_#10b981]" />
                </div>
                
                {isScanning && (
                  <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_20px_#10b981] animate-laser-scan" />
                )}

                <div className="flex justify-between">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-lg shadow-[0_0_15px_#10b981]" />
                  <div className="w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-lg shadow-[0_0_15px_#10b981]" />
                </div>
              </div>
            )}

            {/* Instruction pill */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-slate-200 text-xs font-medium flex items-center gap-2 shadow-lg">
              <ScanLine className="w-4 h-4 text-emerald-400 animate-spin-slow" />
              <span>Real-Time Auto Face & Package Vision Active</span>
            </div>

            {/* Control Bar Overlay */}
            <div className="absolute bottom-4 inset-x-4 flex items-center justify-between">
              
              {/* Flash / Filter Toggle */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setFlash(!flash)}
                  className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
                    flash ? 'bg-amber-500/20 border-amber-500 text-amber-400' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Toggle Flash / Highlight"
                >
                  <Zap className="w-4 h-4" />
                </button>

                <button
                  onClick={() => setHighContrast(!highContrast)}
                  className={`p-2.5 rounded-xl backdrop-blur-md border transition-all ${
                    highContrast ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400' : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Enhance OCR Text Contrast"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

              {/* Main Snapshot Button */}
              <button
                onClick={handleSnapImage}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-1 shadow-lg shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-transform flex items-center justify-center group"
              >
                <div className="w-full h-full rounded-full bg-slate-950 border-2 border-white flex items-center justify-center group-hover:bg-slate-900">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 shadow-[0_0_10px_#10b981]" />
                </div>
              </button>

              {/* Camera Switcher */}
              <button
                onClick={toggleFacingMode}
                className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:bg-slate-800 backdrop-blur-md transition-all"
                title="Switch Camera"
              >
                <RefreshCw className="w-4 h-4" />
              </button>

            </div>
          </>
        )}

      </div>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Quick Face Detection Test Trigger Bar */}
      <div className="w-full mt-4 p-4 rounded-2xl bg-slate-900/80 border border-amber-500/30 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Real-Time Auto Face Detection Active</h4>
            <p className="text-[11px] text-slate-400">Scanner automatically detects faces on live camera stream without manual clicking:</p>
          </div>
        </div>

        <button
          onClick={handleSimulateFaceDetection}
          className="px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-xl font-bold text-xs border border-amber-500/40 transition-all flex items-center gap-1.5 whitespace-nowrap shadow-md"
        >
          <UserCheck className="w-4 h-4" /> Test Face Auto-Alert Demo
        </button>
      </div>

    </div>
  );
}
