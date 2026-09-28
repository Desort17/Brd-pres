import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Flame, RotateCcw, Sparkles } from 'lucide-react';
import { musicBox } from '../utils/musicBox';

interface BirthdayCakeSectionProps {
  onCandlesBlown: () => void;
  skyTheme?: 'midnight' | 'twilight';
}

// TypeScript Web Speech API declarations
interface SpeechRecognitionEvent extends Event {
  results: {
    length: number;
    [index: number]: {
      length: number;
      [index: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: (() => void) | null;
}

const CANDLE_POSITIONS = [
  { id: 1, x: 145, color: '#F472B6' },
  { id: 2, x: 172, color: '#C084FC' },
  { id: 3, x: 200, color: '#EC4899' },
  { id: 4, x: 228, color: '#C084FC' },
  { id: 5, x: 255, color: '#F472B6' },
];

export const BirthdayCakeSection: React.FC<BirthdayCakeSectionProps> = ({
  onCandlesBlown,
  skyTheme = 'midnight',
}) => {
  const [candlesLit, setCandlesLit] = useState<boolean[]>([true, true, true, true, true]);
  const [isListening, setIsListening] = useState(false);
  const [micLevel, setMicLevel] = useState(0);
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>(
    'Tap "Enable Voice & Breath Sensor" and say "Blow" (or blow gently into your microphone).'
  );
  const [wishRevealed, setWishRevealed] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);
  const isListeningRef = useRef(false);

  const allExtinguished = candlesLit.every((lit) => !lit);

  const extinguishAllCandles = useCallback(
    (reason: string) => {
      setCandlesLit((prev) => {
        const wasAnyLit = prev.some(Boolean);
        if (wasAnyLit) {
          musicBox.playCelebrationChord();
          onCandlesBlown();
        }
        return [false, false, false, false, false];
      });
      setWishRevealed(true);
      setStatusMessage(reason);
    },
    [onCandlesBlown]
  );

  const stopSensors = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);
    setMicLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore stop errors
      }
      recognitionRef.current = null;
    }

    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
  }, []);

  const startSensors = async () => {
    if (allExtinguished) {
      setCandlesLit([true, true, true, true, true]);
      setWishRevealed(false);
    }

    isListeningRef.current = true;
    setIsListening(true);
    setVoiceTranscript('');
    setStatusMessage('Listening... Say "Blow" out loud or blow gently into your microphone!');

    // 1. Setup Web Speech API for "blow" / "wish" keyword detection
    const SpeechRec =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionInstance })
        .SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionInstance })
        .webkitSpeechRecognition;

    if (SpeechRec) {
      try {
        const recognition = new SpeechRec();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let combined = '';
          for (let i = 0; i < event.results.length; i++) {
            combined += ' ' + event.results[i][0].transcript;
          }
          const cleaned = combined.trim().toLowerCase();
          if (cleaned) {
            setVoiceTranscript(cleaned.slice(-45));
          }

          if (
            cleaned.includes('blow') ||
            cleaned.includes('blue') ||
            cleaned.includes('low') ||
            cleaned.includes('wish') ||
            cleaned.includes('off') ||
            cleaned.includes('happy birthday')
          ) {
            extinguishAllCandles('You said "Blow"! Every candle has been blown out—may your wish come true!');
            stopSensors();
          }
        };

        recognition.onerror = () => {
          // Keep audio stream fallback active even if speech API encounters an issue
        };

        recognition.onend = () => {
          if (isListeningRef.current) {
            try {
              recognition.start();
            } catch {
              // ignore restart error
            }
          }
        };

        recognition.start();
        recognitionRef.current = recognition;
      } catch {
        // SpeechRecognition might not be supported in some environments; audio stream below still works
      }
    }

    // 2. Setup Microphone Audio Stream for physical blowing detection
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      let sustainedFrames = 0;

      const checkVolume = () => {
        if (!isListeningRef.current) return;
        analyser.getByteFrequencyData(dataArray);

        // Focus on low-to-mid frequencies characteristic of blowing air or speaking "blow"
        let sum = 0;
        const bins = 36;
        for (let i = 0; i < bins; i++) {
          sum += dataArray[i];
        }
        const avg = sum / bins;
        const normalized = Math.min(100, Math.round((avg / 140) * 100));
        setMicLevel(normalized);

        if (normalized > 52) {
          sustainedFrames += 1;
          if (sustainedFrames >= 6) {
            extinguishAllCandles(
              'Your breath & voice blew out the birthday candles! Make your deepest wish, My Princess.'
            );
            stopSensors();
            return;
          }
        } else {
          sustainedFrames = Math.max(0, sustainedFrames - 1);
        }

        rafRef.current = requestAnimationFrame(checkVolume);
      };

      rafRef.current = requestAnimationFrame(checkVolume);
    } catch {
      setStatusMessage(
        'Voice recognition active! Say "Blow" or tap a candle / the "Blow Out Candles" button below.'
      );
    }
  };

  useEffect(() => {
    return () => {
      stopSensors();
    };
  }, [stopSensors]);

  const toggleSingleCandle = (index: number) => {
    setCandlesLit((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      const nowAllOut = next.every((c) => !c);
      if (nowAllOut) {
        musicBox.playCelebrationChord();
        onCandlesBlown();
        setWishRevealed(true);
        setStatusMessage('All five birthday candles are blown out! Your royal wish is sealed.');
      }
      return next;
    });
  };

  const relightCandles = () => {
    setCandlesLit([true, true, true, true, true]);
    setWishRevealed(false);
    setVoiceTranscript('');
    setStatusMessage('Candles relit and glowing warmly! Say "Blow" or tap to make another wish.');
  };

  const isMidnight = skyTheme === 'midnight';

  return (
    <section
      id="cake"
      className={`py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t ${
        isMidnight ? 'border-[#F472B6]/20' : 'border-[#F3D8E6]'
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Editorial Instructions & Voice Controls */}
        <div className="lg:col-span-5 space-y-6">
          <div
            className={`flex items-center gap-2 text-xs ${
              isMidnight ? 'text-[#E9D5FF]/80' : 'text-[#8A5A75]'
            }`}
          >
            <span>03. Make a Birthday Wish</span>
            <span aria-hidden="true">·</span>
            <span>Interactive Voice &amp; Breath Sensor</span>
          </div>

          <h2
            className={`font-display text-3xl sm:text-4xl font-semibold tracking-tight ${
              isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            Close Your Eyes, Say{' '}
            <span
              className={`italic font-normal ${
                isMidnight ? 'text-[#F9A8D4]' : 'text-[#C81E5B]'
              }`}
            >
              &ldquo;Blow&rdquo;
            </span>{' '}
            &amp; Make a Wish
          </h2>

          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isMidnight ? 'text-[#E9D5FF]/90' : 'text-[#6E445B]'
            }`}
          >
            A birthday for my princess isn&rsquo;t complete without a royal patisserie cake.
            Turn on the microphone sensor below and say{' '}
            <strong
              className={`font-semibold ${
                isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
              }`}
            >
              &ldquo;Blow&rdquo;
            </strong>{' '}
            out loud (or blow gently into your mic), and watch the candles extinguish with a
            shower of blossoms and wishing stars.
          </p>

          {/* Live Sensor Status Box */}
          <div className="p-5 rounded-2xl bg-[#FDF2F7] border border-[#F2D5E4] space-y-3">
            <div className="flex items-center justify-between text-xs text-[#7A4964]">
              <span className="font-semibold text-[#2D1625]">
                {isListening ? 'Microphone Listening Active' : 'Candle Status'}
              </span>
              <span className="tabular-nums">
                {candlesLit.filter(Boolean).length} of 5 candles lit
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#6E445B] leading-snug">{statusMessage}</p>

            {isListening && (
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs text-[#8A5A75] tabular-nums">
                  <span>Voice / Breath Intensity</span>
                  <span>{micLevel}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white overflow-hidden border border-[#F1CEE0]">
                  <div
                    className="h-full bg-gradient-to-r from-[#EC4899] to-[#9333EA] transition-all duration-100"
                    style={{ width: `${Math.max(6, micLevel)}%` }}
                  />
                </div>
                {voiceTranscript && (
                  <p className="text-xs text-[#9D174D] italic truncate">
                    Heard: &ldquo;{voiceTranscript}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Interactive Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            {!isListening ? (
              <button
                type="button"
                onClick={startSensors}
                className="px-5 py-3 rounded-xl bg-[#C81E5B] text-white text-xs sm:text-sm font-semibold hover:bg-[#AD164B] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                <Mic className="w-4 h-4" />
                <span>Enable Voice (&ldquo;Blow&rdquo;) Sensor</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopSensors}
                className="px-5 py-3 rounded-xl bg-[#7E22CE] text-white text-xs sm:text-sm font-semibold hover:bg-[#6B21A8] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
              >
                <MicOff className="w-4 h-4" />
                <span>Stop Voice Sensor</span>
              </button>
            )}

            {!allExtinguished ? (
              <button
                type="button"
                onClick={() =>
                  extinguishAllCandles(
                    'Wishes sent to the sky! Every candle has been blown out for My Princess.'
                  )
                }
                className="px-5 py-3 rounded-xl bg-white border border-[#EBC5D8] text-[#2D1625] text-xs sm:text-sm font-semibold hover:bg-[#FDF2F7] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Flame className="w-4 h-4 text-[#C81E5B]" />
                <span>Say &ldquo;Blow&rdquo; / Blow Out Now</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={relightCandles}
                className="px-5 py-3 rounded-xl bg-white border border-[#EBC5D8] text-[#2D1625] text-xs sm:text-sm font-semibold hover:bg-[#FDF2F7] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#7E22CE]" />
                <span>Relight All Candles</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Interactive SVG Royal Birthday Cake */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center">
          <div className="w-full max-w-xl rounded-3xl bg-white border border-[#F3D8E6] p-6 sm:p-10 shadow-[0_18px_45px_-15px_rgba(190,24,93,0.08)] flex flex-col items-center">
            <div className="flex items-center justify-between w-full text-xs text-[#8A5A75] mb-2">
              <span>Royal Rose &amp; Lavender Patisserie</span>
              <span>Tap any candle or say &ldquo;Blow&rdquo;</span>
            </div>

            <svg
              viewBox="0 0 400 320"
              className="w-full max-w-[420px] h-auto select-none overflow-visible"
              role="img"
              aria-label="Interactive birthday cake with 5 candles"
            >
              <defs>
                <radialGradient id="flameGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#FDE047" stopOpacity="0.85" />
                  <stop offset="55%" stopColor="#FB923C" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#F472B6" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="topTierGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#FCE7F3" />
                  <stop offset="100%" stopColor="#FBCFE8" />
                </linearGradient>
                <linearGradient id="bottomTierGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#F3E8FF" />
                  <stop offset="100%" stopColor="#E9D5FF" />
                </linearGradient>
                <linearGradient id="icingDripGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#F472B6" />
                  <stop offset="50%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#F472B6" />
                </linearGradient>
              </defs>

              {/* Cake Pedestal Stand */}
              <ellipse cx="200" cy="286" rx="145" ry="14" fill="#F5D0E3" />
              <rect x="70" y="274" width="260" height="12" rx="6" fill="#FDF2F7" stroke="#EBC5D8" strokeWidth="1.5" />
              <path d="M165 286 L150 308 L250 308 L235 286 Z" fill="#F5D0E3" stroke="#EBC5D8" strokeWidth="1.5" />
              <ellipse cx="200" cy="308" rx="62" ry="7" fill="#EBC5D8" />

              {/* Bottom Cake Tier (Lavender Velvet) */}
              <rect
                x="88"
                y="192"
                width="224"
                height="84"
                rx="14"
                fill="url(#bottomTierGrad)"
                stroke="#D8B4FE"
                strokeWidth="2"
              />
              {/* Bottom Tier Decorative Gold & Rose Garland */}
              <path
                d="M90 232 Q118 248 145 232 Q172 248 200 232 Q228 248 255 232 Q282 248 310 232"
                fill="none"
                stroke="#C084FC"
                strokeWidth="2.5"
                strokeDasharray="3 3"
              />
              {/* Bottom Tier Frosting Drips */}
              <path
                d="M88 202 C102 202, 104 222, 114 222 C124 222, 126 204, 138 204 C150 204, 152 226, 164 226 C176 226, 178 204, 190 204 C202 204, 204 224, 216 224 C228 224, 230 204, 242 204 C254 204, 256 225, 268 225 C280 225, 282 204, 294 204 C304 204, 306 218, 312 218 L312 192 L88 192 Z"
                fill="#F9A8D4"
              />

              {/* Pearls along base of bottom tier */}
              {[100, 116, 132, 148, 164, 180, 196, 212, 228, 244, 260, 276, 292, 304].map((cx) => (
                <circle key={cx} cx={cx} cy="272" r="5" fill="#FFF9FB" stroke="#F472B6" strokeWidth="1.2" />
              ))}

              {/* Top Cake Tier (Blush Rose Sponge) */}
              <rect
                x="118"
                y="118"
                width="164"
                height="76"
                rx="12"
                fill="url(#topTierGrad)"
                stroke="#F9A8D4"
                strokeWidth="2"
              />
              {/* Top Tier Silk Icing Drips */}
              <path
                d="M118 128 C128 128, 130 146, 140 146 C150 146, 152 128, 164 128 C176 128, 178 150, 190 150 C202 150, 204 128, 216 128 C228 128, 230 148, 242 148 C254 148, 256 128, 268 128 C276 128, 278 142, 282 142 L282 118 L118 118 Z"
                fill="url(#icingDripGrad)"
              />

              {/* "My Princess" Plaque on Cake Front */}
              <rect
                x="146"
                y="152"
                width="108"
                height="26"
                rx="13"
                fill="#FFF9FB"
                stroke="#F472B6"
                strokeWidth="1.5"
              />
              <text
                x="200"
                y="169"
                textAnchor="middle"
                fill="#C81E5B"
                fontSize="12"
                fontStyle="italic"
                fontWeight="600"
                fontFamily="Cormorant Garamond, Georgia, serif"
              >
                My Princess
              </text>

              {/* Buttercream Rosettes on Top Rim */}
              {[130, 158, 186, 214, 242, 270].map((cx) => (
                <circle key={cx} cx={cx} cy="118" r="8" fill="#FFF1F5" stroke="#F472B6" strokeWidth="1.4" />
              ))}

              {/* 5 Interactive Birthday Candles */}
              {CANDLE_POSITIONS.map((candle, idx) => {
                const isLit = candlesLit[idx];
                return (
                  <g
                    key={candle.id}
                    onClick={() => toggleSingleCandle(idx)}
                    className="cursor-pointer"
                  >
                    {/* Candle Body */}
                    <rect
                      x={candle.x - 5}
                      y="72"
                      width="10"
                      height="44"
                      rx="3"
                      fill="#FFF9FB"
                      stroke={candle.color}
                      strokeWidth="1.5"
                    />
                    {/* Diagonal Stripes */}
                    <line
                      x1={candle.x - 4}
                      y1="82"
                      x2={candle.x + 4}
                      y2="76"
                      stroke={candle.color}
                      strokeWidth="2"
                    />
                    <line
                      x1={candle.x - 4}
                      y1="96"
                      x2={candle.x + 4}
                      y2="90"
                      stroke={candle.color}
                      strokeWidth="2"
                    />
                    <line
                      x1={candle.x - 4}
                      y1="110"
                      x2={candle.x + 4}
                      y2="104"
                      stroke={candle.color}
                      strokeWidth="2"
                    />
                    {/* Candle Wick */}
                    <line
                      x1={candle.x}
                      y1="65"
                      x2={candle.x}
                      y2="72"
                      stroke="#4A253B"
                      strokeWidth="1.8"
                    />

                    {/* Flame or Rising Smoke */}
                    {isLit ? (
                      <g className="animate-flame" style={{ transformOrigin: `${candle.x}px 65px` }}>
                        <circle cx={candle.x} cy="52" r="22" fill="url(#flameGlow)" />
                        <path
                          d={`M ${candle.x} 34 C ${candle.x + 8} 46, ${candle.x + 7} 62, ${candle.x} 65 C ${candle.x - 7} 62, ${candle.x - 8} 46, ${candle.x} 34 Z`}
                          fill="#FB923C"
                        />
                        <path
                          d={`M ${candle.x} 41 C ${candle.x + 4.5} 49, ${candle.x + 4} 60, ${candle.x} 63 C ${candle.x - 4} 60, ${candle.x - 4.5} 49, ${candle.x} 41 Z`}
                          fill="#FEF08A"
                        />
                      </g>
                    ) : (
                      <g className="animate-smoke">
                        <path
                          d={`M ${candle.x} 62 Q ${candle.x - 7} 50 ${candle.x + 4} 38 Q ${candle.x + 10} 26 ${candle.x - 3} 16`}
                          fill="none"
                          stroke="#9D7A8F"
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Wish Revealed Celebration Banner inside Cake Card */}
            <AnimatePresence>
              {wishRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.35 }}
                  className="mt-4 w-full p-5 rounded-2xl bg-gradient-to-r from-[#FDF2F7] via-[#F5F0FF] to-[#FDF2F7] border border-[#EBC5D8] text-center space-y-2"
                >
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#C81E5B]">
                    <Sparkles className="w-4 h-4" />
                    <span>Happy Birthday, My Princess!</span>
                  </div>
                  <p className="font-display text-xl sm:text-2xl font-semibold text-[#2D1625]">
                    &ldquo;May every silent prayer in your heart bloom into reality this year.&rdquo;
                  </p>
                  <p className="text-xs sm:text-sm text-[#6E445B] max-w-md mx-auto">
                    May this new chapter replace every tear you ever cried with peace, laughter,
                    and the endless love you deserve.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
