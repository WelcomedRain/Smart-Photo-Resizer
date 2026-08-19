import React, { useRef } from 'react';
import {
  Crop,
  Upload,
  Layers,
  Sparkles,
  Image as ImageIcon,
  ChevronDown,
  HelpCircle,
  Monitor,
} from 'lucide-react';
import { SAMPLE_IMAGES, SampleImageDef } from '../utils/sampleImages';

interface NavbarProps {
  onSelectSample: (sample: SampleImageDef) => void;
  onFileUpload: (file: File) => void;
  onCaptureScreen: () => void;
  onOpenBatchModal: () => void;
  onOpenGuideModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectSample,
  onFileUpload,
  onCaptureScreen,
  onOpenBatchModal,
  onOpenGuideModal,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screen Capture is desktop-only; iOS Safari and mobile Chrome lack it, so
  // the button is hidden rather than offered and then failing.
  const canCaptureScreen =
    typeof navigator !== 'undefined' &&
    typeof navigator.mediaDevices?.getDisplayMedia === 'function';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950">
      {/* Mirrors <main>'s cap-then-pad order so the bar tracks the workspace
          edges at every viewport width, not just narrow ones. */}
      <div className="max-w-[1800px] w-full mx-auto px-4 sm:px-6">
        {/* No card styling and no divider — the panels below are already
            visually separated, so the header just needs to sit above them. */}
        <div className="py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <Crop className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-100 flex items-center gap-2">
              Smart Photo Resizer
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Precision Auto-Fit
              </span>
            </h1>
            <p className="text-xs text-neutral-400 hidden sm:block">
              Intelligent image resizing, standard aspect ratio auto-cropping & multi-format export
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* How to Use / Guide button */}
          <button
            type="button"
            onClick={onOpenGuideModal}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>Guide</span>
          </button>

          {/* Sample Images Quick Switcher */}
          <div className="relative group">
            <button
              type="button"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Samples</span>
              <ChevronDown className="w-3 h-3 text-neutral-400" />
            </button>

            {/* Dropdown menu */}
            <div className="absolute right-0 top-full mt-1.5 w-64 p-1.5 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl opacity-0 translate-y-1 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible transition-all duration-150 z-50">
              <div className="px-2 py-1 text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
                Select Test Scenario
              </div>
              {SAMPLE_IMAGES.map((sample) => (
                <button
                  key={sample.id}
                  type="button"
                  onClick={() => onSelectSample(sample)}
                  className="w-full text-left p-2 rounded-lg hover:bg-neutral-800 transition-colors flex items-start gap-2.5"
                >
                  <div className="w-7 h-7 rounded bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 text-indigo-400 mt-0.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-neutral-200 flex items-center justify-between">
                      <span className="truncate">{sample.name}</span>
                      <span className="text-[9px] font-mono bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded shrink-0">
                        {sample.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-neutral-400 line-clamp-1 mt-0.5 font-sans">
                      {sample.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>

          {/* Screen Capture — grabs a frame, then the crop box selects the region */}
          {canCaptureScreen && (
            <button
              type="button"
              onClick={onCaptureScreen}
              title="Capture a screen, window or tab, then crop it to the selected ratio"
              className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors"
            >
              <Monitor className="w-3.5 h-3.5 text-indigo-400" />
              <span>Screenshot</span>
            </button>
          )}

          {/* Batch Generator Trigger */}
          <button
            type="button"
            onClick={onOpenBatchModal}
            className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium border border-neutral-700 flex items-center gap-1.5 transition-colors hidden md:flex"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>Batch All</span>
          </button>

          </div>
        </div>
      </div>
    </header>
  );
};
