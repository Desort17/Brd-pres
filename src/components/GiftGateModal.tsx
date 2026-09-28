import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Gift, Heart } from 'lucide-react';

interface GiftGateModalProps {
  onAccept: () => void;
  teddyImage: string;
  floralBackdrop: string;
  skyTheme?: 'midnight' | 'twilight';
}

const RUNAWAY_TEASES = [
  'Press "Yes" to unwrap your birthday sanctuary.',
  'Wait! My heart refuses to accept "No" on your birthday!',
  'Nice try, My Princess — that button is way too fast for you!',
  'Even your fluffy white bunny says you have to click Yes!',
  'Catch me if you can... or just let me spoil you today!',
  'Resistance is futile, Princess. Your gift is waiting!',
  'Okay, look how cute the bunny is asking. Click Yes!',
];

export const GiftGateModal: React.FC<GiftGateModalProps> = ({
  onAccept,
  teddyImage,
  floralBackdrop,
  skyTheme = 'midnight',
}) => {
  const [noOffset, setNoOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [escapeCount, setEscapeCount] = useState(0);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const evadeCursor = () => {
    const stage = stageRef.current;
    const maxOffsetX = stage ? Math.min(200, Math.floor(stage.clientWidth * 0.32)) : 140;
    const maxOffsetY = 105;

    let nextX = (Math.random() * 2 - 1) * maxOffsetX;
    let nextY = (Math.random() * 2 - 1) * maxOffsetY;

    if (Math.abs(nextX - noOffset.x) < 60) {
      nextX = noOffset.x > 0 ? -maxOffsetX * 0.8 : maxOffsetX * 0.8;
    }
    if (Math.abs(nextY - noOffset.y) < 40) {
      nextY = noOffset.y > 0 ? -maxOffsetY * 0.75 : maxOffsetY * 0.75;
    }

    setNoOffset({ x: Math.round(nextX), y: Math.round(nextY) });
    setEscapeCount((prev) => prev + 1);
  };

  const currentTease =
    RUNAWAY_TEASES[Math.min(escapeCount, RUNAWAY_TEASES.length - 1)];

  const yesScale = Math.min(1.16, 1 + escapeCount * 0.025);
  const isMidnight = skyTheme === 'midnight';

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center px-4 py-12 overflow-hidden bg-transparent">
      {/* Subtle floral sanctuary aura blended into the Midnight Sky */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isMidnight ? 'opacity-12 mix-blend-screen' : 'opacity-20'
        }`}
      >
        <img
          src={floralBackdrop}
          alt="Romantic floral sanctuary backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
      </div>

      <motion.div
        ref={stageRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-30 w-full max-w-2xl rounded-3xl bg-white/95 backdrop-blur-md border border-[#F3D8E6] shadow-[0_24px_70px_-15px_rgba(236,72,153,0.28)] p-8 sm:p-12 text-center"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-[#8A5A75] mb-6">
          <span>A Starlit Birthday Sanctuary</span>
          <span aria-hidden="true">·</span>
          <span>Prepared Exclusively For My Princess</span>
        </div>

        {/* Plush Bunny Companion Preview */}
        <div className="relative mx-auto mb-7 w-36 h-36 sm:w-40 sm:h-40 rounded-full p-1.5 bg-gradient-to-tr from-[#F9A8D4] via-[#E9D5FF] to-[#FBCFE8] shadow-md">
          <div className="w-full h-full rounded-full overflow-hidden bg-[#FDF2F7]">
            <img
              src={teddyImage}
              alt="Fluffy white bunny teddy holding your birthday surprise"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="absolute -bottom-2 -right-1 w-10 h-10 rounded-full bg-[#C81E5B] text-white flex items-center justify-center shadow-sm">
            <Gift className="w-5 h-5" />
          </div>
        </div>

        <h1
          className="font-display text-3xl sm:text-5xl font-semibold text-[#2D1625] tracking-tight mb-4"
          style={{ textWrap: 'balance' }}
        >
          Do you want to see your birthday gift,{' '}
          <span className="italic text-[#C81E5B] font-normal">My Princess?</span>
        </h1>

        <p className="text-sm sm:text-base text-[#6E445B] max-w-lg mx-auto leading-relaxed mb-3">
          Under a midnight sky of twinkling stars and falling flower petals, I created a private
          world with your favorite portraits, healing letters, and a birthday cake waiting for your
          voice.
        </p>

        <p className="text-xs sm:text-sm font-semibold text-[#9D174D] min-h-[1.5rem] mb-8 transition-opacity duration-150">
          {currentTease}
        </p>

        {/* Interactive Yes / Runaway No Action Stage */}
        <div className="relative min-h-[110px] flex flex-wrap items-center justify-center gap-5">
          <motion.button
            type="button"
            onClick={onAccept}
            animate={{ scale: yesScale }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-[#C81E5B] to-[#9333EA] text-white text-sm sm:text-base font-semibold shadow-md hover:opacity-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C81E5B] transition-opacity flex items-center gap-2.5 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>Yes, Open My Gift</span>
          </motion.button>

          <motion.button
            type="button"
            onMouseEnter={evadeCursor}
            onTouchStart={(e) => {
              e.preventDefault();
              evadeCursor();
            }}
            onClick={(e) => {
              e.preventDefault();
              evadeCursor();
            }}
            animate={{ x: noOffset.x, y: noOffset.y }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            className="px-6 py-3.5 rounded-xl bg-[#FDF2F7] border border-[#F1CEE0] text-[#7A4964] text-sm sm:text-base font-semibold hover:text-[#2D1625] whitespace-nowrap shrink-0 select-none cursor-pointer"
          >
            {escapeCount === 0
              ? 'No, Maybe Later'
              : escapeCount < 4
              ? 'No (Catch Me!)'
              : 'Impossible to Click No'}
          </motion.button>
        </div>

        {escapeCount > 0 && (
          <div className="mt-4 text-xs text-[#8A5A75] tabular-nums">
            <span>Runaway attempts dodged: {escapeCount}</span>
            <span aria-hidden="true"> · </span>
            <span>Only &ldquo;Yes&rdquo; unlocks your surprise</span>
          </div>
        )}
      </motion.div>
    </div>
  );
};
