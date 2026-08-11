import React, { useState } from 'react';
import { Upload, Image as ImageIcon, Camera, Sparkles, AlertCircle, RefreshCw, UserX, AlertTriangle } from 'lucide-react';


interface LabelScannerProps {
  onScanImage: (base64Data: string, mimeType: string, productName?: string, brand?: string) => void;
  isLoading: boolean;
}

export const LabelScanner: React.FC<LabelScannerProps> = ({ onScanImage, isLoading }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFaceDetected(false);
      setMimeType(file.type || 'image/jpeg');
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setSelectedImage(result);

        // Analyze image for human face detection
        const img = new Image();
        img.onload = async () => {
          try {
            const { detectHumanFace } = await import('../lib/faceDetector');
            const res = await detectHumanFace(img);
            setFaceDetected(res.faceDetected);
          } catch (e) {
            setFaceDetected(false);
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = () => {
    if (selectedImage) {
      onScanImage(selectedImage, mimeType, productName.trim() || undefined, brand.trim() || undefined);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
        <div>
          <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
            <Camera className="w-5 h-5 text-emerald-600" />
            Scan Ingredients or Nutrition Facts Label (OCR)
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Capture or upload a photo of the ingredients list or nutrition table. Gemini Multimodal OCR parses and extracts macros, ingredients, and allergens automatically.
          </p>
        </div>

        {/* Optional Context Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Product Name (Optional)
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g. Organic Almond Granola"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Brand (Optional)
            </label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="e.g. Nature Valley"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Upload / Preview Box */}
        <div className="relative border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-emerald-50/40 rounded-2xl p-6 text-center transition-colors">
          {selectedImage ? (
            <div className="space-y-4">
              <div className="relative max-h-64 mx-auto rounded-xl overflow-hidden shadow-md border border-slate-200 inline-block">
                <img src={selectedImage} alt="Label scan preview" className="max-h-64 object-contain" />

                {faceDetected && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-10 border-2 border-amber-500">
                    <UserX className="w-8 h-8 text-amber-400 mb-2" />
                    <span className="text-xs font-bold text-amber-300">Human Face Detected</span>
                    <p className="text-[11px] text-amber-200/90 mt-1 max-w-xs">
                      This photo appears to depict a human face. Please scan a food label or packaging.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFaceDetected(false)}
                        className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg shadow-sm"
                      >
                        Dismiss Warning & Continue
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {faceDetected && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-center justify-between gap-2 text-amber-800 text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Warning: Human face detected in photo. Scan animation disabled.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaceDetected(false)}
                    className="text-[11px] underline text-amber-700 hover:text-amber-900"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <div className="flex justify-center gap-2">
                <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition-colors">
                  Change Photo
                  <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                </label>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  id="submit-ocr-scan-btn"
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Running OCR & AI Analysis...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Label with AI
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <label className="cursor-pointer block space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                <Upload className="w-7 h-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Click to upload or take photo of food label
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Supports JPG, PNG, WEBP packaging photos
                </p>
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-input-label-ocr"
              />
            </label>
          )}
        </div>

        {/* OCR Best Practices Tip */}
        <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl flex items-start gap-2 text-amber-900 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Tips for Best OCR Accuracy:</p>
            <p className="text-amber-700 mt-0.5">
              Ensure the "INGREDIENTS:" heading and Nutrition Facts table are clearly lit without heavy shadows or glare.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

