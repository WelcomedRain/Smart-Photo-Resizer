import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  RotateCcw,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  ZoomIn,
  ZoomOut,
  Maximize,
  Maximize2,
  Grid,
  Eye,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { CropRect, StandardPreset, CropStrategyMode } from '../types';
import { getAnchorOffsets } from '../utils/cropMath';

interface CropCanvasProps {
  imageSrc: string;
  imageNaturalWidth: number;
  imageNaturalHeight: number;
  cropBox: CropRect;
  onCropChange: (rect: CropRect) => void;
  preset: StandardPreset;
  strategyMode: CropStrategyMode;
  targetWidth: number;
  targetHeight: number;
  rotation: number;
  onRotationChange: (deg: number) => void;
  flipH: boolean;
  onFlipHChange: (flip: boolean) => void;
  flipV: boolean;
  onFlipVChange: (flip: boolean) => void;
}

export const CropCanvas: React.FC<CropCanvasProps> = ({
  imageSrc,
  imageNaturalWidth,
  imageNaturalHeight,
  cropBox,
  onCropChange,
  preset,
  strategyMode,
  targetWidth,
  targetHeight,
  rotation,
  onRotationChange,
  flipH,
  onFlipHChange,
  flipV,
  onFlipVChange,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 600, height: 500 });
  const [viewMode, setViewMode] = useState<'fit_crop' | 'fit_image'>('fit_crop');
  const [showGrid, setShowGrid] = useState(true);
  const [isLivePreview, setIsLivePreview] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Interaction dragging states
  const [isDraggingBox, setIsDraggingBox] = useState(false);
  const [activeHandle, setActiveHandle] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialBoxOnDrag, setInitialBoxOnDrag] = useState<CropRect>(cropBox);

  // Measure container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect) {
          setContainerSize({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Compute display scaling to maximize crop box within container
  const padding = 24;
  const availWidth = Math.max(100, containerSize.width - padding * 2);
  const availHeight = Math.max(100, containerSize.height - padding * 2);

  // Base scale fits entire source image
  const fitImageScale = Math.min(
    availWidth / (imageNaturalWidth || 1),
    availHeight / (imageNaturalHeight || 1)
  );

  // Crop-focused scale maximizes the crop box itself to fill available viewport space
  const fitCropScale = Math.min(
    availWidth / (cropBox.width || 1),
    availHeight / (cropBox.height || 1)
  );

  const activeBaseScale = viewMode === 'fit_crop' ? fitCropScale : fitImageScale;
  const scaleFactor = (activeBaseScale > 0 ? activeBaseScale : 1) * zoomLevel;

  const displayWidth = imageNaturalWidth * scaleFactor;
  const displayHeight = imageNaturalHeight * scaleFactor;
  const boxDisplayWidth = cropBox.width * scaleFactor;
  const boxDisplayHeight = cropBox.height * scaleFactor;

  // Screen coordinates for positioning
  let boxScreenLeft: number;
  let boxScreenTop: number;
  let imageScreenLeft: number;
  let imageScreenTop: number;

  if (viewMode === 'fit_crop') {
    // In Maximized Crop mode: center the crop box in the viewport container
    boxScreenLeft = (containerSize.width - boxDisplayWidth) / 2;
    boxScreenTop = (containerSize.height - boxDisplayHeight) / 2;
    imageScreenLeft = boxScreenLeft - cropBox.x * scaleFactor;
    imageScreenTop = boxScreenTop - cropBox.y * scaleFactor;
  } else {
    // In Fit Image mode: center the entire source image in the viewport container
    imageScreenLeft = (containerSize.width - displayWidth) / 2;
    imageScreenTop = (containerSize.height - displayHeight) / 2;
    boxScreenLeft = imageScreenLeft + cropBox.x * scaleFactor;
    boxScreenTop = imageScreenTop + cropBox.y * scaleFactor;
  }

  // Maximize crop to full available dimension bounds within image
  const handleMaximizeCrop = () => {
    const targetRatio = preset.ratioWidth / preset.ratioHeight;
    const sourceRatio = imageNaturalWidth / imageNaturalHeight;
    let maxW: number;
    let maxH: number;
    if (sourceRatio > targetRatio) {
      maxH = imageNaturalHeight;
      maxW = maxH * targetRatio;
    } else {
      maxW = imageNaturalWidth;
      maxH = maxW / targetRatio;
    }
    maxW = Math.round(maxW);
    maxH = Math.round(maxH);
    const offsets = getAnchorOffsets(imageNaturalWidth, imageNaturalHeight, maxW, maxH, 'center');
    onCropChange({
      x: offsets.x,
      y: offsets.y,
      width: maxW,
      height: maxH,
    });
  };

  // Dragging crop box or resizing
  const handlePointerDown = (e: React.PointerEvent, handleType: string | null = null) => {
    e.preventDefault();
    e.stopPropagation();
    setDragStart({ x: e.clientX, y: e.clientY });
    setInitialBoxOnDrag({ ...cropBox });

    if (handleType) {
      setActiveHandle(handleType);
    } else {
      setIsDraggingBox(true);
    }
  };

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!isDraggingBox && !activeHandle) return;

      const deltaScreenX = e.clientX - dragStart.x;
      const deltaScreenY = e.clientY - dragStart.y;

      const deltaImgX = deltaScreenX / scaleFactor;
      const deltaImgY = deltaScreenY / scaleFactor;

      if (isDraggingBox) {
        // Move whole crop box within image bounds
        let newX = initialBoxOnDrag.x + deltaImgX;
        let newY = initialBoxOnDrag.y + deltaImgY;

        newX = Math.max(0, Math.min(imageNaturalWidth - initialBoxOnDrag.width, newX));
        newY = Math.max(0, Math.min(imageNaturalHeight - initialBoxOnDrag.height, newY));

        onCropChange({
          x: Math.round(newX),
          y: Math.round(newY),
          width: initialBoxOnDrag.width,
          height: initialBoxOnDrag.height,
        });
      } else if (activeHandle) {
        // Resize crop box while maintaining target aspect ratio
        const ratio = preset.ratioWidth / preset.ratioHeight;
        let newW = initialBoxOnDrag.width;
        let newH = initialBoxOnDrag.height;
        let newX = initialBoxOnDrag.x;
        let newY = initialBoxOnDrag.y;

        if (activeHandle.includes('right')) {
          newW = Math.max(50, initialBoxOnDrag.width + deltaImgX);
          newH = newW / ratio;
        } else if (activeHandle.includes('left')) {
          newW = Math.max(50, initialBoxOnDrag.width - deltaImgX);
          newH = newW / ratio;
          newX = initialBoxOnDrag.x + (initialBoxOnDrag.width - newW);
        } else if (activeHandle.includes('bottom')) {
          newH = Math.max(50, initialBoxOnDrag.height + deltaImgY);
          newW = newH * ratio;
        } else if (activeHandle.includes('top')) {
          newH = Math.max(50, initialBoxOnDrag.height - deltaImgY);
          newW = newH * ratio;
          newY = initialBoxOnDrag.y + (initialBoxOnDrag.height - newH);
        }

        // Clamp to image dimensions
        if (newX < 0) {
          newW += newX;
          newX = 0;
          newH = newW / ratio;
        }
        if (newY < 0) {
          newH += newY;
          newY = 0;
          newW = newH * ratio;
        }
        if (newX + newW > imageNaturalWidth) {
          newW = imageNaturalWidth - newX;
          newH = newW / ratio;
        }
        if (newY + newH > imageNaturalHeight) {
          newH = imageNaturalHeight - newY;
          newW = newH * ratio;
        }

        onCropChange({
          x: Math.round(newX),
          y: Math.round(newY),
          width: Math.round(newW),
          height: Math.round(newH),
        });
      }
    },
    [
      isDraggingBox,
      activeHandle,
      dragStart,
      initialBoxOnDrag,
      scaleFactor,
      imageNaturalWidth,
      imageNaturalHeight,
      preset,
      onCropChange,
    ]
  );

  const handlePointerUp = useCallback(() => {
    setIsDraggingBox(false);
    setActiveHandle(null);
  }, []);

  useEffect(() => {
    if (isDraggingBox || activeHandle) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDraggingBox, activeHandle, handlePointerMove, handlePointerUp]);

  return (
    <div className="flex flex-col h-full bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-neutral-950/90 border-b border-neutral-800 gap-2">
        {/* Left tools: Mode toggle & View mode */}
        <div className="flex items-center gap-2">
          <div className="flex bg-neutral-900 rounded-lg p-0.5 border border-neutral-800">
            <button
              type="button"
              onClick={() => setIsLivePreview(false)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                !isLivePreview
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Editor Overlay
            </button>
            <button
              type="button"
              onClick={() => setIsLivePreview(true)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                isLivePreview
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Cropped Output Preview
            </button>
          </div>

          <button
            type="button"
            onClick={() => setViewMode(viewMode === 'fit_crop' ? 'fit_image' : 'fit_crop')}
            title={
              viewMode === 'fit_crop'
                ? 'Maximized Crop View: Crop field expands to fill the full container. Click to switch to Full Photo view.'
                : 'Full Photo View: Scales entire photo into frame. Click to switch to Maximized Crop view.'
            }
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all flex items-center gap-1.5 ${
              viewMode === 'fit_crop'
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-sm'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">
              {viewMode === 'fit_crop' ? 'Maximized Crop' : 'Fit Photo'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowGrid(!showGrid)}
            title="Toggle Rule of Thirds Grid"
            className={`p-1.5 rounded-lg border text-xs transition-colors flex items-center gap-1 ${
              showGrid
                ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">3×3 Grid</span>
          </button>

          {!isLivePreview && (
            <button
              type="button"
              onClick={handleMaximizeCrop}
              title="Expand Crop Box to Image Edges"
              className="p-1.5 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs transition-colors flex items-center gap-1"
            >
              <Maximize className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">Expand to Image</span>
            </button>
          )}
        </div>

        {/* Right transform tools: Rotate, Flip, Zoom */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onRotationChange((rotation - 90 + 360) % 360)}
            title="Rotate Left 90°"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onRotationChange((rotation + 90) % 360)}
            title="Rotate Right 90°"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onFlipHChange(!flipH)}
            title="Flip Horizontally"
            className={`p-1.5 rounded-lg border transition-colors ${
              flipH
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onFlipVChange(!flipV)}
            title="Flip Vertically"
            className={`p-1.5 rounded-lg border transition-colors ${
              flipV
                ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                : 'bg-neutral-900 hover:bg-neutral-800 border-neutral-800 text-neutral-300'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-800 mx-1" />

          {/* Zoom controls */}
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
            disabled={zoomLevel <= 0.5}
            title="Zoom Out"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-mono text-neutral-400 w-10 text-center">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
            disabled={zoomLevel >= 2.5}
            title="Zoom In"
            className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 disabled:opacity-40"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          {zoomLevel !== 1 && (
            <button
              type="button"
              onClick={() => setZoomLevel(1)}
              title="Reset Zoom"
              className="p-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300"
            >
              <Maximize className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Main Canvas Viewport */}
      <div
        ref={containerRef}
        className="flex-1 w-full relative flex items-center justify-center bg-neutral-950 overflow-hidden select-none min-h-[480px]"
      >
        {/* Subtle checkered transparent background pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px)`,
            backgroundSize: '16px 16px',
          }}
        />

        {isLivePreview ? (
          /* Live Cropped Result View */
          <div className="relative flex flex-col items-center justify-center max-w-full max-h-full">
            <div
              className="relative shadow-2xl rounded border border-neutral-700 overflow-hidden bg-black"
              style={{
                width: `${Math.min(availWidth, (cropBox.width / (cropBox.height || 1)) * availHeight)}px`,
                height: `${Math.min(availHeight, (cropBox.height / (cropBox.width || 1)) * availWidth)}px`,
              }}
            >
              {strategyMode === 'fit_letterbox' ? (
                /* Letterboxed with blurred backdrop */
                <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                  {imageSrc ? (
                    <>
                      <img
                        src={imageSrc}
                        alt="Backdrop blur"
                        className="absolute inset-0 w-full h-full object-cover blur-xl opacity-60 scale-125"
                      />
                      <img
                        src={imageSrc}
                        alt="Letterboxed preview"
                        className="relative max-w-full max-h-full object-contain z-10"
                        style={{
                          transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                        }}
                      />
                    </>
                  ) : null}
                </div>
              ) : (
                /* Crisp cropped preview using CSS background-position matching the cropBox */
                imageSrc ? (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundImage: `url(${imageSrc})`,
                      backgroundPosition: `-${(cropBox.x / (imageNaturalWidth || 1)) * (imageNaturalWidth / cropBox.width) * 100}% -${(cropBox.y / (imageNaturalHeight || 1)) * (imageNaturalHeight / cropBox.height) * 100}%`,
                      backgroundSize: `${(imageNaturalWidth / cropBox.width) * 100}% ${(imageNaturalHeight / cropBox.height) * 100}%`,
                      backgroundRepeat: 'no-repeat',
                      transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                    }}
                  />
                ) : null
              )}

              {/* Resolution Watermark Badge */}
              <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-lg">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                <span>{targetWidth} × {targetHeight} px ({preset.ratioStr})</span>
              </div>
            </div>
          </div>
        ) : (
          /* Interactive Edit Canvas with Maximized Crop Box & Full Stage Utilization */
          <div className="absolute inset-0 overflow-hidden select-none flex items-center justify-center">
            {/* Base Image Positioned according to screen offsets */}
            {imageSrc ? (
              <img
                src={imageSrc}
                alt="Source preview"
                draggable={false}
                className="absolute block pointer-events-none select-none max-w-none max-h-none transition-[left,top,width,height] duration-75"
                style={{
                  left: `${imageScreenLeft}px`,
                  top: `${imageScreenTop}px`,
                  width: `${displayWidth}px`,
                  height: `${displayHeight}px`,
                  transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`,
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-400 text-xs">
                Preparing image...
              </div>
            )}

            {/* Dark Mask Dimming Out-of-Bounds Areas */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {/* Top mask */}
              <div
                className="absolute top-0 left-0 right-0 bg-neutral-950/80 backdrop-blur-[1px]"
                style={{ height: `${Math.max(0, boxScreenTop)}px` }}
              />
              {/* Bottom mask */}
              <div
                className="absolute left-0 right-0 bottom-0 bg-neutral-950/80 backdrop-blur-[1px]"
                style={{ top: `${boxScreenTop + boxDisplayHeight}px`, bottom: 0 }}
              />
              {/* Left mask */}
              <div
                className="absolute left-0 bg-neutral-950/80 backdrop-blur-[1px]"
                style={{
                  top: `${boxScreenTop}px`,
                  height: `${boxDisplayHeight}px`,
                  width: `${Math.max(0, boxScreenLeft)}px`,
                }}
              />
              {/* Right mask */}
              <div
                className="absolute right-0 bg-neutral-950/80 backdrop-blur-[1px]"
                style={{
                  top: `${boxScreenTop}px`,
                  height: `${boxDisplayHeight}px`,
                  left: `${boxScreenLeft + boxDisplayWidth}px`,
                  right: 0,
                }}
              />
            </div>

            {/* Draggable & Resizable Active Crop Box */}
            <div
              onPointerDown={(e) => handlePointerDown(e, null)}
              className="absolute border-2 border-indigo-400 shadow-[0_0_0_1px_rgba(255,255,255,0.4),0_0_24px_rgba(99,102,241,0.35)] cursor-move transition-shadow hover:border-indigo-300"
              style={{
                left: `${boxScreenLeft}px`,
                top: `${boxScreenTop}px`,
                width: `${boxDisplayWidth}px`,
                height: `${boxDisplayHeight}px`,
              }}
            >
              {/* Floating Pixel Dimensions HUD Badge */}
              <div className="absolute -top-7 left-0 bg-neutral-900/95 text-white font-mono text-[11px] px-2 py-0.5 rounded shadow-lg border border-neutral-700 flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
                <span className="text-indigo-400 font-semibold">{preset.ratioStr}</span>
                <span className="text-neutral-500">•</span>
                <span>{cropBox.width} × {cropBox.height} px</span>
                {viewMode === 'fit_crop' && (
                  <span className="bg-indigo-500/20 text-indigo-300 text-[9px] px-1 rounded">
                    Maximized
                  </span>
                )}
                {strategyMode === 'direct_snap' && (
                  <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-1 rounded">
                    1:1 Snap
                  </span>
                )}
              </div>

              {/* Rule of Thirds Grid Lines */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Vertical lines */}
                  <div className="absolute top-0 bottom-0 left-1/3 w-px bg-white/30 border-r border-black/30" />
                  <div className="absolute top-0 bottom-0 left-2/3 w-px bg-white/30 border-r border-black/30" />
                  {/* Horizontal lines */}
                  <div className="absolute left-0 right-0 top-1/3 h-px bg-white/30 border-b border-black/30" />
                  <div className="absolute left-0 right-0 top-2/3 h-px bg-white/30 border-b border-black/30" />
                </div>
              )}

              {/* Resize Handles (8 Points) */}
              {/* Corners */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'top-left')}
                className="absolute -top-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'top-right')}
                className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'bottom-left')}
                className="absolute -bottom-1.5 -left-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nesw-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'bottom-right')}
                className="absolute -bottom-1.5 -right-1.5 w-3.5 h-3.5 bg-white border-2 border-indigo-600 rounded-sm cursor-nwse-resize shadow-md hover:scale-125 transition-transform"
              />

              {/* Edge handles */}
              <div
                onPointerDown={(e) => handlePointerDown(e, 'top')}
                className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'bottom')}
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-2 bg-white border border-indigo-600 rounded-sm cursor-ns-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'left')}
                className="absolute -left-1.5 top-1/2 -translate-y-1/2 h-6 w-2 bg-white border border-indigo-600 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
              />
              <div
                onPointerDown={(e) => handlePointerDown(e, 'right')}
                className="absolute -right-1.5 top-1/2 -translate-y-1/2 h-6 w-2 bg-white border border-indigo-600 rounded-sm cursor-ew-resize shadow-md hover:scale-125 transition-transform"
              />
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 bg-neutral-950 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
        <div className="flex items-center gap-2">
          <span>Source: <strong className="text-neutral-200">{imageNaturalWidth} × {imageNaturalHeight} px</strong></span>
          <span>•</span>
          <span>Crop Box: <strong className="text-indigo-300">{cropBox.width} × {cropBox.height} px</strong></span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>Offset: X: {cropBox.x}px, Y: {cropBox.y}px</span>
        </div>
      </div>
    </div>
  );
};
