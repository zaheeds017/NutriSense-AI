import React, { useState, useRef } from 'react';
import { Upload, Sparkles, ArrowRight } from 'lucide-react';
import { SAMPLE_FOOD_PACKAGES } from '../utils/sampleDatabase';

export default function ImageUploader({ onCaptureLabel, onSelectPreset }) {
  const [dragActive, setDragActive] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRunScan = () => {
    if (!imagePreview) return;
    onCaptureLabel({ imageSource: imagePreview });
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center">
      
      {/* Drag & Drop Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative w-full aspect-[16/9] rounded-3xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center p-8 text-center overflow-hidden group ${
          dragActive
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : imagePreview
            ? 'border-emerald-500/50 bg-slate-900/90'
            : 'border-slate-800 bg-slate-950 hover:border-slate-700 hover:bg-slate-900/60'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={imagePreview}
              alt="Food Nutrition Label Preview"
              className="max-h-full max-w-full object-contain rounded-2xl shadow-xl border border-slate-700/60"
            />
            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center backdrop-blur-sm">
              <span className="px-4 py-2 bg-slate-900/90 text-white rounded-xl text-xs font-semibold border border-slate-700">
                Click to change image
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/10">
              <Upload className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Upload Nutrition Facts or Ingredient Photo</h3>
            <p className="text-xs text-slate-400 max-w-sm mb-4">
              Drag & drop any food package photo here, or click to browse files (JPEG, PNG, WEBP)
            </p>

            <span className="px-3 py-1 bg-slate-800 text-slate-300 text-[11px] font-mono rounded-lg border border-slate-700/80">
              High Resolution & Clear Contrast Recommended
            </span>
          </div>
        )}
      </div>

      {/* Action Bar */}
      {imagePreview && (
        <div className="w-full mt-6 flex justify-end">
          <button
            onClick={handleRunScan}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-bold text-sm rounded-2xl shadow-xl shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-5 h-5 fill-slate-950" />
            <span>Run Computer Vision OCR Scan</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sample Presets Section */}
      <div className="w-full mt-8">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Or Choose From Sample Package Presets:</h4>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {SAMPLE_FOOD_PACKAGES.map((pkg) => (
            <div
              key={pkg.id}
              onClick={() => onSelectPreset(pkg.id)}
              className="p-3 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/50 cursor-pointer transition-all group flex flex-col items-center text-center shadow-lg"
            >
              <div className="w-full h-24 rounded-xl overflow-hidden mb-2 relative">
                <img src={pkg.imageUrl} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-bold text-emerald-400 font-mono">
                  {pkg.extractedJson.macros.calories.value} kcal
                </span>
              </div>
              <h5 className="text-xs font-bold text-white line-clamp-1 group-hover:text-emerald-400 transition-colors">{pkg.name}</h5>
              <p className="text-[10px] text-slate-400">{pkg.brand}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
