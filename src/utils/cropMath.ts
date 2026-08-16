import { AnchorPosition, CropRect, CropStrategyMode, SmartCropAnalysis, StandardPreset } from '../types';

export const STANDARD_PRESETS: StandardPreset[] = [
  {
    id: '9-16',
    name: '9:16 Vertical Story / Reel',
    category: 'Social',
    ratioStr: '9:16',
    ratioWidth: 9,
    ratioHeight: 16,
    standardWidth: 1080,
    standardHeight: 1920,
    description: 'Standard for Instagram Stories, Reels, TikTok, YouTube Shorts & Phone Wallpapers.',
    popularUses: ['Instagram Story/Reels', 'TikTok', 'YouTube Shorts', 'Lock Screen'],
    multiples: [
      { label: 'Standard FHD (1080 × 1920)', width: 1080, height: 1920 },
      { label: '4K Ultra (2160 × 3840)', width: 2160, height: 3840 },
      { label: '2K QHD (1440 × 2560)', width: 1440, height: 2560 },
      { label: '720p HD (720 × 1280)', width: 720, height: 1280 },
    ],
  },
  {
    id: '16-9',
    name: '16:9 Landscape Video & Desktop',
    category: 'Video',
    ratioStr: '16:9',
    ratioWidth: 16,
    ratioHeight: 9,
    standardWidth: 1920,
    standardHeight: 1080,
    description: 'Standard for YouTube video thumbnails, desktop screens, presentations, and landscape video.',
    popularUses: ['YouTube Thumbnail', 'Desktop Wallpaper', 'Presentation Slide', 'TV Display'],
    multiples: [
      { label: 'Full HD 1080p (1920 × 1080)', width: 1920, height: 1080 },
      { label: '4K UHD (3840 × 2160)', width: 3840, height: 2160 },
      { label: '2K QHD (2560 × 1440)', width: 2560, height: 1440 },
      { label: '720p HD (1280 × 720)', width: 1280, height: 720 },
    ],
  },
  {
    id: '1-1',
    name: '1:1 Square Post / Avatar',
    category: 'Social',
    ratioStr: '1:1',
    ratioWidth: 1,
    ratioHeight: 1,
    standardWidth: 1080,
    standardHeight: 1080,
    description: 'Standard for Instagram grid posts, profile avatars, icons, and album art.',
    popularUses: ['Instagram Square Post', 'Profile Avatar', 'Album Cover', 'Product Tile'],
    multiples: [
      { label: 'Standard (1080 × 1080)', width: 1080, height: 1080 },
      { label: 'High Res (2048 × 2048)', width: 2048, height: 2048 },
      { label: 'Web Icon (512 × 512)', width: 512, height: 512 },
      { label: 'Avatar (400 × 400)', width: 400, height: 400 },
    ],
  },
  {
    id: '4-5',
    name: '4:5 Instagram Portrait Post',
    category: 'Social',
    ratioStr: '4:5',
    ratioWidth: 4,
    ratioHeight: 5,
    standardWidth: 1080,
    standardHeight: 1350,
    description: 'Maximizes screen space in Instagram and Facebook vertical feed posts.',
    popularUses: ['Instagram Feed (Max Height)', 'Facebook Portrait Post', 'Pinterest Pin'],
    multiples: [
      { label: 'Standard (1080 × 1350)', width: 1080, height: 1350 },
      { label: '2x Retina (2160 × 2700)', width: 2160, height: 2700 },
    ],
  },
  {
    id: '3-2',
    name: '3:2 Classic Photo Landscape',
    category: 'Photography',
    ratioStr: '3:2',
    ratioWidth: 3,
    ratioHeight: 2,
    standardWidth: 1080,
    standardHeight: 720,
    description: 'Traditional 35mm DSLR/Mirrorless camera sensor landscape ratio.',
    popularUses: ['DSLR Photography', 'Print 6"x4"', 'Landscape Postcards', 'Hero Headers'],
    multiples: [
      { label: 'Web (1080 × 720)', width: 1080, height: 720 },
      { label: 'Full Res (3000 × 2000)', width: 3000, height: 2000 },
      { label: 'Hi-Res (6000 × 4000)', width: 6000, height: 4000 },
      { label: 'Medium (1500 × 1000)', width: 1500, height: 1000 },
    ],
  },
  {
    id: '2-3',
    name: '2:3 Classic Photo Portrait',
    category: 'Photography',
    ratioStr: '2:3',
    ratioWidth: 2,
    ratioHeight: 3,
    standardWidth: 1080,
    standardHeight: 1620,
    description: 'Traditional 35mm portrait photography and poster prints.',
    popularUses: ['Portrait Photography', 'Print 4"x6"', 'Pinterest Tall', 'Book Covers'],
    multiples: [
      { label: 'Web (1080 × 1620)', width: 1080, height: 1620 },
      { label: 'Hi-Res (2000 × 3000)', width: 2000, height: 3000 },
      { label: 'Medium (1000 × 1500)', width: 1000, height: 1500 },
    ],
  },
  {
    id: '4-3',
    name: '4:3 Classic Display / Tablet',
    category: 'Display',
    ratioStr: '4:3',
    ratioWidth: 4,
    ratioHeight: 3,
    standardWidth: 1600,
    standardHeight: 1200,
    description: 'Standard ratio for iPad displays, medium format cameras, and classic screens.',
    popularUses: ['iPad Wallpaper', 'Medium Format Photo', 'Micro 4/3 Sensors', 'Classic Slides'],
    multiples: [
      { label: 'Standard (1600 × 1200)', width: 1600, height: 1200 },
      { label: 'iPad Retina (2048 × 1536)', width: 2048, height: 1536 },
      { label: 'Classic (1024 × 768)', width: 1024, height: 768 },
    ],
  },
  {
    id: '3-4',
    name: '3:4 Tablet Portrait / Mobile',
    category: 'Display',
    ratioStr: '3:4',
    ratioWidth: 3,
    ratioHeight: 4,
    standardWidth: 1200,
    standardHeight: 1600,
    description: 'Standard portrait mode for tablets and digital print sizing.',
    popularUses: ['Tablet Portrait', 'Print 18"x24"', 'Digital Lookbook'],
    multiples: [
      { label: 'Standard (1200 × 1600)', width: 1200, height: 1600 },
      { label: 'iPad Portrait (1536 × 2048)', width: 1536, height: 2048 },
    ],
  },
  {
    id: '21-9',
    name: '21:9 Ultrawide Panoramic',
    category: 'Video',
    ratioStr: '21:9',
    ratioWidth: 21,
    ratioHeight: 9,
    standardWidth: 2560,
    standardHeight: 1080,
    description: 'Cinematic widescreen and Ultrawide desktop monitors.',
    popularUses: ['Ultrawide Monitor', 'Cinematic Still', 'Website Banner'],
    multiples: [
      { label: 'Ultrawide FHD (2560 × 1080)', width: 2560, height: 1080 },
      { label: 'Ultrawide QHD (3440 × 1440)', width: 3440, height: 1440 },
    ],
  },
  {
    id: '3-1',
    name: '3:1 X / Twitter Header Banner',
    category: 'Social',
    ratioStr: '3:1',
    ratioWidth: 3,
    ratioHeight: 1,
    standardWidth: 1500,
    standardHeight: 500,
    description: 'Exact recommended size for X / Twitter profile banner headers.',
    popularUses: ['X / Twitter Header', 'Discord Banner', 'Narrow Header'],
    multiples: [
      { label: 'Standard (1500 × 500)', width: 1500, height: 500 },
      { label: '2x Hi-DPI (3000 × 1000)', width: 3000, height: 1000 },
    ],
  },
];

