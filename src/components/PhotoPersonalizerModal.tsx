import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, RotateCcw, X, Check, ArrowLeftRight } from 'lucide-react';
import { readRawFileAsDataUrl } from '../utils/exactPhotoStore';

export interface CustomPhotosState {
  portrait1: string;
  portrait2: string;
  teddy: string;
}

interface PhotoPersonalizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: CustomPhotosState;
  defaultPhotos: CustomPhotosState;
  onUpdatePhoto: (key: keyof CustomPhotosState, dataUrl: string) => void;
  onSwapPortraits: () => void;
  onResetAll: () => void;
  setupHidden: boolean;
  onToggleSetupHidden: (hidden: boolean) => void;
}

export const PhotoPersonalizerModal: React.FC<PhotoPersonalizerModalProps> = ({
  isOpen,
  onClose,
  photos,
  defaultPhotos,
  onUpdatePhoto,
  onSwapPortraits,
  onResetAll,
  setupHidden,
  onToggleSetupHidden,
}) => {
  const handleFileChange = async (
    key: keyof CustomPhotosState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // 100% untouched original file bytes — no resizing, no compression, no AI filter
      const exactDataUrl = await readRawFileAsDataUrl(file);
      onUpdatePhoto(key, exactDataUrl);
    } catch {
      // ignore invalid file
    }
  };

  const slots: Array<{
    key: keyof CustomPhotosState;
    title: string;
    subtitle: string;
  }> = [
    {
      key: 'portrait1',
      title: 'Portrait I (35mm Film Strip)',
      subtitle: 'Her close-up portrait with film sprocket border',
    },
    {
      key: 'portrait2',
      title: 'Portrait II (Cathedral Sunlight)',
      subtitle: 'Her white lace cathedral portrait',
    },
    {
      key: 'teddy',
      title: 'Birthday Plush Bunny Teddy',
      subtitle: 'Fluffy white bunny with pink ribbon',
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-[#2D1625]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-3xl rounded-3xl bg-white border border-[#F3D8E6] shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#F3D8E6]">
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[#2D1625]">
                  Exact Original Photo Manager (100% Untouched Quality)
                </h3>
                <p className="text-xs sm:text-sm text-[#6E445B]">
                  Upload or paste (<kbd className="font-mono font-semibold">Ctrl+V</kbd>) your exact
                  photos—saved permanently on the server without any AI changes or compression.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-[#6E445B] hover:text-[#2D1625] hover:bg-[#FDF2F7] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {slots.map((slot) => {
                const isCustom = photos[slot.key] !== defaultPhotos[slot.key];
                return (
                  <div
                    key={slot.key}
                    className="rounded-2xl bg-[#FFF9FB] border border-[#F2D5E4] p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="aspect-[4/5] w-full rounded-xl overflow-hidden bg-[#1A0B14] mb-3 border border-[#F3D8E6] flex items-center justify-center">
                        <img
                          src={photos[slot.key]}
                          alt={slot.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-display text-lg font-semibold text-[#2D1625]">
                          {slot.title}
                        </h4>
                        {isCustom && (
                          <span className="text-[11px] font-semibold text-emerald-700">
                            Exact Loaded
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A5A75]">{slot.subtitle}</p>
                    </div>

                    <div className="space-y-2 pt-2">
                      <label className="w-full py-2.5 px-3 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Select Exact Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(slot.key, e)}
                        />
                      </label>
                      {isCustom && (
                        <button
                          type="button"
                          onClick={() => onUpdatePhoto(slot.key, defaultPhotos[slot.key])}
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-[#EBC5D8] text-[#6E445B] text-xs font-semibold hover:text-[#2D1625] cursor-pointer"
                        >
                          Restore Default
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-[#F3D8E6] flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={onSwapPortraits}
                  className="px-3.5 py-2 rounded-xl bg-[#FDF2F7] border border-[#EBC5D8] text-xs font-semibold text-[#2D1625] hover:bg-[#FCE7F3] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 text-[#C81E5B]" />
                  <span>Swap Portrait I &amp; II</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSetupHidden(!setupHidden)}
                  className="px-3.5 py-2 rounded-xl border border-[#EBC5D8] text-xs font-semibold text-[#6E445B] hover:text-[#2D1625] cursor-pointer"
                >
                  {setupHidden ? 'Show Top Quick-Paste Bar' : 'Hide Top Quick-Paste Bar'}
                </button>

                <button
                  type="button"
                  onClick={onResetAll}
                  className="px-3.5 py-2 rounded-xl border border-[#EBC5D8] text-xs font-semibold text-[#6E445B] hover:text-[#2D1625] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#2D1625] text-white text-xs font-semibold hover:opacity-90 flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Save &amp; Done</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
