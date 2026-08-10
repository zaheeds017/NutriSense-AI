/**
 * Client-Side Real-Time Human Face Detection Utility
 * Detects human faces in real time from video stream or canvas image.
 * Strategy: Native Browser Shape Detection API first, then a multi-model
 * skin-tone + face-geometry analysis on a low-res canvas snapshot.
 */

export async function detectHumanFace(sourceElement) {
  if (!sourceElement) return { hasFace: false, confidence: 0 };

  // 1. Try Native Browser Shape Detection FaceDetector API if available
  if ('FaceDetector' in window) {
    try {
      const faceDetector = new window.FaceDetector({ fastMode: true, maxFaces: 5 });
      const faces = await faceDetector.detect(sourceElement);
      if (faces && faces.length > 0) {
        return {
          hasFace: true,
          faceCount: faces.length,
          confidence: 0.98,
          method: 'Native Browser FaceDetector API',
          box: faces[0].boundingBox
        };
      }
    } catch {
      // Fallback to canvas color analysis
    }
  }

  // 2. Multi-model Skin Tone + Face Geometry Analysis
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const width = 200;
    const height = 150;
    canvas.width = width;
    canvas.height = height;

    ctx.drawImage(sourceElement, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;

    // Central face region (where a face is expected in the viewfinder)
    const startX = Math.floor(width * 0.22);
    const endX = Math.floor(width * 0.78);
    const startY = Math.floor(height * 0.12);
    const endY = Math.floor(height * 0.88);
    const regionWidth = endX - startX;
    const regionHeight = endY - startY;
    const regionArea = regionWidth * regionHeight;

    let skinTotal = 0;
    let skinCentral = 0;
    const rowSkin = new Array(regionHeight).fill(0);

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        if (isSkinPixel(r, g, b)) {
          skinTotal++;
          if (x >= startX && x <= endX && y >= startY && y <= endY) {
            skinCentral++;
            rowSkin[y - startY]++;
          }
        }
      }
    }

    const skinRatio = skinTotal / (width * height);
    const centralRatio = skinCentral / regionArea;
    const maxRowDensity = Math.max.apply(null, rowSkin) / regionWidth;

    // Confidence tiers tuned to accept real webcam faces while rejecting
    // small skin-colored blobs in the background.
    let confidence = 0;
    let method = '';

    if (centralRatio > 0.42) {
      confidence = 0.95;
      method = 'Large central face region';
    } else if (centralRatio > 0.32 && skinRatio > 0.14) {
      confidence = 0.88;
      method = 'Prominent central skin region';
    } else if (centralRatio > 0.24 && maxRowDensity > 0.55 && skinRatio > 0.12) {
      confidence = 0.8;
      method = 'Face-sized horizontal skin band';
    } else if (centralRatio > 0.18 && maxRowDensity > 0.65 && skinRatio > 0.10) {
      confidence = 0.72;
      method = 'Partial face detected in frame';
    }

    if (confidence > 0) {
      return {
        hasFace: true,
        faceCount: 1,
        confidence: Number(confidence.toFixed(2)),
        method,
      };
    }

    return { hasFace: false, faceCount: 0, confidence: 0 };
  } catch {
    return { hasFace: false, faceCount: 0, confidence: 0 };
  }
}

/**
 * Combined RGB + YCbCr skin pixel classifier. Either model can flag a pixel
 * as skin, which makes detection robust across light/dark skin tones and
 * varying lighting conditions.
 */
function isSkinPixel(r, g, b) {
  // RGB skin model (Peer & Solina style)
  const rgbRule =
    r > 95 && g > 40 && b > 20 &&
    Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
    Math.abs(r - g) > 15 &&
    r > g && r > b &&
    !(r > 250 && g > 210 && b > 170); // exclude near-white highlights

  // YCbCr skin model (adaptive bounds)
  const Y = 0.299 * r + 0.587 * g + 0.114 * b;
  const Cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
  const Cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
  const yCbCrRule = Y > 80 && Cb > 77 && Cb < 127 && Cr > 133 && Cr < 177;

  return rgbRule || yCbCrRule;
}