/**
 * Calculates Greatest Common Divisor
 */
export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x || 1;
}

/**
 * Returns simplified aspect ratio string (e.g. 1080:1920 -> 9:16)
 */
export function getSimplifiedRatio(width: number, height: number): string {
  if (!width || !height) return '1:1';
  const divisor = gcd(width, height);
  const w = Math.round(width / divisor);
  const h = Math.round(height / divisor);
  // Check common approximations if divisor is 1
  const ratioVal = width / height;
  if (Math.abs(ratioVal - 9 / 16) < 0.005) return '9:16';
  if (Math.abs(ratioVal - 16 / 9) < 0.005) return '16:9';
  if (Math.abs(ratioVal - 4 / 5) < 0.005) return '4:5';
  if (Math.abs(ratioVal - 5 / 4) < 0.005) return '5:4';
  if (Math.abs(ratioVal - 3 / 2) < 0.005) return '3:2';
  if (Math.abs(ratioVal - 2 / 3) < 0.005) return '2:3';
  if (Math.abs(ratioVal - 4 / 3) < 0.005) return '4:3';
  if (Math.abs(ratioVal - 3 / 4) < 0.005) return '3:4';
  if (Math.abs(ratioVal - 1) < 0.001) return '1:1';
  if (Math.abs(ratioVal - 21 / 9) < 0.02) return '21:9';

  return `${w}:${h}`;
}

/**
 * Calculates anchor offset for a given crop box size inside a parent container
 */
export function getAnchorOffsets(
  containerWidth: number,
  containerHeight: number,
  boxWidth: number,
  boxHeight: number,
  anchor: AnchorPosition = 'center'
): { x: number; y: number } {
  let x = 0;
  let y = 0;

  const excessX = Math.max(0, containerWidth - boxWidth);
  const excessY = Math.max(0, containerHeight - boxHeight);

  switch (anchor) {
    case 'center':
      x = excessX / 2;
      y = excessY / 2;
      break;
    case 'top':
      x = excessX / 2;
      y = 0;
      break;
    case 'bottom':
      x = excessX / 2;
      y = excessY;
      break;
    case 'left':
      x = 0;
      y = excessY / 2;
      break;
    case 'right':
      x = excessX;
      y = excessY / 2;
      break;
    case 'top-left':
      x = 0;
      y = 0;
      break;
    case 'top-right':
      x = excessX;
      y = 0;
      break;
    case 'bottom-left':
      x = 0;
      y = excessY;
      break;
    case 'bottom-right':
      x = excessX;
      y = excessY;
      break;
  }

  return { x: Math.round(x), y: Math.round(y) };
}

