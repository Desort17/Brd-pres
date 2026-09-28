/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Heart,
  Sparkles,
  Camera,
  Maximize2,
  X,
  Upload,
  Moon,
  Sun,
} from 'lucide-react';
import { MidnightSkyCanvas } from './components/MidnightSkyCanvas';
import { FlowerShowerCanvas } from './components/FlowerShowerCanvas';
import { GiftGateModal } from './components/GiftGateModal';
import { BirthdayCakeSection } from './components/BirthdayCakeSection';
import { EnvelopesSection } from './components/EnvelopesSection';
import { AffirmationMirrorSection } from './components/AffirmationMirrorSection';
import {
  PhotoPersonalizerModal,
  CustomPhotosState,
} from './components/PhotoPersonalizerModal';
import { ExactPhotoPasteDock } from './components/ExactPhotoPasteDock';
import {
  readRawFileAsDataUrl,
  loadLocalExactManifest,
  saveLocalExactManifest,
  clearLocalExactManifest,
  fetchServerManifest,
  saveServerManifest,
} from './utils/exactPhotoStore';
import { musicBox, MELODIES, MelodyId } from './utils/musicBox';
import exactPortrait1 from './assets/exact/portrait1.jpg';
import exactPortrait2 from './assets/exact/portrait2.jpg';
import exactTeddy from './assets/exact/teddy.jpg';
import floralSanctuaryBg from './assets/images/romantic_floral_sanctuary_1790573138614.jpg';

const DEFAULT_PHOTOS: CustomPhotosState = {
  portrait1: exactPortrait1,
  portrait2: exactPortrait2,
  teddy: exactTeddy,
};

const FLORAL_SANCTUARY_BG = floralSanctuaryBg;

const BUNNY_HUG_MESSAGES = [
  'Your fluffy bunny teddy sends you the warmest, softest birthday squeeze!',
  'Whenever you feel tired or overwhelmed, imagine this cuddle wrapping around your heart.',
  'Look at those fluffy pink ears—even your bunny knows you are the prettiest princess alive!',
  'A thousand warm hugs for the girl who survived every storm and still shines so brightly.',
  'Happy Birthday, My Princess! You are deeply, endlessly, unconditionally loved.',
];

