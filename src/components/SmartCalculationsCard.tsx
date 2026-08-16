import React from 'react';
import {
  Sparkles,
  Maximize2,
  Minimize2,
  CheckCircle2,
  HelpCircle,
  Crop,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { AnchorPosition, CropStrategyMode, SmartCropAnalysis, StandardPreset } from '../types';

interface SmartCalculationsCardProps {
  analysis: SmartCropAnalysis;
  selectedPreset: StandardPreset;
  currentMode: CropStrategyMode;
  onModeChange: (mode: CropStrategyMode) => void;
  anchor: AnchorPosition;
  onAnchorChange: (anchor: AnchorPosition) => void;
  cropBox: { x: number; y: number; width: number; height: number };
}

export const SmartCalculationsCard: React.FC<SmartCalculationsCardProps> = ({
  analysis,
  selectedPreset,
  currentMode,
  onModeChange,
  anchor,
  onAnchorChange,
  cropBox,
}) => {
  const anchors: { id: AnchorPosition; label: string; iconPos: string }[] = [
    { id: 'top-left', label: 'Top-Left', iconPos: '↖' },
    { id: 'top', label: 'Top (Face/Portrait)', iconPos: '↑' },
    { id: 'top-right', label: 'Top-Right', iconPos: '↗' },
    { id: 'left', label: 'Left', iconPos: '←' },
    { id: 'center', label: 'Center (Balanced)', iconPos: '•' },
    { id: 'right', label: 'Right', iconPos: '→' },
    { id: 'bottom-left', label: 'Bottom-Left', iconPos: '↙' },
    { id: 'bottom', label: 'Bottom', iconPos: '↓' },
    { id: 'bottom-right', label: 'Bottom-Right', iconPos: '↘' },
  ];

  const percentWTrimmed = (
    (analysis.directSnapTrimX / analysis.sourceWidth) *
    100
  ).toFixed(1);
  const percentHTrimmed = (
    (analysis.directSnapTrimY / analysis.sourceHeight) *
    100
  ).toFixed(1);

  return (
    <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-5 shadow-xl space-y-4">
      {/* Header with smart badge */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-100 flex items-center gap-2">
              Smart Auto-Crop Engine
              <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Active Analysis
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Optimal pixel math for standard {selectedPreset.ratioStr} ({analysis.targetStandardWidth} × {analysis.targetStandardHeight} px)
            </p>
          </div>
        </div>
      </div>

      {/* Visual Resolution Transformation Flow */}
      <div className="bg-neutral-950/80 rounded-lg p-3.5 border border-neutral-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-mono">
          {/* Source badge */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans block">
              Original Source
            </span>
            <div className="text-amber-300 font-semibold flex items-center gap-1.5">
              <span>{analysis.sourceWidth} × {analysis.sourceHeight}</span>
              <span className="text-[10px] text-neutral-400 font-sans">px</span>
            </div>
            <span className="text-[10px] text-neutral-400">
              Ratio: {(analysis.sourceWidth / analysis.sourceHeight).toFixed(3)}:1
            </span>
          </div>

          <div className="flex flex-col items-center px-2">
            <ArrowRight className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span className="text-[10px] font-sans text-indigo-300/80 mt-0.5">
              Auto Fit
            </span>
          </div>

          {/* Standard Target badge */}
          <div className="space-y-1 text-right">
            <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-sans block">
              Standard Target ({selectedPreset.ratioStr})
            </span>
            <div className="text-emerald-400 font-semibold flex items-center justify-end gap-1.5">
              <span>{analysis.targetStandardWidth} × {analysis.targetStandardHeight}</span>
              <span className="text-[10px] text-neutral-400 font-sans">px</span>
            </div>
            <span className="text-[10px] text-emerald-500/90 font-medium">
              Standard Base Size
            </span>
          </div>
        </div>

        {/* Breakdown explanation banner */}
        <div className="text-xs text-neutral-300 bg-indigo-950/30 border border-indigo-900/40 rounded-md p-2.5 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="leading-relaxed font-sans">{analysis.explanation}</p>
            {analysis.canDirectSnap && (
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-mono bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-700 text-neutral-300">
                  Trim Width: -{analysis.directSnapTrimX}px ({percentWTrimmed}%)
                </span>
                <span className="text-[11px] font-mono bg-neutral-900/80 px-2 py-0.5 rounded border border-neutral-700 text-neutral-300">
                  Trim Height: -{analysis.directSnapTrimY}px ({percentHTrimmed}%)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Crop Strategy Selection */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider block">
          Auto Crop Strategy
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {/* Strategy 1: Direct Standard Snap */}
          <button
            type="button"
            onClick={() => {
              if (analysis.canDirectSnap) {
                onModeChange('direct_snap');
              } else {
                onModeChange('max_fit_scaled');
              }
            }}
            title={
              analysis.canDirectSnap
                ? `1:1 exact crop of ${analysis.targetStandardWidth}×${analysis.targetStandardHeight}px without scaling blur`
                : `Source (${analysis.sourceWidth}×${analysis.sourceHeight}px) is smaller than standard ${analysis.targetStandardWidth}×${analysis.targetStandardHeight}px. Max Area Fit captures maximum pixels and scales cleanly.`
            }
            className={`p-2.5 rounded-lg border text-left transition-all ${
              currentMode === 'direct_snap'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500'
                : analysis.canDirectSnap
                ? 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
                : 'bg-neutral-950/40 border-neutral-800/60 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Crop className="w-3.5 h-3.5 text-indigo-400" />
                Standard Snap
              </span>
              {currentMode === 'direct_snap' ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              ) : !analysis.canDirectSnap ? (
                <span className="text-[9px] font-mono px-1 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  Needs Scale
                </span>
              ) : null}
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-2">
              {analysis.canDirectSnap
                ? `Exact ${analysis.targetStandardWidth}×${analysis.targetStandardHeight}px cut (0% blur).`
                : `Source is smaller than ${analysis.targetStandardWidth}px. Use Max Area Fit to scale.`}
            </p>
          </button>

          {/* Strategy 2: Max Fit Scaled */}
          <button
            type="button"
            onClick={() => onModeChange('max_fit_scaled')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              currentMode === 'max_fit_scaled'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Maximize2 className="w-3.5 h-3.5 text-indigo-400" />
                Max Area Fit
              </span>
              {currentMode === 'max_fit_scaled' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-2">
              Crops max possible {selectedPreset.ratioStr} area & scales to standard.
            </p>
          </button>

          {/* Strategy 3: Letterbox / Pad */}
          <button
            type="button"
            onClick={() => onModeChange('fit_letterbox')}
            className={`p-2.5 rounded-lg border text-left transition-all ${
              currentMode === 'fit_letterbox'
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-100 ring-1 ring-indigo-500'
                : 'bg-neutral-950/60 border-neutral-800 hover:border-neutral-700 text-neutral-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                Letterbox Pad
              </span>
              {currentMode === 'fit_letterbox' && (
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </div>
            <p className="text-[11px] text-neutral-400 line-clamp-2">
              Fits 100% of entire image with blurred or solid background padding.
            </p>
          </button>
        </div>
      </div>

      {/* Anchor Point Matrix */}
      {currentMode !== 'fit_letterbox' && (
        <div className="space-y-2 pt-1 border-t border-neutral-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">
              Crop Anchor Point
            </label>
            <span className="text-[11px] text-neutral-400">
              Active: <span className="text-neutral-200 capitalize">{anchor}</span>
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 max-w-[260px]">
            {anchors.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => onAnchorChange(a.id)}
                title={a.label}
                className={`py-1.5 px-2 rounded-md text-xs font-medium border flex items-center justify-center gap-1.5 transition-colors ${
                  anchor === a.id
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                }`}
              >
                <span className="text-xs">{a.iconPos}</span>
                <span className="text-[10px] hidden sm:inline truncate">{a.id}</span>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-neutral-400">
            Tip: For portraits & vertical stories (9:16), use <strong className="text-neutral-300">Top</strong> anchor to prevent cutting off heads/faces.
          </p>
        </div>
      )}
    </div>
  );
};
