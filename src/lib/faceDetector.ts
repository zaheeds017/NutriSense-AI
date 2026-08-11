// Human Face Detector Utility for NutriSense-AI
// Accurately detects human faces in video frames, camera streams, and uploaded images.

export interface FaceDetectionResult {
  faceDetected: boolean;
  confidence: number;
  message?: string;
}

/**
 * Detects if an image, canvas, or video element contains a human face.
 * Combines Native Web API ShapeDetection (window.FaceDetector) with high-precision skin & edge density analysis.
 */
export async function detectHumanFace(
  source: HTMLVideoElement | HTMLCanvasElement | HTMLImageElement
): Promise<FaceDetectionResult> {
  try {
    // 1. Check Native Browser FaceDetector API (Chrome/Edge Shape Detection API)
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const FaceDetectorClass = (window as any).FaceDetector;
        const detector = new FaceDetectorClass({ maxFaces: 5, fastMode: true });
        const faces = await detector.detect(source);
        if (faces && faces.length > 0) {
          return {
            faceDetected: true,
            confidence: 0.98,
            message: `Warning: Human face detected (${faces.length} face${faces.length > 1 ? 's' : ''} in view).`
          };
        }
      } catch (err) {
        // Fallback to canvas skin & edge density detector
      }
    }

    // 2. Fallback Canvas Analysis: Skin Tone + Edge Density Check
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return { faceDetected: false, confidence: 0 };

    const width = source instanceof HTMLVideoElement ? source.videoWidth || 300 : source.width || 300;
    const height = source instanceof HTMLVideoElement ? source.videoHeight || 200 : source.height || 200;

    if (width === 0 || height === 0) return { faceDetected: false, confidence: 0 };

    canvas.width = Math.min(width, 160); // Downsample for fast real-time analysis
    canvas.height = Math.min(height, 120);

    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imgData.data;

    // Analyze central frame region (where faces reside)
    const startX = Math.floor(canvas.width * 0.2);
    const endX = Math.floor(canvas.width * 0.8);
    const startY = Math.floor(canvas.height * 0.15);
    const endY = Math.floor(canvas.height * 0.85);

    let skinPixelCount = 0;
    let highEdgeCount = 0; // Counts high-contrast text/barcode edges
    let totalSampled = 0;

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * canvas.width + x) * 4;
        const r = pixels[idx];
        const g = pixels[idx + 1];
        const b = pixels[idx + 2];

        // Strict RGB Skin Color Check
        const isSkinRGB =
          r > 95 && g > 40 && b > 20 &&
          Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
          Math.abs(r - g) > 15 &&
          r > g && r > b;

        // Strict YCbCr Space Check
        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
        const isSkinYCbCr = cb >= 77 && cb <= 127 && cr >= 133 && cr <= 173;

        // BOTH skin checks must pass to count as human skin pixel
        if (isSkinRGB && isSkinYCbCr) {
          skinPixelCount++;
        }

        // Horizontal luminance gradient check to identify barcodes/text labels
        if (x < endX - 1) {
          const nextR = pixels[idx + 4];
          const nextG = pixels[idx + 5];
          const nextB = pixels[idx + 6];
          const lumDiff = Math.abs((r + g + b) - (nextR + nextG + nextB)) / 3;
          if (lumDiff > 55) { // Sharp black/white edge typical of barcodes/nutrition tables
            highEdgeCount++;
          }
        }

        totalSampled++;
      }
    }

    const skinRatio = skinPixelCount / (totalSampled || 1);
    const edgeRatio = highEdgeCount / (totalSampled || 1);

    // If there is high edge density (lots of text or barcode lines), it's a packaging image, NOT a face!
    if (edgeRatio > 0.18) {
      return { faceDetected: false, confidence: 0 };
    }

    // Require high skin ratio (>= 38%) and low barcode edge noise to classify as human face
    if (skinRatio >= 0.38) {
      return {
        faceDetected: true,
        confidence: Math.min(0.95, skinRatio * 2.0),
        message: 'Warning: Human face detected in view.'
      };
    }

    return { faceDetected: false, confidence: 0 };
  } catch (e) {
    console.warn('Face detection error:', e);
    return { faceDetected: false, confidence: 0 };
  }
}

