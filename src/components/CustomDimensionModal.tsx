import React, { useState } from 'react';
import { X, Sliders, Image, Sparkles, Plus, Check } from 'lucide-react';
import { StandardPreset } from '../types';
import { gcd } from '../utils/cropMath';

interface CustomDimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyCustomTarget: (preset: StandardPreset) => void;
  onGenerateCustomSourceImage: (width: number, height: number, label: string) => void;
}

export const CustomDimensionModal: React.FC<CustomDimensionModalProps> = ({
  isOpen,
  onClose,
  onApplyCustomTarget,
  onGenerateCustomSourceImage,
}) => {
  const [tab, setTab] = useState<'target' | 'source'>('target');

  // Custom Target State
  const [targetW, setTargetW] = useState<number>(1080);
  const [targetH, setTargetH] = useState<number>(1920);
  const [customName, setCustomName] = useState<string>('Custom Format');

  // Custom Test Image State (for testing arbitrary resolutions like 1090x2000)
  const [sourceW, setSourceW] = useState<number>(1090);
  const [sourceH, setSourceH] = useState<number>(2000);
  const [sourceTitle, setSourceTitle] = useState<string>('Custom 1090×2000 Matrix');

  if (!isOpen) return null;

  const handleApplyTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (targetW <= 0 || targetH <= 0) return;

    const div = gcd(targetW, targetH);
    const rW = Math.round(targetW / div);
    const rH = Math.round(targetH / div);
    const ratioStr = `${rW}:${rH}`;

    const customPreset: StandardPreset = {
      id: `custom-${targetW}x${targetH}`,
      name: customName || `Custom ${targetW}×${targetH}`,
      category: 'Custom',
      ratioStr,
      ratioWidth: rW,
      ratioHeight: rH,
      standardWidth: targetW,
      standardHeight: targetH,
      description: `Custom target resolution of ${targetW} × ${targetH} px (${ratioStr}).`,
      popularUses: ['Custom Target Specification'],
      multiples: [{ label: `${targetW} × ${targetH}`, width: targetW, height: targetH }],
    };

    onApplyCustomTarget(customPreset);
    onClose();
  };

  const handleCreateSource = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceW <= 0 || sourceH <= 0) return;
    onGenerateCustomSourceImage(sourceW, sourceH, sourceTitle || 'Custom Canvas');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-neutral-100">
                Custom Dimensions & Generator
              </h3>
              <p className="text-xs text-neutral-400">
                Define exact pixel targets or generate custom source matrices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex border-b border-neutral-800 bg-neutral-950/60 p-2 gap-1.5">
          <button
            type="button"
            onClick={() => setTab('target')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'target'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Custom Crop Target Size
          </button>
          <button
            type="button"
            onClick={() => setTab('source')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
              tab === 'source'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
          >
            <Image className="w-3.5 h-3.5" />
            Generate Custom Test Image
          </button>
        </div>

        {/* Modal Form Content */}
        <div className="p-6 space-y-4">
          {tab === 'target' ? (
            <form onSubmit={handleApplyTarget} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Preset Name / Label</label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Facebook Ad 1200x628, Custom Banner"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Target Width (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={targetW}
                    onChange={(e) => setTargetW(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Target Height (px)</label>
                  <input
                    type="number"
                    min="10"
                    max="10000"
                    value={targetH}
                    onChange={(e) => setTargetH(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Aspect Ratio Preview badge */}
              <div className="p-3 bg-neutral-950 rounded-lg border border-neutral-800 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400 font-sans">Calculated Ratio:</span>
                <span className="text-emerald-400 font-bold">
                  {targetW && targetH ? `${(targetW / gcd(targetW, targetH))}:${(targetH / gcd(targetW, targetH))} (${(targetW / targetH).toFixed(3)}:1)` : '—'}
                </span>
              </div>

              {/* Quick Presets */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                  Quick Dimensions:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '9:16 (1080×1920)', w: 1080, h: 1920 },
                    { label: '16:9 (1920×1080)', w: 1920, h: 1080 },
                    { label: 'FB Link (1200×628)', w: 1200, h: 628 },
                    { label: 'Twitter Post (1600×900)', w: 1600, h: 900 },
                    { label: 'Letter (2550×3300)', w: 2550, h: 3300 },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setTargetW(p.w);
                        setTargetH(p.h);
                        setCustomName(p.label);
                      }}
                      className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] font-mono text-neutral-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Check className="w-4 h-4" />
                Apply Custom Target Ratio
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateSource} className="space-y-4">
              <p className="text-xs text-neutral-400 leading-relaxed">
                Need to test a specific image size like <strong className="text-neutral-200">1090 × 2000 px</strong> or <strong className="text-neutral-200">1520 × 2600 px</strong>? Generate a high-precision test canvas instantly.
              </p>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300">Canvas Label</label>
                <input
                  type="text"
                  value={sourceTitle}
                  onChange={(e) => setSourceTitle(e.target.value)}
                  placeholder="e.g. 1090x2000 Test Matrix"
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-indigo-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Source Width (px)</label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    value={sourceW}
                    onChange={(e) => setSourceW(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-neutral-300">Source Height (px)</label>
                  <input
                    type="number"
                    min="100"
                    max="8000"
                    value={sourceH}
                    onChange={(e) => setSourceH(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-lg text-sm text-neutral-100 font-mono focus:outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Quick Prompt dimension shortcuts */}
              <div className="space-y-1.5">
                <label className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                  Quick Test Dimens:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '1090 × 2000 (User Prompt)', w: 1090, h: 2000 },
                    { label: '2400 × 3200 (Portrait)', w: 2400, h: 3200 },
                    { label: '4032 × 3024 (iPhone 4:3)', w: 4032, h: 3024 },
                    { label: '3840 × 2160 (4K UHD)', w: 3840, h: 2160 },
                  ].map((p, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSourceW(p.w);
                        setSourceH(p.h);
                        setSourceTitle(p.label);
                      }}
                      className="px-2 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded text-[11px] font-mono text-neutral-300 transition-colors"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Test Image ({sourceW} × {sourceH} px)
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
