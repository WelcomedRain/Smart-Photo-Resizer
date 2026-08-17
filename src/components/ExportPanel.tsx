import React, { useState } from 'react';
import {
  Download,
  Copy,
  Check,
  FileImage,
  Sparkles,
  Zap,
  Sliders,
  Layers,
} from 'lucide-react';
import { CropRect, CropStrategyMode, StandardPreset } from '../types';
import confetti from 'canvas-confetti';

interface ExportPanelProps {
  imageSrc: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  cropBox: CropRect;
  selectedPreset: StandardPreset;
  strategyMode: CropStrategyMode;
  targetWidth: number;
  targetHeight: number;
  rotation: number;
  flipH: boolean;
  flipV: boolean;
  onOpenBatchModal: () => void;
}

export const ExportPanel: React.FC<ExportPanelProps> = ({
  imageSrc,
  imageNaturalWidth,
  imageNaturalHeight,
  cropBox,
  selectedPreset,
  strategyMode,
  targetWidth,
  targetHeight,
  rotation,
  flipH,
  flipV,
  onOpenBatchModal,
}) => {
  const [format, setFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/png');
  const [quality, setQuality] = useState<number>(0.92);
  const [scaleMultiplier, setScaleMultiplier] = useState<number>(1);
  const [sizeMode, setSizeMode] = useState<'preset' | 'native' | 'custom'>('preset');
  const [customWidth, setCustomWidth] = useState<string>('');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // The locked ratio of the selected standard, used to derive the second side
  const ratio = targetWidth / targetHeight;

  // Actual pixels available in the crop box — exporting larger than this upscales
  const nativeWidth = Math.max(1, Math.round(cropBox.width));
  const nativeHeight = Math.max(1, Math.round(cropBox.height));

  // Compute final exported pixel dimensions
  let finalWidth: number;
  let finalHeight: number;
  if (sizeMode === 'native') {
    finalWidth = nativeWidth;
    finalHeight = nativeHeight;
  } else if (sizeMode === 'custom') {
    const parsed = parseInt(customWidth, 10);
    finalWidth = Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, 20000) : targetWidth;
    finalHeight = Math.max(1, Math.round(finalWidth / ratio));
  } else {
    finalWidth = Math.round(targetWidth * scaleMultiplier);
    finalHeight = Math.round(targetHeight * scaleMultiplier);
  }

  // How far the export is being scaled past the real pixels in the crop
  const upscaleFactor = finalWidth / nativeWidth;
  const isUpscaling = upscaleFactor > 1.01;

  /**
   * Render high-resolution canvas with transforms, cropping, and smart letterbox
   */
  const renderExportCanvas = (): Promise<HTMLCanvasElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Enable high-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        if (strategyMode === 'fit_letterbox') {
          // 1. Draw blurred background
          ctx.save();
          ctx.filter = 'blur(20px)';
          ctx.drawImage(img, -20, -20, finalWidth + 40, finalHeight + 40);
          ctx.restore();

          // Dark semi-transparent tint
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillRect(0, 0, finalWidth, finalHeight);

          // 2. Draw centered fitted image with transforms
          const imgRatio = imageNaturalWidth / imageNaturalHeight;
          const targetRatio = finalWidth / finalHeight;
          let drawW = finalWidth;
          let drawH = finalHeight;

          if (imgRatio > targetRatio) {
            drawW = finalWidth;
            drawH = finalWidth / imgRatio;
          } else {
            drawH = finalHeight;
            drawW = finalHeight * imgRatio;
          }

          const drawX = (finalWidth - drawW) / 2;
          const drawY = (finalHeight - drawH) / 2;

          ctx.save();
          ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        } else {
          // Direct crop / Max area crop
          // Create an offscreen buffer canvas to handle rotation & flips first if any
          const bufferCanvas = document.createElement('canvas');
          bufferCanvas.width = imageNaturalWidth;
          bufferCanvas.height = imageNaturalHeight;
          const bufCtx = bufferCanvas.getContext('2d');
          if (bufCtx) {
            bufCtx.imageSmoothingEnabled = true;
            bufCtx.imageSmoothingQuality = 'high';
            bufCtx.save();
            bufCtx.translate(imageNaturalWidth / 2, imageNaturalHeight / 2);
            bufCtx.rotate((rotation * Math.PI) / 180);
            bufCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            bufCtx.drawImage(
              img,
              -imageNaturalWidth / 2,
              -imageNaturalHeight / 2,
              imageNaturalWidth,
              imageNaturalHeight
            );
            bufCtx.restore();

            // Draw cropped rectangle from buffer to final canvas
            ctx.drawImage(
              bufferCanvas,
              cropBox.x,
              cropBox.y,
              cropBox.width,
              cropBox.height,
              0,
              0,
              finalWidth,
              finalHeight
            );
          }
        }

        resolve(canvas);
      };
      img.onerror = (err) => reject(err);
      img.src = imageSrc;
    });
  };

  /**
   * Handle download
   */
  const handleDownload = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderExportCanvas();
      const extension = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
      const filename = `crop_${selectedPreset.ratioStr.replace(':', 'x')}_${finalWidth}x${finalHeight}.${extension}`;

      canvas.toBlob(
        (blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          setIsExporting(false);

          // Confetti celebration
          try {
            confetti({
              particleCount: 40,
              spread: 60,
              origin: { y: 0.85 },
            });
          } catch {
            // ignore
          }
        },
        format,
        quality
      );
    } catch (e) {
      console.error('Export failed:', e);
      setIsExporting(false);
    }
  };

  /**
   * Handle Copy to clipboard
   */
  const handleCopyClipboard = async () => {
    try {
      setIsExporting(true);
      const canvas = await renderExportCanvas();
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        try {
          // Clipboard Item requires image/png
          if (blob.type !== 'image/png') {
            // re-render as png for clipboard
            canvas.toBlob(async (pngBlob) => {
              if (pngBlob) {
                await navigator.clipboard.write([
                  new ClipboardItem({ 'image/png': pngBlob }),
                ]);
                setCopied(true);
                setTimeout(() => setCopied(false), 2500);
              }
            }, 'image/png');
          } else {
            await navigator.clipboard.write([
              new ClipboardItem({ 'image/png': blob }),
            ]);
            setCopied(true);
            setTimeout(() => setCopied(false), 2500);
          }
        } catch (clipErr) {
          console.warn('Clipboard write error:', clipErr);
        } finally {
          setIsExporting(false);
        }
      }, 'image/png');
    } catch (e) {
      console.error('Copy failed:', e);
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
          <FileImage className="w-4 h-4 text-indigo-400" />
          Export & Deliver
        </h3>
        <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          {finalWidth} × {finalHeight} px
        </span>
      </div>

      {/* Format Selection & Resolution Multiplier */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Format Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
            File Format
          </label>
          <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {(
              [
                { id: 'image/png', label: 'PNG' },
                { id: 'image/jpeg', label: 'JPEG' },
                { id: 'image/webp', label: 'WebP' },
              ] as const
            ).map((fmt) => (
              <button
                key={fmt.id}
                type="button"
                onClick={() => setFormat(fmt.id)}
                className={`py-1 text-xs font-semibold rounded-md transition-all ${
                  format === fmt.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {fmt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Output Size: standard multiples, native crop pixels, or a custom size */}
        <div className="space-y-1.5">
          <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
            Output Size
          </label>
          <div className="grid grid-cols-3 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            {[
              { mult: 1, label: '1× Standard' },
              { mult: 2, label: '2× Retina' },
              { mult: 0.5, label: '0.5× Fast' },
            ].map((s) => (
              <button
                key={s.mult}
                type="button"
                onClick={() => {
                  setScaleMultiplier(s.mult);
                  setSizeMode('preset');
                }}
                className={`py-1 text-xs font-semibold rounded-md transition-all ${
                  sizeMode === 'preset' && scaleMultiplier === s.mult
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800">
            <button
              type="button"
              onClick={() => setSizeMode('native')}
              title={`Export the crop's real pixels (${nativeWidth} × ${nativeHeight}) with no resampling`}
              className={`py-1 text-xs font-semibold rounded-md transition-all ${
                sizeMode === 'native'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Native ({nativeWidth}×{nativeHeight})
            </button>
            <button
              type="button"
              onClick={() => {
                setSizeMode('custom');
                if (!customWidth) setCustomWidth(String(nativeWidth));
              }}
              className={`py-1 text-xs font-semibold rounded-md transition-all ${
                sizeMode === 'custom'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Custom Size
            </button>
          </div>

          {/* Linked width/height fields — ratio stays locked to the standard */}
          {sizeMode === 'custom' && (
            <div className="flex items-center gap-2 pt-0.5">
              <div className="flex-1">
                <label className="text-[10px] text-neutral-500 block mb-0.5">Width</label>
                <input
                  type="number"
                  min={1}
                  value={customWidth}
                  onChange={(e) => setCustomWidth(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-2 py-1 text-xs font-mono text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <span className="text-neutral-600 text-xs pt-4">×</span>
              <div className="flex-1">
                <label className="text-[10px] text-neutral-500 block mb-0.5">Height</label>
                <input
                  type="number"
                  min={1}
                  value={finalHeight}
                  onChange={(e) => {
                    const h = parseInt(e.target.value, 10);
                    if (Number.isFinite(h) && h > 0) {
                      setCustomWidth(String(Math.max(1, Math.round(h * ratio))));
                    }
                  }}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-md px-2 py-1 text-xs font-mono text-neutral-100 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Honest readout: what the ratio actually rounds to, and any upscaling */}
          <div className="flex items-center justify-between text-[10px] font-mono pt-0.5">
            <span className="text-neutral-500">
              {(finalWidth / finalHeight).toFixed(4)} : 1 ({selectedPreset.ratioStr})
            </span>
            <span className={isUpscaling ? 'text-amber-400' : 'text-emerald-400'}>
              {isUpscaling
                ? `${upscaleFactor.toFixed(2)}× upscale from native`
                : `${upscaleFactor.toFixed(2)}× of native — no invented pixels`}
            </span>
          </div>
        </div>
      </div>

      {/* JPEG / WebP Quality Slider */}
      {format !== 'image/png' && (
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">Compression Quality:</span>
            <span className="font-mono text-neutral-200 font-bold">
              {Math.round(quality * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0.5}
            max={1}
            step={0.01}
            value={quality}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
          />
        </div>
      )}

      {/* Main Action Buttons */}
      <div className="pt-2 space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {/* Download Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={isExporting || !imageSrc}
            className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            {isExporting ? 'Processing...' : 'Download Image'}
          </button>

          {/* Copy to Clipboard */}
          <button
            type="button"
            onClick={handleCopyClipboard}
            disabled={isExporting || !imageSrc}
            className="w-full py-2.5 px-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 active:scale-[0.98] text-neutral-200 font-semibold text-sm border border-neutral-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-neutral-400" />
                <span>Copy Image</span>
              </>
            )}
          </button>
        </div>

        {/* Batch Export All Standards button */}
        <button
          type="button"
          onClick={onOpenBatchModal}
          disabled={!imageSrc}
          className="w-full py-2 px-3 rounded-lg bg-neutral-950 hover:bg-neutral-800/80 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:hover:bg-neutral-950 disabled:hover:text-neutral-300"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>Batch Generate All Social Standards (9:16, 1:1, 16:9, 4:5...)</span>
        </button>
      </div>
    </div>
  );
};