export default function App() {
  const [giftOpened, setGiftOpened] = useState<boolean>(false);
  const [burstCount, setBurstCount] = useState<number>(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);
  const [currentMelody, setCurrentMelody] = useState<MelodyId>('birthday');
  const [isPersonalizerOpen, setIsPersonalizerOpen] = useState<boolean>(false);
  const [teddyHugs, setTeddyHugs] = useState<number>(1);
  const [teddyHugActive, setTeddyHugActive] = useState<boolean>(false);
  const [setupHidden, setSetupHidden] = useState<boolean>(true);
  const [skyTheme, setSkyTheme] = useState<'midnight' | 'twilight'>('midnight');

  const [lightboxItem, setLightboxItem] = useState<{
    src: string;
    title: string;
    subtitle: string;
    quote: string;
    slotKey: keyof CustomPhotosState;
  } | null>(null);

  const [photos, setPhotos] = useState<CustomPhotosState>(DEFAULT_PHOTOS);

  // Load saved exact original photos from Server or IndexedDB if overridden with data:image
  useEffect(() => {
    let active = true;
    async function initExactPhotos() {
      const [localData, serverData] = await Promise.all([
        loadLocalExactManifest(),
        fetchServerManifest(),
      ]);

      if (!active) return;

      const pickValid = (val: string | null | undefined, fallback: string) => {
        if (!val) return fallback;
        // Ignore old server-only paths when running on static hosts like GitHub Pages
        if (val.startsWith('/exact-photos/') || val.startsWith('/src/')) {
          return fallback;
        }
        return val;
      };

      const resolved: CustomPhotosState = {
        portrait1: pickValid(
          serverData?.portrait1 || localData.portrait1,
          DEFAULT_PHOTOS.portrait1
        ),
        portrait2: pickValid(
          serverData?.portrait2 || localData.portrait2,
          DEFAULT_PHOTOS.portrait2
        ),
        teddy: pickValid(
          serverData?.teddy || localData.teddy,
          DEFAULT_PHOTOS.teddy
        ),
      };

      setPhotos(resolved);

      if (typeof serverData?.setupHidden === 'boolean') {
        setSetupHidden(serverData.setupHidden);
      } else if (typeof localData.setupHidden === 'boolean') {
        setSetupHidden(localData.setupHidden);
      }
    }
    initExactPhotos();
    return () => {
      active = false;
    };
  }, []);

  const handleUpdateMultiplePhotos = async (updates: Partial<CustomPhotosState>) => {
    setPhotos((prev) => ({ ...prev, ...updates }));
    await saveLocalExactManifest(updates);
    const serverUpdated = await saveServerManifest(updates);
    if (serverUpdated) {
      setPhotos((prev) => ({
        portrait1: serverUpdated.portrait1 || prev.portrait1,
        portrait2: serverUpdated.portrait2 || prev.portrait2,
        teddy: serverUpdated.teddy || prev.teddy,
      }));
    }
  };

  const updatePhoto = async (key: keyof CustomPhotosState, dataUrl: string) => {
    await handleUpdateMultiplePhotos({ [key]: dataUrl });
  };

  const handleSwapPortraits = async () => {
    const swapped = {
      portrait1: photos.portrait2,
      portrait2: photos.portrait1,
    };
    await handleUpdateMultiplePhotos(swapped);
  };

  const handleToggleSetupHidden = async (hidden: boolean) => {
    setSetupHidden(hidden);
    await saveLocalExactManifest({ setupHidden: hidden });
    await saveServerManifest({ setupHidden: hidden });
  };

  const resetAllPhotos = async () => {
    setPhotos(DEFAULT_PHOTOS);
    setSetupHidden(false);
    await clearLocalExactManifest();
    await saveServerManifest({ reset: true });
  };

  const triggerFlowerBurst = () => {
    setBurstCount((prev) => prev + 1);
  };

  const handleOpenGift = () => {
    setGiftOpened(true);
    triggerFlowerBurst();
    musicBox.playCelebrationChord();
    setTimeout(() => {
      musicBox.start('birthday');
      setIsMusicPlaying(true);
    }, 650);
  };

  const toggleMusic = () => {
    const nowPlaying = musicBox.toggle();
    setIsMusicPlaying(nowPlaying);
  };

  const handleMelodyChange = (melody: MelodyId) => {
    setCurrentMelody(melody);
    musicBox.setMelody(melody);
    if (!isMusicPlaying) {
      musicBox.start(melody);
      setIsMusicPlaying(true);
    }
  };

  const handleHugTeddy = () => {
    musicBox.playChime();
    setTeddyHugs((prev) => prev + 1);
    setTeddyHugActive(true);
    triggerFlowerBurst();
    setTimeout(() => setTeddyHugActive(false), 700);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxItem(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleQuickInlineUpload = async (
    key: keyof CustomPhotosState,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // 100% untouched original file — no resizing or compression
      const exactDataUrl = await readRawFileAsDataUrl(file);
      await updatePhoto(key, exactDataUrl);
      if (lightboxItem && lightboxItem.slotKey === key) {
        setLightboxItem({ ...lightboxItem, src: exactDataUrl });
      }
    } catch {
      // ignore
    }
  };

  const isMidnight = skyTheme === 'midnight';

  return (
    <div
      className={`min-h-screen relative selection:bg-[#F5D0E3] selection:text-[#2D1625] transition-colors duration-700 ${
        isMidnight
          ? 'bg-[#0B0414] text-[#FFF5F9]'
          : 'bg-[#FFF9FB] text-[#2D1625]'
      }`}
    >
      {/* Magical Midnight Sky Twinkling Starfield & Wishing Stars Background */}
      <MidnightSkyCanvas skyTheme={skyTheme} wishBurstCount={burstCount} />

      {/* Exact Photo Quick-Paste & Upload Dock (Can be locked & hidden once exact photos are loaded) */}
      {!setupHidden && (
        <ExactPhotoPasteDock
          photos={photos}
          defaultPhotos={DEFAULT_PHOTOS}
          onUpdateMultiple={handleUpdateMultiplePhotos}
          onSwapPortraits={handleSwapPortraits}
          onLockSetup={() => handleToggleSetupHidden(true)}
        />
      )}

      {/* Continuous & Burst Flower Petal Shower */}
      <FlowerShowerCanvas
        burstCount={burstCount}
        intensity={giftOpened ? 'lush' : 'normal'}
      />

      {!giftOpened ? (
        <GiftGateModal
          onAccept={handleOpenGift}
          teddyImage={photos.teddy}
          floralBackdrop={FLORAL_SANCTUARY_BG}
          skyTheme={skyTheme}
        />
      ) : (
        <div className="relative z-10">
          {/* Strict 3-Zone Top Bar Contract */}
          <header
            className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 sm:px-8 py-3.5 transition-colors ${
              isMidnight
                ? 'bg-[#120621]/80 border-[#F472B6]/25'
                : 'bg-[#FFF9FB]/90 border-[#F3D8E6]'
            }`}
          >
            <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
              {/* Zone 1: Single Text Element Wordmark */}
              <a
                href="#top"
                className={`font-display text-xl sm:text-2xl font-semibold tracking-tight whitespace-nowrap shrink-0 ${
                  isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
                }`}
              >
                For My Princess
              </a>

              {/* Zone 2: 5 Clean Text Navigation Links */}
              <nav
                className={`hidden md:flex items-center gap-7 text-xs sm:text-sm font-semibold ${
                  isMidnight ? 'text-[#E9D5FF]/85' : 'text-[#6E445B]'
                }`}
              >
                <a
                  href="#portraits"
                  className="hover:text-[#F472B6] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
                >
                  Portraits
                </a>
                <a
                  href="#envelopes"
                  className="hover:text-[#F472B6] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
                >
                  Love Letters
                </a>
                <a
                  href="#cake"
                  className="hover:text-[#F472B6] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
                >
                  Birthday Cake
                </a>
                <a
                  href="#radiant-soul"
                  className="hover:text-[#F472B6] hover:underline underline-offset-4 transition-colors whitespace-nowrap"
                >
                  Radiant Soul
                </a>
                <button
                  type="button"
                  onClick={() => setGiftOpened(false)}
                  className="hover:text-[#F472B6] hover:underline underline-offset-4 transition-colors whitespace-nowrap cursor-pointer"
                >
                  Gift Prompt
                </button>
              </nav>

              {/* Zone 3: 2 Primary Actions */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={toggleMusic}
                  className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer border ${
                    isMusicPlaying
                      ? 'bg-[#FDF2F7] border-[#F472B6] text-[#C81E5B]'
                      : 'bg-white border-[#EBC5D8] text-[#6E445B] hover:text-[#2D1625]'
                  }`}
                >
                  {isMusicPlaying ? (
                    <Volume2 className="w-3.5 h-3.5" />
                  ) : (
                    <VolumeX className="w-3.5 h-3.5" />
                  )}
                  <span>{isMusicPlaying ? 'Music Playing' : 'Play Music'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPersonalizerOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Exact Photos</span>
                </button>
              </div>
            </div>
          </header>

          {/* Split-Screen Editorial Hero Section */}
          <section
            id="top"
            className="pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-8 max-w-6xl mx-auto"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
              {/* Left Column: Animated Birthday Tribute & Music Selector */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-7 space-y-6"
              >
                <div
                  className={`flex flex-wrap items-center gap-2 text-xs ${
                    isMidnight ? 'text-[#E9D5FF]/85' : 'text-[#8A5A75]'
                  }`}
                >
                  <span>A Royal Starlit Birthday Celebration</span>
                  <span aria-hidden="true">·</span>
                  <span>Dedicated To Her Light &amp; Strength</span>
                  <span aria-hidden="true">·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setSkyTheme((prev) => (prev === 'midnight' ? 'twilight' : 'midnight'))
                    }
                    className={`inline-flex items-center gap-1 font-semibold underline underline-offset-4 cursor-pointer ${
                      isMidnight ? 'text-[#F9A8D4]' : 'text-[#C81E5B]'
                    }`}
                  >
                    {isMidnight ? (
                      <>
                        <Moon className="w-3.5 h-3.5" />
                        <span>Midnight Sky Active (Switch to Blush Dawn)</span>
                      </>
                    ) : (
                      <>
                        <Sun className="w-3.5 h-3.5" />
                        <span>Blush Dawn Active (Switch to Midnight Sky)</span>
                      </>
                    )}
                  </button>
                </div>

                <h1
                  className={`font-display text-4xl sm:text-6xl lg:text-[64px] font-semibold leading-[1.06] tracking-tight ${
                    isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
                  }`}
                  style={{ textWrap: 'balance' }}
                >
                  Happy Birthday,{' '}
                  <span
                    className={`italic font-normal ${
                      isMidnight ? 'text-[#F9A8D4]' : 'text-[#C81E5B]'
                    }`}
                  >
                    My Princess
                  </span>
                </h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25, duration: 0.6 }}
                  className={`text-base sm:text-lg leading-relaxed max-w-2xl ${
                    isMidnight ? 'text-[#F3E8FF]/90' : 'text-[#5E364D]'
                  }`}
                >
                  Tonight the midnight sky twinkles with a thousand gentle stars and showers pink
                  and lavender blossoms simply because you exist. For every silent battle you
                  fought, for every tear you hid behind your breathtaking smile, may this birthday
                  wrap your heart in pure peace, endless romance, and the certainty that you are
                  the most stunning soul in this universe.
                </motion.p>

                {/* Primary Hero CTAs */}
                <div className="flex flex-wrap items-center gap-3.5 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      musicBox.playChime();
                      triggerFlowerBurst();
                    }}
                    className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#C81E5B] to-[#9333EA] text-white text-xs sm:text-sm font-semibold shadow-sm hover:opacity-95 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Shower Flowers &amp; Wishing Stars</span>
                  </button>

                  <a
                    href="#cake"
                    className="px-6 py-3.5 rounded-xl bg-white border border-[#EBC5D8] text-[#2D1625] text-xs sm:text-sm font-semibold hover:bg-[#FDF2F7] transition-colors whitespace-nowrap shrink-0"
                  >
                    Blow Out Your Birthday Cake
                  </a>
                </div>

                {/* Romantic Background Music Box Selector */}
                <div
                  className={`pt-4 border-t flex flex-wrap items-center gap-3 ${
                    isMidnight ? 'border-[#F472B6]/20' : 'border-[#F3D8E6]'
                  }`}
                >
                  <span
                    className={`text-xs ${
                      isMidnight ? 'text-[#E9D5FF]/80' : 'text-[#8A5A75]'
                    }`}
                  >
                    Sanctuary Melody:
                  </span>
                  <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#FDF2F7] border border-[#F2D5E4] rounded-xl">
                    {(Object.keys(MELODIES) as MelodyId[]).map((mKey) => (
                      <button
                        key={mKey}
                        type="button"
                        onClick={() => handleMelodyChange(mKey)}
                        className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          currentMelody === mKey && isMusicPlaying
                            ? 'bg-white text-[#C81E5B] shadow-2xs'
                            : 'text-[#7A4964] hover:text-[#2D1625]'
                        }`}
                      >
                        {MELODIES[mKey].name}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Hero Showcase Pairing Her 2 Exact Portraits & Bunny Teddy */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.65, delay: 0.15 }}
                className="lg:col-span-5"
              >
                <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-[#F3D8E6] p-5 sm:p-6 shadow-[0_24px_65px_-15px_rgba(236,72,153,0.28)] space-y-4">
                  <div className="grid grid-cols-12 gap-3.5 items-stretch">
                    {/* Main Sunlit Cathedral Portrait */}
                    <div
                      onClick={() =>
                        setLightboxItem({
                          src: photos.portrait2,
                          title: 'Sunlit Grace & Timeless Elegance',
                          subtitle: 'Portrait II · Golden Hour Sanctuary',
                          quote:
                            'Even cathedral stained glass pales beside the warmth and light in your green eyes.',
                          slotKey: 'portrait2',
                        })
                      }
                      className="col-span-7 aspect-[3/4] rounded-2xl overflow-hidden bg-[#1A0B14] relative group cursor-pointer border border-[#F3D8E6]"
                    >
                      <img
                        src={photos.portrait2}
                        alt="My Princess in sunlit cathedral"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end p-3.5">
                        <span className="text-xs font-medium text-white">
                          Her Radiant Presence
                        </span>
                      </div>
                    </div>

                    {/* Right Stack: Film Strip Portrait + Fluffy Bunny Teddy */}
                    <div className="col-span-5 flex flex-col justify-between gap-3.5">
                      <div
                        onClick={() =>
                          setLightboxItem({
                            src: photos.portrait1,
                            title: 'Mesmerizing Emerald Eyes',
                            subtitle: 'Portrait I · 35mm Vintage Film',
                            quote:
                              'One glance from your eyes is enough to make the whole world stop spinning.',
                            slotKey: 'portrait1',
                          })
                        }
                        className="flex-1 rounded-2xl overflow-hidden bg-[#1A0B14] relative group cursor-pointer border border-[#F3D8E6]"
                      >
                        <img
                          src={photos.portrait1}
                          alt="My Princess 35mm film close-up portrait"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-[11px] font-medium text-white">
                            Golden Hour Film
                          </span>
                        </div>
                      </div>

                      <motion.div
                        animate={teddyHugActive ? { scale: [1, 1.08, 0.96, 1] } : {}}
                        onClick={handleHugTeddy}
                        className="flex-1 rounded-2xl overflow-hidden bg-[#1A0B14] relative group cursor-pointer border border-[#F3D8E6]"
                      >
                        <img
                          src={photos.teddy}
                          alt="Fluffy white bunny teddy birthday gift"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#2D1625]/75 via-transparent to-transparent flex items-end p-2.5">
                          <span className="text-[11px] font-medium text-white">
                            Tap to Hug Bunny
                          </span>
                        </div>
                      </motion.div>
                    </div>
                  </div>

                  {/* Animated Quote Bar inside Hero Card */}
                  <div className="pt-2 flex items-center justify-between gap-3 text-xs text-[#6E445B]">
                    <span className="italic font-display text-base text-[#2D1625]">
                      &ldquo;You outshine every star in the midnight sky.&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsPersonalizerOpen(true)}
                      className="text-xs font-semibold text-[#C81E5B] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Manage Exact Photos
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Section 01: Her Two Exact Portraits & The Fluffy White Bunny Teddy Sanctuary */}
          <section
            id="portraits"
            className={`py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t ${
              isMidnight ? 'border-[#F472B6]/20' : 'border-[#F3D8E6]'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div className="space-y-3 max-w-2xl">
                <div
                  className={`flex items-center gap-2 text-xs ${
                    isMidnight ? 'text-[#E9D5FF]/80' : 'text-[#8A5A75]'
                  }`}
                >
                  <span>01. Her Presence &amp; Her Birthday Companion</span>
                  <span aria-hidden="true">·</span>
                  <span>100% Untouched Original Portraits</span>
                </div>
                <h2
                  className={`font-display text-3xl sm:text-5xl font-semibold tracking-tight ${
                    isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
                  }`}
                  style={{ textWrap: 'balance' }}
                >
                  A Beauty That Leaves the World{' '}
                  <span
                    className={`italic font-normal ${
                      isMidnight ? 'text-[#F9A8D4]' : 'text-[#C81E5B]'
                    }`}
                  >
                    Speechless
                  </span>
                </h2>
                <p
                  className={`text-sm sm:text-base leading-relaxed ${
                    isMidnight ? 'text-[#E9D5FF]/90' : 'text-[#6E445B]'
                  }`}
                >
                  Your two portraits stand beside your fluffy white bunny teddy under the
                  twinkling stars—a gentle guardian here to remind you that you are deeply
                  cherished, fiercely admired, and never alone.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPersonalizerOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-[#FDF2F7] border border-[#EBC5D8] text-xs font-semibold text-[#2D1625] hover:bg-[#FCE7F3] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-[#C81E5B]" />
                <span>Select / Paste Exact Photos</span>
              </button>
            </div>

            {/* 3-Column Triptych Showcase — Preserving Full Portrait Aspect Ratios */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
              {/* Card 1: First Portrait (35mm Film Close-up) */}
              <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-[#F3D8E6] p-5 flex flex-col justify-between shadow-[0_14px_35px_-15px_rgba(190,24,93,0.18)]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A5A75] mb-3">
                    <span>Portrait I · 35mm Vintage Frame</span>
                    <label className="text-[#C81E5B] font-semibold hover:underline cursor-pointer">
                      Select Exact File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleQuickInlineUpload('portrait1', e)}
                      />
                    </label>
                  </div>

                  <div
                    onClick={() =>
                      setLightboxItem({
                        src: photos.portrait1,
                        title: 'Eyes Like Emeralds in Golden Hour',
                        subtitle: 'Portrait I · 35mm Film Tribute',
                        quote:
                          'In your eyes lives a universe of warmth, resilience, and quiet magic that no camera could ever fully capture.',
                        slotKey: 'portrait1',
                      })
                    }
                    className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#1A0B14] mb-5 relative group cursor-pointer border border-[#F3D8E6] flex items-center justify-center"
                  >
                    <img
                      src={photos.portrait1}
                      alt="My Princess close-up film portrait"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-[#2D1625] mb-2">
                    Eyes That Hold Galaxies
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E445B] leading-relaxed">
                    &ldquo;Every time you look at the lens, time stands still. Your green eyes
                    carry a depth, kindness, and radiance that outshines every star in the night
                    sky.&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[#F3D8E6] flex items-center justify-between text-xs text-[#8A5A75]">
                  <span>Golden Hour Glow · Pure Grace</span>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxItem({
                        src: photos.portrait1,
                        title: 'Eyes Like Emeralds in Golden Hour',
                        subtitle: 'Portrait I · 35mm Film Tribute',
                        quote:
                          'In your eyes lives a universe of warmth, resilience, and quiet magic that no camera could ever fully capture.',
                        slotKey: 'portrait1',
                      })
                    }
                    className="font-semibold text-[#C81E5B] hover:underline cursor-pointer"
                  >
                    View Full Uncropped
                  </button>
                </div>
              </div>

              {/* Card 2: Second Portrait (Cathedral Sunlight) */}
              <div className="rounded-3xl bg-white/95 backdrop-blur-md border border-[#F3D8E6] p-5 flex flex-col justify-between shadow-[0_14px_35px_-15px_rgba(190,24,93,0.18)]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A5A75] mb-3">
                    <span>Portrait II · Cathedral Sunlight</span>
                    <label className="text-[#C81E5B] font-semibold hover:underline cursor-pointer">
                      Select Exact File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleQuickInlineUpload('portrait2', e)}
                      />
                    </label>
                  </div>

                  <div
                    onClick={() =>
                      setLightboxItem({
                        src: photos.portrait2,
                        title: 'Sunlit Sanctuary of Grace',
                        subtitle: 'Portrait II · Cathedral Light',
                        quote:
                          'Seated in warm golden light, you look like an angel who stepped out of a painting just to bless this world.',
                        slotKey: 'portrait2',
                      })
                    }
                    className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-[#1A0B14] mb-5 relative group cursor-pointer border border-[#F3D8E6] flex items-center justify-center"
                  >
                    <img
                      src={photos.portrait2}
                      alt="My Princess in sunlit cathedral"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/45 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>

                  <h3 className="font-display text-2xl font-semibold text-[#2D1625] mb-2">
                    An Angel in Golden Light
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E445B] leading-relaxed">
                    &ldquo;Even surrounded by stained glass and soaring arches, all the light in
                    the room gathers around you. Your gentleness and poise are truly
                    otherworldly.&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[#F3D8E6] flex items-center justify-between text-xs text-[#8A5A75]">
                  <span>Stained Glass Light · Serene Soul</span>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxItem({
                        src: photos.portrait2,
                        title: 'Sunlit Sanctuary of Grace',
                        subtitle: 'Portrait II · Cathedral Light',
                        quote:
                          'Seated in warm golden light, you look like an angel who stepped out of a painting just to bless this world.',
                        slotKey: 'portrait2',
                      })
                    }
                    className="font-semibold text-[#C81E5B] hover:underline cursor-pointer"
                  >
                    View Full Uncropped
                  </button>
                </div>
              </div>

              {/* Card 3: Interactive Fluffy White Bunny Teddy Companion */}
              <div className="rounded-3xl bg-gradient-to-b from-[#FFF5F9] to-[#F8F2FF] border border-[#EBC5D8] p-5 flex flex-col justify-between shadow-[0_14px_35px_-15px_rgba(190,24,93,0.18)]">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8A5A75] mb-3 tabular-nums">
                    <span>Birthday Plush · Hugs Given: {teddyHugs}</span>
                    <label className="text-[#7E22CE] font-semibold hover:underline cursor-pointer">
                      Select Exact File
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleQuickInlineUpload('teddy', e)}
                      />
                    </label>
                  </div>

                  <motion.div
                    animate={
                      teddyHugActive
                        ? { scale: [1, 1.06, 0.97, 1], rotate: [0, -2, 2, 0] }
                        : {}
                    }
                    transition={{ duration: 0.45 }}
                    onClick={handleHugTeddy}
                    className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-white mb-5 relative group cursor-pointer border border-[#F3D8E6]"
                  >
                    <img
                      src={photos.teddy}
                      alt="Fluffy white bunny teddy with pink bow and lace collar"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-3 left-3 right-3 px-3 py-2 rounded-xl bg-[#2D1625]/75 backdrop-blur-xs text-white text-xs flex items-center justify-between">
                      <span>Fluffy Bunny Guardian</span>
                      <span className="font-semibold text-[#F9A8D4]">Tap to Hug</span>
                    </div>
                  </motion.div>

                  <h3 className="font-display text-2xl font-semibold text-[#2D1625] mb-2">
                    Your Cuddle Companion
                  </h3>
                  <p className="text-xs sm:text-sm text-[#6E445B] leading-relaxed min-h-[3.8rem]">
                    &ldquo;{BUNNY_HUG_MESSAGES[(teddyHugs - 1) % BUNNY_HUG_MESSAGES.length]}&rdquo;
                  </p>
                </div>

                <div className="pt-4 mt-5 border-t border-[#EBC5D8]">
                  <button
                    type="button"
                    onClick={handleHugTeddy}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer shadow-2xs"
                  >
                    <Heart className="w-3.5 h-3.5 fill-current" />
                    <span>Hug Your Bunny Teddy &amp; Shower Petals</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 02: Wax-Sealed Envelopes with Romantic & Healing Quotes */}
          <EnvelopesSection
            onOpenEnvelopeBurst={triggerFlowerBurst}
            skyTheme={skyTheme}
          />

          {/* Section 03: Interactive Birthday Cake with Voice "Blow" Recognition */}
          <BirthdayCakeSection
            onCandlesBlown={triggerFlowerBurst}
            skyTheme={skyTheme}
          />

          {/* Section 04: Mirror of Truth & Motivational Quotes */}
          <AffirmationMirrorSection onShowerFlowers={triggerFlowerBurst} />

          {/* Quiet Editorial Footer */}
          <footer
            className={`py-12 px-4 sm:px-8 border-t text-center transition-colors ${
              isMidnight
                ? 'border-[#F472B6]/20 bg-[#0B0414]/60 backdrop-blur-xs text-[#E9D5FF]/80'
                : 'border-[#F3D8E6] bg-[#FFF9FB]/80 text-[#8A5A75]'
            }`}
          >
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <p
                className={`font-display italic text-base ${
                  isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
                }`}
              >
                Happy Birthday, My Princess — May your heart always know how deeply you are loved.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setSkyTheme((prev) => (prev === 'midnight' ? 'twilight' : 'midnight'))
                  }
                  className="hover:text-[#F472B6] transition-colors cursor-pointer"
                >
                  {isMidnight ? 'Switch to Blush Dawn Sky' : 'Switch to Midnight Starlight Sky'}
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={triggerFlowerBurst}
                  className="hover:text-[#F472B6] transition-colors cursor-pointer"
                >
                  Shower More Flowers &amp; Stars
                </button>
                <span aria-hidden="true">·</span>
                <button
                  type="button"
                  onClick={() => {
                    setSetupHidden(false);
                    setIsPersonalizerOpen(true);
                  }}
                  className="hover:text-[#F472B6] transition-colors cursor-pointer"
                >
                  Manage Exact Photos
                </button>
                <span aria-hidden="true">·</span>
                <a href="#top" className="hover:text-[#F472B6] transition-colors">
                  Back to Top
                </a>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Fullscreen Portrait Lightbox Modal */}
      <AnimatePresence>
        {lightboxItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#1F0E19]/85 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setLightboxItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl rounded-3xl bg-white border border-[#F3D8E6] overflow-hidden shadow-2xl grid grid-cols-1 md:grid-cols-12"
            >
              <div className="md:col-span-7 bg-[#1A0B14] flex items-center justify-center max-h-[75vh]">
                <img
                  src={lightboxItem.src}
                  alt={lightboxItem.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full max-h-[75vh] object-contain"
                />
              </div>
              <div className="md:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#8A5A75]">
                    <span>{lightboxItem.subtitle}</span>
                    <button
                      type="button"
                      onClick={() => setLightboxItem(null)}
                      className="p-1.5 rounded-lg text-[#6E445B] hover:text-[#2D1625] hover:bg-[#FDF2F7] cursor-pointer"
                      aria-label="Close lightbox"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <h3 className="font-display text-3xl font-semibold text-[#2D1625]">
                    {lightboxItem.title}
                  </h3>

                  <p className="text-sm sm:text-base text-[#5E364D] leading-relaxed italic font-display text-xl">
                    &ldquo;{lightboxItem.quote}&rdquo;
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-[#F3D8E6]">
                  <label className="w-full py-2.5 px-4 rounded-xl bg-[#FDF2F7] border border-[#EBC5D8] text-[#2D1625] text-xs font-semibold hover:bg-[#FCE7F3] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                    <Upload className="w-3.5 h-3.5 text-[#C81E5B]" />
                    <span>Select Exact Original Photo for This Frame</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleQuickInlineUpload(lightboxItem.slotKey, e)}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setLightboxItem(null)}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors cursor-pointer"
                  >
                    Close Portrait View
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Photo Personalizer Modal */}
      <PhotoPersonalizerModal
        isOpen={isPersonalizerOpen}
        onClose={() => setIsPersonalizerOpen(false)}
        photos={photos}
        defaultPhotos={DEFAULT_PHOTOS}
        onUpdatePhoto={updatePhoto}
        onSwapPortraits={handleSwapPortraits}
        onResetAll={resetAllPhotos}
        setupHidden={setupHidden}
        onToggleSetupHidden={handleToggleSetupHidden}
      />
    </div>
  );
}
