export type AspectRatioId =
  | '9:16'
  | '16:9'
  | '1:1'
  | '4:5'
  | '3:2'
  | '2:3'
  | '4:3'
  | '3:4'
  | '21:9'
  | '3:1'
  | 'custom';

export interface StandardPreset {
  id: string;
  name: string;
  category: 'Social' | 'Video' | 'Photography' | 'Display' | 'Custom';
  ratioStr: string;
  ratioWidth: number;
  ratioHeight: number;
  standardWidth: number;
  standardHeight: number;
  description: string;
  popularUses: string[];
  multiples?: { label: string; width: number; height: number }[];
}

export type AnchorPosition =
  | 'center'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right';

export type CropStrategyMode =
  | 'direct_snap' // User's requested: trim minimal pixels directly to standard base resolution (e.g., 1090x2000 -> 1080x1920 crop window)
  | 'max_fit_scaled' // Crop maximal possible 9:16 area inside source, then downscale/resample cleanly to standard 1080x1920
  | 'max_fit_native' // Crop maximal possible 9:16 area and keep native pixels (e.g., 1090 x 1938)
  | 'fit_letterbox'; // Scale entire image to fit inside target and pad background (blur or solid)

export interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SmartCropAnalysis {
  sourceWidth: number;
  sourceHeight: number;
  sourceRatio: number;
  targetRatio: number;
  targetStandardWidth: number;
  targetStandardHeight: number;
  
  // Direct snap strategy (Direct pixel trim without scaling blur)
  canDirectSnap: boolean; // if source >= standard width & height
  directSnapCrop: CropRect;
  directSnapTrimX: number; // pixels trimmed
  directSnapTrimY: number;
  
  // Max fit strategy (Max field of view)
  maxFitSourceCrop: CropRect;
  maxFitScaleFactor: number;
  
  // Recommendation
  recommendedMode: CropStrategyMode;
  explanation: string;
  reductionSummary: string;
}

export interface ImageMetadata {
  name: string;
  sizeBytes: number;
  type: string;
  width: number;
  height: number;
  aspectRatio: string;
  url: string;
}
