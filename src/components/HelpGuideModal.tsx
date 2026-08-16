import React, { useState } from 'react';
import {
  X,
  HelpCircle,
  Crop,
  Maximize2,
  Layers,
  Sparkles,
  Sliders,
  RotateCw,
  FolderArchive,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Cpu,
  Monitor,
  Globe,
  Info,
} from 'lucide-react';

interface HelpGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenBatchModal?: () => void;
  onOpenCustomModal?: () => void;
}

export const HelpGuideModal: React.FC<HelpGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenBatchModal,
  onOpenCustomModal,
}) => {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'strategies' | 'anchors' | 'scaling' | 'faq'>('quickstart');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 bg-neutral-900/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Smart Photo Resizer Guide & Tool Reference
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Learn how to crop, resize, pad, and export photos with mathematical precision
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-6 py-2 bg-neutral-950/70 border-b border-neutral-800 overflow-x-auto">
          {[
            { id: 'quickstart', label: '1. Quick Start', icon: Sparkles },
            { id: 'strategies', label: '2. Auto-Crop Strategies', icon: Crop },
            { id: 'anchors', label: '3. Anchor Matrix & Drag', icon: Compass },
            { id: 'scaling', label: '4. Resolution Scaling', icon: Cpu },
            { id: 'faq', label: '5. Tools & FAQ', icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-neutral-300 leading-relaxed">
          {/* TAB 1: QUICK START */}
          {activeTab === 'quickstart' && (
            <div className="space-y-5">
              <div className="bg-indigo-950/40 border border-indigo-900/50 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-indigo-200 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  What is Smart Photo Resizer?
                </h3>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Smart Photo Resizer solves a common problem: camera photos often have arbitrary dimensions (such as{' '}
                  <strong className="text-amber-300 font-mono">1090 × 2000 px</strong>) that don't match standard platform targets (such as{' '}
                  <strong className="text-emerald-400 font-mono">1080 × 1920 px for 9:16 Stories</strong> or{' '}
                  <strong className="text-emerald-400 font-mono">2560 × 1080 px for 21:9 Ultrawide</strong>). The app analyzes pixel differences and applies optimal cropping or padding with zero distortion.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">Load Your Photo</h4>
                  <p className="text-xs text-neutral-400">
                    Drag and drop any JPEG, PNG, WebP, or AVIF image into the editor or pick from standard sample reference test patterns.
                  </p>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">Pick Target Ratio</h4>
                  <p className="text-xs text-neutral-400">
                    Select standard presets: <strong>9:16</strong> (Stories/Reels/TikTok), <strong>16:9</strong> (YouTube/Desktop), <strong>1:1</strong> (Square), <strong>4:5</strong> (Instagram Feed), <strong>21:9</strong> (Ultrawide), or enter custom dimensions.
                  </p>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-300 font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">Export or Batch ZIP</h4>
                  <p className="text-xs text-neutral-400">
                    Preview in real-time, adjust resolution multiplier (1x, 2x Retina, 4K), and download directly or generate all formats in one ZIP archive.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CROP STRATEGIES */}
          {activeTab === 'strategies' && (
            <div className="space-y-4">
              <div className="border border-neutral-800 bg-neutral-950 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                    <Crop className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">1. Standard Snap (1:1 Native Pixel Crop)</h4>
                </div>
                <p className="text-xs text-neutral-300">
                  Trims only the precise excess pixels from the photo borders directly down to the exact standard dimensions without any scaling or resampling interpolation.
                </p>
                <div className="bg-neutral-900 p-2 rounded text-[11px] font-mono text-emerald-400">
                  Example: 1090 × 2000 px photo → trims exactly 10px width & 80px height → produces crisp 1080 × 1920 px (0% blur).
                </div>
                <p className="text-[11px] text-neutral-400">
                  <strong className="text-neutral-300">Note:</strong> Standard Snap requires the source image to be at least as large as the target standard resolution. If your source image is smaller (e.g. 1090px wide vs 2560px for 21:9), use <strong>Max Area Fit</strong> instead.
                </p>
              </div>

              <div className="border border-neutral-800 bg-neutral-950 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                    <Maximize2 className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">2. Max Area Fit (Maximum Field of View)</h4>
                </div>
                <p className="text-xs text-neutral-300">
                  Captures the absolute largest permissible area inside your photo that matches the requested aspect ratio (utilizing 100% of either the width or height), and scales cleanly to the standard target.
                </p>
                <div className="bg-neutral-900 p-2 rounded text-[11px] font-mono text-indigo-300">
                  Ideal for: Capturing the widest panoramic views for 21:9 or maximum content when cropping across different orientations.
                </div>
              </div>

              <div className="border border-neutral-800 bg-neutral-950 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-indigo-600/30 text-indigo-400 flex items-center justify-center">
                    <Layers className="w-3.5 h-3.5" />
                  </div>
                  <h4 className="text-xs font-bold text-neutral-100">3. Letterbox Pad (Zero Cropping)</h4>
                </div>
                <p className="text-xs text-neutral-300">
                  Keeps 100% of the entire original photo completely uncropped. It places the full photo inside the target aspect ratio canvas with an aesthetic blurred backdrop or solid background padding.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: ANCHORS & DRAG CONTROLS */}
          {activeTab === 'anchors' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  <Compass className="w-4 h-4 text-indigo-400" />
                  9-Point Anchor Placement Matrix
                </h4>
                <p className="text-xs text-neutral-300">
                  When auto-cropping excess pixels, the anchor determines which portion of the image remains prioritized:
                </p>
                <ul className="space-y-2 text-xs">
                  <li className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded border border-neutral-800">
                    <strong className="text-indigo-300 min-w-[70px]">Top:</strong>
                    <span>Best for portraits and 9:16 vertical stories to prevent cutting off heads, hair, and faces.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded border border-neutral-800">
                    <strong className="text-indigo-300 min-w-[70px]">Center:</strong>
                    <span>Best for landscapes, avatars, product photography, and symmetric compositions.</span>
                  </li>
                  <li className="flex items-start gap-2 bg-neutral-900/60 p-2 rounded border border-neutral-800">
                    <strong className="text-indigo-300 min-w-[70px]">Bottom:</strong>
                    <span>Prioritizes foreground subjects, vehicles, feet, or low horizon lines.</span>
                  </li>
                </ul>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  <Crop className="w-4 h-4 text-indigo-400" />
                  Interactive Dragging & Resizing
                </h4>
                <p className="text-xs text-neutral-300">
                  You can freely click and drag the crop box on the canvas to reposition it anywhere within the image boundaries. Drag any of the 4 corner handles to scale the crop box up or down while maintaining the locked standard aspect ratio.
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: RESOLUTION SCALING */}
          {activeTab === 'scaling' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Resolution Scale & Upscaling Algorithm
                </h4>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  The <strong className="text-neutral-100">Resolution Scale</strong> multiplier (0.5x, 1x Standard, 1.5x, 2x Retina, 4x Ultra HD) controls the physical pixel density of the output canvas.
                </p>
                <div className="space-y-2 text-xs">
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <strong className="text-emerald-400">High-Quality Bicubic Interpolation:</strong>
                    <p className="text-neutral-400 mt-1">
                      When scaling or upscaling, the application utilizes multi-pass sub-pixel canvas rendering with <code className="text-neutral-200 bg-black/60 px-1 py-0.5 rounded">imageSmoothingQuality = 'high'</code>. This computes weighted cubic polynomial averages of surrounding pixels to maintain smooth color transitions and prevent blocky pixelation.
                    </p>
                  </div>
                  <div className="bg-neutral-900 p-2.5 rounded border border-neutral-800">
                    <strong className="text-indigo-300">Output Multiplier Examples (for 9:16):</strong>
                    <ul className="mt-1 space-y-1 text-neutral-400 font-mono text-[11px]">
                      <li>• 1.0x (Standard FHD) = 1080 × 1920 px</li>
                      <li>• 2.0x (2x Retina / 4K) = 2160 × 3840 px</li>
                      <li>• 0.5x (Compact Web) = 540 × 960 px</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ & PLATFORM COMPARISON */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Web App vs. Desktop App: Which is Recommended?
                </h4>
                <div className="space-y-3 text-xs text-neutral-300">
                  <p>
                    <strong className="text-indigo-300">Why Web App (PWA) is optimal:</strong>
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-neutral-400 pl-2">
                    <li><strong className="text-neutral-200">100% Client-Side Privacy:</strong> All cropping and processing happens directly in your browser using HTML5 Canvas — zero images are uploaded to any server.</li>
                    <li><strong className="text-neutral-200">Instant Cross-Platform:</strong> Works on Mac, Windows, Chromebooks, iPad, and Linux without installation or version updates.</li>
                    <li><strong className="text-neutral-200">PWA Installable:</strong> You can install it directly to your desktop via Chrome/Edge (click the install icon in the address bar) to run it as a standalone window.</li>
                  </ul>
                  <p>
                    <strong className="text-indigo-300">When Desktop Apps are preferred:</strong> Native desktop apps (via Electron or Tauri) are helpful if you need direct OS file-system folder watching or local command-line batching. For standard photo resizing and social exports, the client-side web application provides the best performance and security.
                  </p>
                </div>
              </div>

              <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-neutral-100 flex items-center gap-2">
                  <FolderArchive className="w-4 h-4 text-indigo-400" />
                  Batch Multi-Crop Generator
                </h4>
                <p className="text-xs text-neutral-300">
                  Need an image formatted for Instagram, YouTube, Facebook, Twitter, and TikTok all at once? Click the <strong>"Batch All Formats"</strong> button in the top bar to generate and download a single ZIP package containing all standard aspect ratios simultaneously.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-800 bg-neutral-900/90 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-neutral-400">
            Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700 font-mono text-[10px]">?</kbd> anytime to reopen this guide
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all"
            >
              Got it, start editing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
