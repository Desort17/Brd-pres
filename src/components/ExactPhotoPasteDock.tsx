import React, { useState, useEffect } from 'react';
import { Upload, ArrowLeftRight, Check, ClipboardPaste, EyeOff } from 'lucide-react';
import { CustomPhotosState } from './PhotoPersonalizerModal';
import {
  readRawFileAsDataUrl,
  detectPhotoSlot,
} from '../utils/exactPhotoStore';

interface ExactPhotoPasteDockProps {
  photos: CustomPhotosState;
  defaultPhotos: CustomPhotosState;
  onUpdateMultiple: (updates: Partial<CustomPhotosState>) => Promise<void>;
  onSwapPortraits: () => Promise<void>;
  onLockSetup: () => void;
}

export const ExactPhotoPasteDock: React.FC<ExactPhotoPasteDockProps> = ({
  photos,
  defaultPhotos,
  onUpdateMultiple,
  onSwapPortraits,
  onLockSetup,
}) => {
  const [statusNote, setStatusNote] = useState<string>('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const hasExactPortrait1 = photos.portrait1 !== defaultPhotos.portrait1;
  const hasExactPortrait2 = photos.portrait2 !== defaultPhotos.portrait2;
  const hasExactTeddy = photos.teddy !== defaultPhotos.teddy;

  const processFiles = async (files: FileList | File[]) => {
    const imageFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (imageFiles.length === 0) return;

    setStatusNote('Saving your exact original photo(s) at 100% untouched quality...');
    const updates: Partial<CustomPhotosState> = {};

    if (imageFiles.length === 1) {
      const dataUrl = await readRawFileAsDataUrl(imageFiles[0]);
      const detectedSlot = await detectPhotoSlot(dataUrl);
      // If one slot is already filled and user pastes a second portrait, put it in the remaining empty portrait slot
      if (detectedSlot === 'teddy') {
        updates.teddy = dataUrl;
      } else if (!hasExactPortrait1 && hasExactPortrait2) {
        updates.portrait1 = dataUrl;
      } else if (hasExactPortrait1 && !hasExactPortrait2) {
        updates.portrait2 = dataUrl;
      } else {
        updates[detectedSlot] = dataUrl;
      }
    } else {
      for (let i = 0; i < imageFiles.length; i++) {
        const dataUrl = await readRawFileAsDataUrl(imageFiles[i]);
        const detectedSlot = await detectPhotoSlot(dataUrl);
        if (detectedSlot === 'teddy') {
          updates.teddy = dataUrl;
        } else if (detectedSlot === 'portrait1' && !updates.portrait1) {
          updates.portrait1 = dataUrl;
        } else if (detectedSlot === 'portrait2' && !updates.portrait2) {
          updates.portrait2 = dataUrl;
        } else if (!updates.portrait1) {
          updates.portrait1 = dataUrl;
        } else if (!updates.portrait2) {
          updates.portrait2 = dataUrl;
        } else {
          updates.teddy = dataUrl;
        }
      }
    }

    await onUpdateMultiple(updates);
    setStatusNote(
      'Exact original photo(s) saved permanently! Click "Lock & Hide Bar" when ready to show her.'
    );
  };

  const handleSingleSlotUpload = async (
    slot: keyof CustomPhotosState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatusNote('Saving your exact untouched photo...');
    const dataUrl = await readRawFileAsDataUrl(file);
    await onUpdateMultiple({ [slot]: dataUrl });
    setStatusNote('Exact photo saved at 100% original resolution!');
  };

  // Global Ctrl+V / Cmd+V clipboard paste listener and drag-and-drop listener
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      const pastedFiles: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const f = items[i].getAsFile();
          if (f) pastedFiles.push(f);
        }
      }
      if (pastedFiles.length > 0) {
        await processFiles(pastedFiles);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      if (e.relatedTarget === null) {
        setIsDraggingOver(false);
      }
    };

    const handleDrop = async (e: DragEvent) => {
      e.preventDefault();
      setIsDraggingOver(false);
      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        await processFiles(e.dataTransfer.files);
      }
    };

    window.addEventListener('paste', handlePaste);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('drop', handleDrop);
    return () => {
      window.removeEventListener('paste', handlePaste);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('drop', handleDrop);
    };
  });

  return (
    <div
      className={`sticky top-0 z-50 border-b transition-colors px-4 py-3 ${
        isDraggingOver
          ? 'bg-[#FCE7F3] border-[#C81E5B]'
          : 'bg-[#2D1625] text-white border-[#4A253B]'
      }`}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C81E5B] text-white flex items-center justify-center shrink-0">
            <ClipboardPaste className="w-4 h-4" />
          </div>
          <div className="text-xs leading-snug">
            <p className="font-semibold text-white">
              Insert Your Exact Unmodified Photos (Paste{' '}
              <kbd className="px-1.5 py-0.5 rounded bg-white/15 text-[#F9A8D4] font-mono">
                Ctrl+V
              </kbd>{' '}
              Anywhere, Drag &amp; Drop, or Select Below):
            </p>
            <p className="text-[#EBC5D8]">
              {statusNote ||
                'Chat box attachments cannot be copied automatically by the server—paste or select your 2 exact photos here for 100% original pixels with zero AI changes.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Select Both Photos at Once */}
          <label className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#9333EA] text-white text-xs font-semibold hover:opacity-95 transition-opacity flex items-center gap-1.5 cursor-pointer whitespace-nowrap shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            <span>Select Your 2 Exact Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) processFiles(e.target.files);
              }}
            />
          </label>

          {/* Individual Slot 1: 35mm Film Close-up */}
          <label
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              hasExactPortrait1
                ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            }`}
          >
            {hasExactPortrait1 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>1: Film Strip Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSingleSlotUpload('portrait1', e)}
            />
          </label>

          {/* Individual Slot 2: Cathedral Photo */}
          <label
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              hasExactPortrait2
                ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            }`}
          >
            {hasExactPortrait2 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>2: Cathedral Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSingleSlotUpload('portrait2', e)}
            />
          </label>

          {/* Individual Slot 3: Bunny Teddy */}
          <label
            className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              hasExactTeddy
                ? 'bg-emerald-950/60 border-emerald-400/50 text-emerald-200'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/15'
            }`}
          >
            {hasExactTeddy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
            <span>3: Bunny Photo</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleSingleSlotUpload('teddy', e)}
            />
          </label>

          {/* Swap Portrait 1 & 2 */}
          <button
            type="button"
            onClick={onSwapPortraits}
            title="Swap Portrait 1 and Portrait 2"
            className="px-2.5 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-semibold hover:bg-white/15 flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Swap 1 &amp; 2</span>
          </button>

          {/* Lock & Hide Bar for Her */}
          <button
            type="button"
            onClick={onLockSetup}
            className="px-3 py-2 rounded-xl bg-white text-[#2D1625] text-xs font-semibold hover:bg-[#FDF2F7] flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <EyeOff className="w-3.5 h-3.5 text-[#C81E5B]" />
            <span>Lock &amp; Hide Bar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