/**
 * Calculates the smart crop analysis comparing direct snap vs max fit
 */
export function analyzeSmartCrop(
  sourceWidth: number,
  sourceHeight: number,
  preset: StandardPreset,
  anchor: AnchorPosition = 'center',
  selectedMultipleIndex = 0
): SmartCropAnalysis {
  const targetW =
    preset.multiples && preset.multiples[selectedMultipleIndex]
      ? preset.multiples[selectedMultipleIndex].width
      : preset.standardWidth;
  const targetH =
    preset.multiples && preset.multiples[selectedMultipleIndex]
      ? preset.multiples[selectedMultipleIndex].height
      : preset.standardHeight;

  const sourceRatio = sourceWidth / sourceHeight;
  const targetRatio = targetW / targetH;

  // 1. Direct Snap Strategy (Directly taking targetW x targetH from source if source is large enough)
  const canDirectSnap = sourceWidth >= targetW && sourceHeight >= targetH;
  const directOffsets = getAnchorOffsets(sourceWidth, sourceHeight, targetW, targetH, anchor);
  const directSnapCrop: CropRect = {
    x: directOffsets.x,
    y: directOffsets.y,
    width: targetW,
    height: targetH,
  };
  const directSnapTrimX = sourceWidth - targetW;
  const directSnapTrimY = sourceHeight - targetH;

  // 2. Max Fit Strategy (Max field of view at exact target ratio inside source)
  let maxFitW: number;
  let maxFitH: number;

  if (sourceRatio > targetRatio) {
    // Source is wider than target: fit height completely, crop width
    maxFitH = sourceHeight;
    maxFitW = sourceHeight * targetRatio;
  } else {
    // Source is taller than target: fit width completely, crop height
    maxFitW = sourceWidth;
    maxFitH = sourceWidth / targetRatio;
  }

  maxFitW = Math.round(maxFitW);
  maxFitH = Math.round(maxFitH);

  const maxFitOffsets = getAnchorOffsets(sourceWidth, sourceHeight, maxFitW, maxFitH, anchor);
  const maxFitSourceCrop: CropRect = {
    x: maxFitOffsets.x,
    y: maxFitOffsets.y,
    width: maxFitW,
    height: maxFitH,
  };

  const maxFitScaleFactor = targetW / maxFitW;

  // Recommendation & Explanation
  let recommendedMode: CropStrategyMode = 'direct_snap';
  let explanation = '';
  let reductionSummary = '';

  const isVeryCloseToStandard =
    canDirectSnap &&
    (directSnapTrimX < sourceWidth * 0.15 || directSnapTrimY < sourceHeight * 0.15);

  if (canDirectSnap && isVeryCloseToStandard) {
    recommendedMode = 'direct_snap';
    explanation = `Source (${sourceWidth}×${sourceHeight}) is slightly larger than standard ${targetW}×${targetH}. Direct pixel crop of exactly ${targetW}×${targetH} trims only ${directSnapTrimX}px width and ${directSnapTrimY}px height without any scaling blur.`;
    reductionSummary = `Trim ${directSnapTrimX}px W & ${directSnapTrimY}px H → Exact ${targetW}×${targetH}px (1:1 0% scaling blur)`;
  } else if (sourceWidth >= targetW && sourceHeight >= targetH) {
    recommendedMode = 'max_fit_scaled';
    explanation = `Captures the maximal possible ${preset.ratioStr} area (${maxFitW}×${maxFitH}px) and resamples cleanly down to standard ${targetW}×${targetH}px for maximum field of view.`;
    reductionSummary = `Max Area Crop (${maxFitW}×${maxFitH}) → Scaled to ${targetW}×${targetH}px (${Math.round((maxFitScaleFactor) * 100)}% scale)`;
  } else {
    recommendedMode = 'max_fit_native';
    explanation = `Source image (${sourceWidth}×${sourceHeight}) is smaller than standard ${targetW}×${targetH}. Maximal crop yields native ${maxFitW}×${maxFitH}px at exact ${preset.ratioStr} ratio.`;
    reductionSummary = `Native Ratio Crop (${maxFitW}×${maxFitH}px) → Upscalable to ${targetW}×${targetH}px`;
  }

  return {
    sourceWidth,
    sourceHeight,
    sourceRatio,
    targetRatio,
    targetStandardWidth: targetW,
    targetStandardHeight: targetH,
    canDirectSnap,
    directSnapCrop,
    directSnapTrimX,
    directSnapTrimY,
    maxFitSourceCrop,
    maxFitScaleFactor,
    recommendedMode,
    explanation,
    reductionSummary,
  };
}

/**
 * Format bytes to readable string (e.g. 2.4 MB)
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
