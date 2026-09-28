import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { musicBox } from '../utils/musicBox';

interface AffirmationItem {
  id: string;
  chapter: string;
  theme: string;
  quote: string;
  reflection: string;
}

const AFFIRMATIONS: AffirmationItem[] = [
  {
    id: 'aff-1',
    chapter: 'Truth 01',
    theme: 'On Your Unmatched Beauty',
    quote:
      'You are the kind of beautiful that makes time slow down—where green eyes hold entire galaxies and a single glance feels like warm golden hour.',
    reflection:
      'Never doubt for a moment how captivating you are. Your beauty is effortless, rare, and unforgettable.',
  },
  {
    id: 'aff-2',
    chapter: 'Truth 02',
    theme: 'On the Suffering You Overcame',
    quote:
      'You have walked through storms that would have hardened anyone else, yet you emerged with the softest heart and the purest soul.',
    reflection:
      'Every painful season you survived is proof of your quiet, unbreakable courage. You are allowed to exhale now.',
  },
  {
    id: 'aff-3',
    chapter: 'Truth 03',
    theme: 'On Your Presence in This World',
    quote:
      'Just like sunlight pouring through cathedral stained glass, your presence turns ordinary moments into something sacred and luminous.',
    reflection:
      'The world is infinitely gentler, warmer, and brighter simply because you were born.',
  },
  {
    id: 'aff-4',
    chapter: 'Truth 04',
    theme: 'On Days When You Feel Exhausted',
    quote:
      'Even on the days when your heart feels heavy or tired, you do not have to earn love by being strong—you are cherished unconditionally right now.',
    reflection:
      'Rest when you need to, My Princess. You are safe, valued, and endlessly adored.',
  },
  {
    id: 'aff-5',
    chapter: 'Truth 05',
    theme: 'On Your New Birthday Chapter',
    quote:
      'May this year return to you tenfold all the kindness, patience, and love you have poured into the world despite everything you suffered.',
    reflection:
      'Happy Birthday, My Princess. Your best, happiest, most peaceful chapters begin today.',
  },
];

interface AffirmationMirrorSectionProps {
  onShowerFlowers: () => void;
}

export const AffirmationMirrorSection: React.FC<AffirmationMirrorSectionProps> = ({
  onShowerFlowers,
}) => {
  const [index, setIndex] = useState(0);
  const [hugCount, setHugCount] = useState(24);

  const current = AFFIRMATIONS[index];

  const handleNext = () => {
    musicBox.playChime();
    setIndex((prev) => (prev + 1) % AFFIRMATIONS.length);
  };

  const handlePrev = () => {
    musicBox.playChime();
    setIndex((prev) => (prev - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length);
  };

  const handleSendPetalLove = () => {
    musicBox.playChime();
    setHugCount((prev) => prev + 1);
    onShowerFlowers();
  };

  return (
    <section
      id="radiant-soul"
      className="py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t border-[#F3D8E6]"
    >
      <div className="rounded-3xl bg-gradient-to-br from-[#FFF5F9] via-[#FFF9FB] to-[#F7F0FF] border border-[#EBC5D8] p-8 sm:p-14 shadow-[0_18px_45px_-15px_rgba(190,24,93,0.07)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-8 border-b border-[#F3D8E6]">
          <div className="flex items-center gap-2 text-xs text-[#8A5A75] tabular-nums">
            <span>04. The Mirror of Truth</span>
            <span aria-hidden="true">·</span>
            <span>{current.chapter} of 05</span>
            <span aria-hidden="true">·</span>
            <span>{current.theme}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#8A5A75] tabular-nums">
            <span>Flower Blessings Sent Today: {hugCount}</span>
          </div>
        </div>

        <div className="py-10 sm:py-14 max-w-3xl mx-auto text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <p
                className="font-display text-2xl sm:text-4xl font-semibold text-[#2D1625] leading-snug"
                style={{ textWrap: 'balance' }}
              >
                &ldquo;{current.quote}&rdquo;
              </p>

              <p className="text-sm sm:text-base text-[#6E445B] max-w-xl mx-auto leading-relaxed">
                {current.reflection}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="pt-6 border-t border-[#F3D8E6] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#EBC5D8] text-xs font-semibold text-[#2D1625] hover:bg-[#FDF2F7] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Quote</span>
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#EBC5D8] text-xs font-semibold text-[#2D1625] hover:bg-[#FDF2F7] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Next Quote</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendPetalLove}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C81E5B] to-[#9333EA] text-white text-xs sm:text-sm font-semibold hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>Shower Flowers For Her Smile</span>
            <Heart className="w-3.5 h-3.5 fill-current" />
          </button>
        </div>
      </div>
    </section>
  );
};
