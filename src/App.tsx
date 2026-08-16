import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { PresetSelector } from './components/PresetSelector';
import { SmartCalculationsCard } from './components/SmartCalculationsCard';
import { CropCanvas } from './components/CropCanvas';
import { ExportPanel } from './components/ExportPanel';
import { BatchGeneratorModal } from './components/BatchGeneratorModal';
import { CustomDimensionModal } from './components/CustomDimensionModal';
import { HelpGuideModal } from './components/HelpGuideModal';
import { STANDARD_PRESETS, analyzeSmartCrop } from './utils/cropMath';
import { SAMPLE_IMAGES, SampleImageDef, createGeneratedImageSync } from './utils/sampleImages';
import {
  AnchorPosition,
  CropRect,
  CropStrategyMode,
  StandardPreset,
} from './types';
import { Upload, Sparkles, Image as ImageIcon, CheckCircle2, HelpCircle } from 'lucide-react';

export default function App() {
  // Image State
  const [imageSrc, setImageSrc] = useState<string>(() => {
    return createGeneratedImageSync(
      1090,
      2000,
      'Prompt Reference Image',
      'Tests Smart 9:16 snap to 1080×1920',
      'neon'
    );
  });
  const [imageNaturalWidth, setImageNaturalWidth] = useState<number>(1090);
  const [imageNaturalHeight, setImageNaturalHeight] = useState<number>(2000);
  const [imageName, setImageName] = useState<string>('UserPrompt_1090x2000.png');
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Crop & Preset State
  const [selectedPreset, setSelectedPreset] = useState<StandardPreset>(STANDARD_PRESETS[0]); // 9:16 Default
  const [selectedMultipleIndex, setSelectedMultipleIndex] = useState<number>(0);
  const [strategyMode, setStrategyMode] = useState<CropStrategyMode>('direct_snap');
  const [anchor, setAnchor] = useState<AnchorPosition>('center');

  // Interactive crop box in natural image pixel coordinates
  const [cropBox, setCropBox] = useState<CropRect>({
    x: 5,
    y: 40,
    width: 1080,
    height: 1920,
  });

  // Transforms
  const [rotation, setRotation] = useState<number>(0);
  const [flipH, setFlipH] = useState<boolean>(false);
  const [flipV, setFlipV] = useState<boolean>(false);

  // Modals
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState<boolean>(false);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === '?' || e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        setIsGuideModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fallback loader if sync generator wasn't available during initial mount
  useEffect(() => {
    if (!imageSrc) {
      const loadInitialSample = async () => {
        const defaultSample = SAMPLE_IMAGES[0];
        const url = await defaultSample.generator();
        setImageSrc(url);
        setImageNaturalWidth(defaultSample.width);
        setImageNaturalHeight(defaultSample.height);
        setImageName('UserPrompt_1090x2000.png');
      };
      loadInitialSample();
    }
  }, [imageSrc]);

  // Compute Smart Crop Analysis
  const smartAnalysis = useMemo(() => {
    return analyzeSmartCrop(
      imageNaturalWidth || 1080,
      imageNaturalHeight || 1920,
      selectedPreset,
      anchor,
      selectedMultipleIndex
    );
  }, [
    imageNaturalWidth,
    imageNaturalHeight,
    selectedPreset,
    anchor,
    selectedMultipleIndex,
  ]);

  // Sync crop box when preset, anchor, or strategy mode changes
  const applySmartCropBox = useCallback(
    (mode: CropStrategyMode, anchorPos: AnchorPosition, preset: StandardPreset, multIdx: number) => {
      const analysis = analyzeSmartCrop(
        imageNaturalWidth,
        imageNaturalHeight,
        preset,
        anchorPos,
        multIdx
      );

      if (mode === 'direct_snap' && analysis.canDirectSnap) {
        setCropBox(analysis.directSnapCrop);
      } else if (mode === 'fit_letterbox') {
        setCropBox({
          x: 0,
          y: 0,
          width: imageNaturalWidth,
          height: imageNaturalHeight,
        });
      } else {
        setCropBox(analysis.maxFitSourceCrop);
      }
    },
    [imageNaturalWidth, imageNaturalHeight]
  );

  // When preset changes
  const handleSelectPreset = (preset: StandardPreset, multIdx = 0) => {
    setSelectedPreset(preset);
    setSelectedMultipleIndex(multIdx);

    // Auto-select smart strategy
    const analysis = analyzeSmartCrop(
      imageNaturalWidth,
      imageNaturalHeight,
      preset,
      anchor,
      multIdx
    );
    const newMode = analysis.recommendedMode;
    setStrategyMode(newMode);
    applySmartCropBox(newMode, anchor, preset, multIdx);
  };

  // When multiple index changes (e.g. 4K vs FHD)
  const handleSelectMultipleIndex = (idx: number) => {
    setSelectedMultipleIndex(idx);
    const analysis = analyzeSmartCrop(
      imageNaturalWidth,
      imageNaturalHeight,
      selectedPreset,
      anchor,
      idx
    );
    const newMode = analysis.recommendedMode;
    setStrategyMode(newMode);
    applySmartCropBox(newMode, anchor, selectedPreset, idx);
  };

  // When strategy mode changes
  const handleModeChange = (mode: CropStrategyMode) => {
    setStrategyMode(mode);
    applySmartCropBox(mode, anchor, selectedPreset, selectedMultipleIndex);
  };

  // When anchor position changes
  const handleAnchorChange = (newAnchor: AnchorPosition) => {
    setAnchor(newAnchor);
    applySmartCropBox(strategyMode, newAnchor, selectedPreset, selectedMultipleIndex);
  };

  // Load a file directly
  const handleFileLoad = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;
      const img = new Image();
      img.onload = () => {
        setImageSrc(result);
        setImageNaturalWidth(img.naturalWidth);
        setImageNaturalHeight(img.naturalHeight);
        setImageName(file.name);
        setRotation(0);
        setFlipH(false);
        setFlipV(false);

        // Recalculate smart crop
        const analysis = analyzeSmartCrop(
          img.naturalWidth,
          img.naturalHeight,
          selectedPreset,
          anchor,
          selectedMultipleIndex
        );
        setStrategyMode(analysis.recommendedMode);
        if (analysis.recommendedMode === 'direct_snap' && analysis.canDirectSnap) {
          setCropBox(analysis.directSnapCrop);
        } else {
          setCropBox(analysis.maxFitSourceCrop);
        }
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  // Select a preset sample
  const handleSelectSample = async (sample: SampleImageDef) => {
    const url = await sample.generator();
    setImageSrc(url);
    setImageNaturalWidth(sample.width);
    setImageNaturalHeight(sample.height);
    setImageName(`${sample.name.replace(/\s+/g, '_')}.png`);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);

    const analysis = analyzeSmartCrop(
      sample.width,
      sample.height,
      selectedPreset,
      anchor,
      selectedMultipleIndex
    );
    setStrategyMode(analysis.recommendedMode);
    if (analysis.recommendedMode === 'direct_snap' && analysis.canDirectSnap) {
      setCropBox(analysis.directSnapCrop);
    } else {
      setCropBox(analysis.maxFitSourceCrop);
    }
  };

  // Generate a custom test image
  const handleGenerateCustomSource = (width: number, height: number, label: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#334155');
      grad.addColorStop(1, '#020617');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Grid
      ctx.strokeStyle = 'rgba(255,255,255,0.1)';
      ctx.lineWidth = 2;
      const step = Math.round(width / 10);
      for (let x = step; x < width; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = step; y < height; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = `bold ${Math.max(24, Math.round(width * 0.05))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText(label, width / 2, height / 2 - 20);

      ctx.font = `bold ${Math.max(28, Math.round(width * 0.06))}px monospace`;
      ctx.fillStyle = '#38bdf8';
      ctx.fillText(`${width} × ${height} px`, width / 2, height / 2 + 30);

      const url = canvas.toDataURL('image/png');
      setImageSrc(url);
      setImageNaturalWidth(width);
      setImageNaturalHeight(height);
      setImageName(`${label.replace(/\s+/g, '_')}_${width}x${height}.png`);
      setRotation(0);
      setFlipH(false);
      setFlipV(false);

      const analysis = analyzeSmartCrop(
        width,
        height,
        selectedPreset,
        anchor,
        selectedMultipleIndex
      );
      setStrategyMode(analysis.recommendedMode);
      if (analysis.recommendedMode === 'direct_snap' && analysis.canDirectSnap) {
        setCropBox(analysis.directSnapCrop);
      } else {
        setCropBox(analysis.maxFitSourceCrop);
      }
    }
  };

  // Clipboard paste listener
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleFileLoad(file);
            break;
          }
        }
      }
    };
    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [selectedPreset, anchor, selectedMultipleIndex]);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };
  const handleDragLeave = () => setIsDragOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileLoad(e.dataTransfer.files[0]);
    }
  };

  const targetW =
    selectedPreset.multiples && selectedPreset.multiples[selectedMultipleIndex]
      ? selectedPreset.multiples[selectedMultipleIndex].width
      : selectedPreset.standardWidth;
  const targetH =
    selectedPreset.multiples && selectedPreset.multiples[selectedMultipleIndex]
      ? selectedPreset.multiples[selectedMultipleIndex].height
      : selectedPreset.standardHeight;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-indigo-500 selection:text-white relative"
    >
      {/* Global Drag Overlay */}
      {isDragOver && (
        <div className="fixed inset-0 z-50 bg-indigo-950/80 backdrop-blur-md border-4 border-dashed border-indigo-400 flex flex-col items-center justify-center p-8 pointer-events-none animate-in fade-in">
          <Upload className="w-16 h-16 text-indigo-300 animate-bounce mb-4" />
          <h2 className="text-2xl font-bold text-white">Drop Image to Open</h2>
          <p className="text-sm text-indigo-200 mt-2">
            Auto-calculates standard crops and optimal resolutions instantly
          </p>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        onSelectSample={handleSelectSample}
        onFileUpload={handleFileLoad}
        onOpenBatchModal={() => setIsBatchModalOpen(true)}
        onOpenGuideModal={() => setIsGuideModalOpen(true)}
        onResetTransforms={() => {
          setRotation(0);
          setFlipH(false);
          setFlipV(false);
        }}
      />

      {/* Main App Workspace */}
      <main className="flex-1 max-w-[1800px] w-full mx-auto p-4 sm:p-6">
        {/* 3-Column Responsive Workspace Grid: presets rail | canvas | analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left Rail on wide screens (3 cols); full-width banner below xl */}
          <section aria-label="Standard Ratio Presets" className="lg:col-span-12 xl:col-span-3">
            <PresetSelector
              selectedPreset={selectedPreset}
              onSelectPreset={handleSelectPreset}
              selectedMultipleIndex={selectedMultipleIndex}
              onSelectMultipleIndex={handleSelectMultipleIndex}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
            />
          </section>

          {/* Center Column: Interactive Visual Canvas */}
          <div className="lg:col-span-7 xl:col-span-5 flex flex-col min-h-[620px] h-full">
            <CropCanvas
              imageSrc={imageSrc}
              imageNaturalWidth={imageNaturalWidth}
              imageNaturalHeight={imageNaturalHeight}
              cropBox={cropBox}
              onCropChange={setCropBox}
              preset={selectedPreset}
              strategyMode={strategyMode}
              targetWidth={targetW}
              targetHeight={targetH}
              rotation={rotation}
              onRotationChange={setRotation}
              flipH={flipH}
              onFlipHChange={setFlipH}
              flipV={flipV}
              onFlipVChange={setFlipV}
            />
          </div>

          {/* Right Column: Smart Calculations, Strategy & Export */}
          <div className="lg:col-span-5 xl:col-span-4 flex flex-col justify-between space-y-5">
            {/* Smart Math & Strategy Engine */}
            <SmartCalculationsCard
              analysis={smartAnalysis}
              selectedPreset={selectedPreset}
              currentMode={strategyMode}
              onModeChange={handleModeChange}
              anchor={anchor}
              onAnchorChange={handleAnchorChange}
              cropBox={cropBox}
            />

            {/* Export & Deliver Panel */}
            <ExportPanel
              imageSrc={imageSrc}
              imageNaturalWidth={imageNaturalWidth}
              imageNaturalHeight={imageNaturalHeight}
              cropBox={cropBox}
              selectedPreset={selectedPreset}
              strategyMode={strategyMode}
              targetWidth={targetW}
              targetHeight={targetH}
              rotation={rotation}
              flipH={flipH}
              flipV={flipV}
              onOpenBatchModal={() => setIsBatchModalOpen(true)}
            />
          </div>
        </div>
      </main>

      {/* Batch Generator Modal */}
      <BatchGeneratorModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        imageSrc={imageSrc}
        imageNaturalWidth={imageNaturalWidth}
        imageNaturalHeight={imageNaturalHeight}
        anchor={anchor}
      />

      {/* Custom Dimension Modal */}
      <CustomDimensionModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onApplyCustomTarget={(customPreset) => {
          setSelectedPreset(customPreset);
          setSelectedMultipleIndex(0);
          const analysis = analyzeSmartCrop(
            imageNaturalWidth,
            imageNaturalHeight,
            customPreset,
            anchor
          );
          setStrategyMode(analysis.recommendedMode);
          applySmartCropBox(analysis.recommendedMode, anchor, customPreset, 0);
        }}
        onGenerateCustomSourceImage={handleGenerateCustomSource}
      />

      {/* Interactive Tool Guide & Tutorial Modal */}
      <HelpGuideModal
        isOpen={isGuideModalOpen}
        onClose={() => setIsGuideModalOpen(false)}
        onOpenBatchModal={() => {
          setIsGuideModalOpen(false);
          setIsBatchModalOpen(true);
        }}
        onOpenCustomModal={() => {
          setIsGuideModalOpen(false);
          setIsCustomModalOpen(true);
        }}
      />
    </div>
  );
}
