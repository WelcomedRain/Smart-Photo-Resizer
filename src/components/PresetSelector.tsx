import React, { useState } from 'react';
import {
  Smartphone,
  Tv,
  Camera,
  Layers,
  Sparkles,
  Check,
  Sliders,
  Maximize2,
} from 'lucide-react';
import { StandardPreset } from '../types';
import { STANDARD_PRESETS } from '../utils/cropMath';

interface PresetSelectorProps {
  selectedPreset: StandardPreset;
  onSelectPreset: (preset: StandardPreset, multipleIndex?: number) => void;
  selectedMultipleIndex: number;
  onSelectMultipleIndex: (index: number) => void;
  onOpenCustomModal: () => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  selectedPreset,
  onSelectPreset,
  selectedMultipleIndex,
  onSelectMultipleIndex,
  onOpenCustomModal,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = [
    { id: 'All', label: 'All Standards', icon: Layers },
    { id: 'Social', label: 'Social & Mobile', icon: Smartphone },
    { id: 'Video', label: 'Video & Display', icon: Tv },
    { id: 'Photography', label: 'Photography', icon: Camera },
  ];

  const filteredPresets =
    activeCategory === 'All'
      ? STANDARD_PRESETS
      : STANDARD_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="space-y-4 xl:h-full xl:flex xl:flex-col">
      {/* Category Pills & Custom Button — stacked in the narrow xl rail, inline below it */}
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between xl:flex-col xl:items-stretch">
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900/90 border border-neutral-800 rounded-lg">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {cat.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onOpenCustomModal}
          className="w-full lg:w-auto xl:w-full shrink-0 px-3 py-1.5 rounded-lg border border-neutral-700 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-indigo-400" />
          Custom Ratio / Size
        </button>
      </div>

      {/* Preset Cards Grid */}
      {/* In the rail, spread the rows so the last one lands level with
          the bottom of the canvas and export columns. */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-2 gap-2.5 xl:flex-1 xl:content-between">
        {filteredPresets.map((preset) => {
          const isSelected = selectedPreset.id === preset.id;
          // Calculate visual aspect ratio box styling (max 32px height or width)
          const ratioVal = preset.ratioWidth / preset.ratioHeight;
          const boxWidth = ratioVal >= 1 ? 28 : Math.max(14, 28 * ratioVal);
          const boxHeight = ratioVal >= 1 ? Math.max(14, 28 / ratioVal) : 28;

          return (
            <div
              key={preset.id}
              onClick={() => onSelectPreset(preset, 0)}
              className={`group relative p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.2)] ring-1 ring-indigo-500'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900'
              }`}
            >
              {/* Header: Aspect ratio visual preview + ratio text */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  {/* Visual ratio preview icon */}
                  <div className="w-8 h-8 rounded bg-neutral-950 flex items-center justify-center border border-neutral-800 group-hover:border-neutral-700">
                    <div
                      className={`border rounded-xs transition-colors ${
                        isSelected ? 'border-indigo-400 bg-indigo-500/20' : 'border-neutral-500 bg-neutral-800/40'
                      }`}
                      style={{
                        width: `${boxWidth}px`,
                        height: `${boxHeight}px`,
                      }}
                    />
                  </div>

                  {/* Ratio badge */}
                  <span
                    className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
                      isSelected
                        ? 'bg-indigo-500 text-white'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    {preset.ratioStr}
                  </span>
                </div>

                {/* Preset Name */}
                <h4 className="text-xs font-semibold text-neutral-200 line-clamp-2 mb-1">
                  {preset.name}
                </h4>

                {/* Standard Resolution badge */}
                <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mb-2">
                  <Sparkles className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{preset.standardWidth} × {preset.standardHeight} px</span>
                </div>
              </div>

              {/* Multiples pills if selected */}
              {isSelected && preset.multiples && preset.multiples.length > 1 && (
                <div className="pt-2 border-t border-indigo-500/30 space-y-1">
                  <span className="text-[9px] uppercase tracking-wider text-indigo-300 font-semibold block">
                    Standard Multiples:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {preset.multiples.map((mult, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectMultipleIndex(idx);
                        }}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded transition-colors ${
                          selectedMultipleIndex === idx
                            ? 'bg-indigo-500 text-white font-bold'
                            : 'bg-neutral-950 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
                        }`}
                      >
                        {mult.width}×{mult.height}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular use tags */}
              {!isSelected && preset.popularUses && (
                <div className="text-[10px] text-neutral-500 line-clamp-1 mt-1">
                  {preset.popularUses.slice(0, 2).join(', ')}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
