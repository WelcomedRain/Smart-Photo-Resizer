import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Layers,
  Sparkles,
  CheckCircle2,
  Loader2,
  FileArchive,
  Eye,
} from 'lucide-react';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { STANDARD_PRESETS, analyzeSmartCrop } from '../utils/cropMath';
import { StandardPreset, AnchorPosition } from '../types';

interface BatchGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  anchor: AnchorPosition;
}

interface RenderedCropItem {
  preset: StandardPreset;
  targetWidth: number;
  targetHeight: number;
  cropX: number;
  cropY: number;
  cropW: number;
  cropH: number;
  previewDataUrl: string;
  blob?: Blob;
}

export const BatchGeneratorModal: React.FC<BatchGeneratorModalProps> = ({
  isOpen,
  onClose,
  imageSrc,
  imageNaturalWidth,
  imageNaturalHeight,
  anchor,
}) => {
  const [items, setItems] = useState<RenderedCropItem[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(true);
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipProgress, setZipProgress] = useState<number>(0);

  // Generate previews whenever modal opens
  useEffect(() => {
    if (!isOpen || !imageSrc) return;

    let isMounted = true;
    setIsGenerating(true);

    const generateBatch = async () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = imageSrc;
      await new Promise((res) => {
        img.onload = res;
      });

      const batchPresets = STANDARD_PRESETS.slice(0, 8); // Top 8 standard sizes
      const renderedList: RenderedCropItem[] = [];

      for (const preset of batchPresets) {
        const analysis = analyzeSmartCrop(
          imageNaturalWidth,
          imageNaturalHeight,
          preset,
          anchor
        );

        // Decide crop rect
        const cropRect =
          analysis.canDirectSnap && analysis.recommendedMode === 'direct_snap'
            ? analysis.directSnapCrop
            : analysis.maxFitSourceCrop;

        // Render to canvas
        const canvas = document.createElement('canvas');
        canvas.width = analysis.targetStandardWidth;
        canvas.height = analysis.targetStandardHeight;
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(
            img,
            cropRect.x,
            cropRect.y,
            cropRect.width,
            cropRect.height,
            0,
            0,
            canvas.width,
            canvas.height
          );

          // Get preview thumbnail & blob
          const previewDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          const blob = await new Promise<Blob | undefined>((res) =>
            canvas.toBlob((b) => res(b || undefined), 'image/jpeg', 0.92)
          );

          renderedList.push({
            preset,
            targetWidth: canvas.width,
            targetHeight: canvas.height,
            cropX: cropRect.x,
            cropY: cropRect.y,
            cropW: cropRect.width,
            cropH: cropRect.height,
            previewDataUrl,
            blob,
          });
        }
      }

      if (isMounted) {
        setItems(renderedList);
        setIsGenerating(false);
      }
    };

    generateBatch();

    return () => {
      isMounted = false;
    };
  }, [isOpen, imageSrc, imageNaturalWidth, imageNaturalHeight, anchor]);

  if (!isOpen) return null;

  /**
   * Download single preset
   */
  const handleDownloadSingle = (item: RenderedCropItem) => {
    if (!item.blob) return;
    const url = URL.createObjectURL(item.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.preset.id}_${item.targetWidth}x${item.targetHeight}.jpg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Package all into ZIP archive
   */
  const handleDownloadZip = async () => {
    try {
      setIsZipping(true);
      setZipProgress(10);
      const zip = new JSZip();
      const folder = zip.folder('standard_cropped_images');

      items.forEach((item, index) => {
        if (item.blob && folder) {
          const filename = `${String(index + 1).padStart(2, '0')}_${item.preset.ratioStr.replace(':', 'x')}_${item.targetWidth}x${item.targetHeight}.jpg`;
          folder.file(filename, item.blob);
        }
      });

      setZipProgress(50);
      const zipContent = await zip.generateAsync({ type: 'blob' }, (metadata) => {
        setZipProgress(50 + Math.round(metadata.percent * 0.45));
      });

      const url = URL.createObjectURL(zipContent);
      const a = document.createElement('a');
      a.href = url;
      a.download = `standard_crops_${imageNaturalWidth}x${imageNaturalHeight}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsZipping(false);
      setZipProgress(100);

      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.7 },
        });
      } catch {
        // ignore
      }
    } catch (err) {
      console.error('ZIP generation failed:', err);
      setIsZipping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 flex items-center gap-2">
                Batch Multi-Crop Generator
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {items.length} Standard Formats
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Source: {imageNaturalWidth} × {imageNaturalHeight} px • Auto-calculated with {anchor} anchor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadZip}
              disabled={isGenerating || isZipping || items.length === 0}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isZipping ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Zipping ({zipProgress}%)...</span>
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4" />
                  <span>Download All as ZIP (.zip)</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Grid of Standard Crops */}
        <div className="flex-1 overflow-y-auto p-6 bg-neutral-950/60">
          {isGenerating ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
              <p className="text-sm font-medium text-neutral-300">
                Calculating and rendering all standard size crops...
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.preset.id}
                  className="bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden shadow-md flex flex-col justify-between transition-all group"
                >
                  {/* Thumbnail Preview container */}
                  <div className="relative bg-black flex items-center justify-center p-3 h-48 overflow-hidden">
                    {item.previewDataUrl ? (
                      <img
                        src={item.previewDataUrl}
                        alt={item.preset.name}
                        className="max-h-full max-w-full object-contain rounded shadow"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">
                        Rendering...
                      </div>
                    )}

                    {/* Top Aspect Ratio Tag */}
                    <div className="absolute top-2 left-2 bg-neutral-900/90 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono font-bold text-white border border-neutral-700 shadow">
                      {item.preset.ratioStr}
                    </div>

                    {/* Quick Download Overlay Button */}
                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      title="Download this crop"
                      className="absolute bottom-2 right-2 p-1.5 rounded-lg bg-indigo-600 text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-500"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Card Details */}
                  <div className="p-3 bg-neutral-900/90 border-t border-neutral-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-neutral-200 line-clamp-1">
                        {item.preset.name}
                      </h4>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-emerald-400 font-medium">
                        {item.targetWidth} × {item.targetHeight} px
                      </span>
                      <span className="text-neutral-500">
                        {item.preset.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadSingle(item)}
                      className="w-full mt-1 py-1.5 px-2 rounded-lg bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 hover:text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Download className="w-3 h-3 text-indigo-400" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-neutral-800 bg-neutral-950 flex items-center justify-between text-xs text-neutral-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              All crops are auto-centered or anchored cleanly to prevent pixel interpolation distortion.
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
