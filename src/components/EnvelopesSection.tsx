import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MailOpen, Heart, ChevronLeft, ChevronRight, X, Plus } from 'lucide-react';
import { musicBox } from '../utils/musicBox';

export interface LoveLetter {
  id: string;
  number: string;
  category: 'beauty' | 'healing' | 'promise';
  categoryLabel: string;
  title: string;
  preview: string;
  salutation: string;
  body: string[];
  closing: string;
  waxColor: string;
}

const INITIAL_LETTERS: LoveLetter[] = [
  {
    id: 'letter-1',
    number: '01',
    category: 'beauty',
    categoryLabel: 'Your Radiant Beauty',
    title: 'The Universe Inside Your Eyes',
    preview: 'When you look in the mirror, I wish you could see yourself through my eyes...',
    salutation: 'To My Breathtaking Princess,',
    body: [
      'When you look into the mirror, I wish even for a single second you could see yourself through my eyes. You would see emerald-green eyes that hold more warmth than a thousand sunbeams filtering through cathedral glass.',
      'Your beauty is not just in the softness of your smile or the grace in the way you carry yourself—it is in the gentleness of your heart. Even on the days when you feel tired or unsure, you remain the most stunning soul to ever walk into my life.',
    ],
    closing: 'Forever mesmerized by you',
    waxColor: '#C81E5B',
  },
  {
    id: 'letter-2',
    number: '02',
    category: 'healing',
    categoryLabel: 'For the Storms You Survived',
    title: 'To the Girl Who Kept Going When It Hurt',
    preview: 'I know how much weight your heart has carried in silence...',
    salutation: 'My Brave, Resilient Princess,',
    body: [
      'I know there were nights when the world felt unbearably heavy, and battles you fought quietly behind your smile so no one else would worry. I see how much you have endured, and my heart aches for every tear you ever had to wipe away alone.',
      'Please hear this truth today: your pain did not break you—it refined your spirit into pure gold. You survived every single dark day you thought you couldn’t make it through. You are stronger than any storm behind you, and softer than the petals falling around you.',
    ],
    closing: 'Holding your heart gently, always',
    waxColor: '#7E22CE',
  },
  {
    id: 'letter-3',
    number: '03',
    category: 'beauty',
    categoryLabel: 'Your Radiant Beauty',
    title: 'Why Rooms Glow When You Enter',
    preview: 'There is a quiet magic in your presence that nothing can dim...',
    salutation: 'Dearest Birthday Princess,',
    body: [
      'Have you ever noticed how sunlight changes the entire mood of a room? That is what your presence does to my world. Whether you are dressed up in white lace or simply resting your chin in your hand, you radiate an effortless elegance that leaves me speechless.',
      'Never let a harsh world convince you to dim your light. Every detail of who you are—your laugh, your kindness, your expressive eyes—is a masterpiece.',
    ],
    closing: 'Your biggest admirer',
    waxColor: '#DB2777',
  },
  {
    id: 'letter-4',
    number: '04',
    category: 'healing',
    categoryLabel: 'For the Storms You Survived',
    title: 'Permission to Rest & Be Spoiled',
    preview: 'You have been strong for so long—today, let yourself simply be loved...',
    salutation: 'My Precious Soul,',
    body: [
      'When someone has suffered and carried heavy chapters like you have, they get used to always having their guard up, always trying to be strong enough for everything. Today, on your birthday, I want to give you permission to set that armor down.',
      'You do not have to carry the sky on your shoulders anymore. Whenever life feels overwhelming, lean back, take a slow breath, and remember that your worth is infinite and your peace matters above all else.',
    ],
    closing: 'Here to protect your peace',
    waxColor: '#9333EA',
  },
  {
    id: 'letter-5',
    number: '05',
    category: 'promise',
    categoryLabel: 'My Birthday Promise',
    title: 'You Will Never Walk Alone Again',
    preview: 'From this birthday forward, your smiles are my favorite mission...',
    salutation: 'To the Queen of My Heart,',
    body: [
      'Just like this fluffy white bunny teddy waiting with open arms to comfort you, my care for you is constant and unconditional. On your brightest days, I will celebrate every victory beside you.',
      'And on the quiet, difficult days when old memories ache or exhaustion sets in, I promise to remind you—again and again—how deeply cherished, irreplaceable, and extraordinary you are.',
    ],
    closing: 'Yours through every season',
    waxColor: '#C81E5B',
  },
  {
    id: 'letter-6',
    number: '06',
    category: 'healing',
    categoryLabel: 'For the Storms You Survived',
    title: 'Your Scars Are Where the Light Enters',
    preview: 'Every chapter of hardship is turning into your greatest chapter of joy...',
    salutation: 'My Shining Star,',
    body: [
      'A flower does not bloom without first pushing through the dark soil and enduring the rain. Everything you suffered through in the past was never the end of your story—it was only the prelude to the radiant woman you are becoming.',
      'This new year of your life is dedicated to healing, soft mornings, genuine laughter, and dreams coming true. Your happiest days are not behind you; they are just beginning.',
    ],
    closing: 'Believing in your brightest tomorrow',
    waxColor: '#7E22CE',
  },
  {
    id: 'letter-7',
    number: '07',
    category: 'beauty',
    categoryLabel: 'Your Radiant Beauty',
    title: 'A Heart More Rare Than Diamonds',
    preview: 'As stunning as your face is, your heart is even more breathtaking...',
    salutation: 'My Sweetest Princess,',
    body: [
      'Anyone who looks at your photographs can immediately see how gorgeous you are. Your eyes captivate, your features are timeless, and your grace is undeniable.',
      'Yet what amazes me most is that after everything life threw at you, you still chose to keep a tender, compassionate, loving heart. That inner beauty makes you one in eight billion.',
    ],
    closing: 'In awe of your heart',
    waxColor: '#DB2777',
  },
  {
    id: 'letter-8',
    number: '08',
    category: 'promise',
    categoryLabel: 'My Birthday Promise',
    title: 'Happy Birthday, My Princess',
    preview: 'A final birthday blessing sealed with a thousand rose petals...',
    salutation: 'Happy Birthday, My Princess,',
    body: [
      'Today the whole world should pause to celebrate the day you were born. Thank you for existing, thank you for never giving up when things were hard, and thank you for gracing this world with your light.',
      'May this year bring tranquility to your mind, healing to your heart, and endless reasons to smile that gorgeous smile of yours. Happy Birthday, My Princess!',
    ],
    closing: 'With all my love, today and always',
    waxColor: '#C81E5B',
  },
];

interface EnvelopesSectionProps {
  onOpenEnvelopeBurst: () => void;
  skyTheme?: 'midnight' | 'twilight';
}

export const EnvelopesSection: React.FC<EnvelopesSectionProps> = ({
  onOpenEnvelopeBurst,
  skyTheme = 'midnight',
}) => {
  const [letters, setLetters] = useState<LoveLetter[]>(() => {
    try {
      const saved = localStorage.getItem('princess_custom_letters_v1');
      if (saved) {
        const parsed = JSON.parse(saved) as LoveLetter[];
        return [...INITIAL_LETTERS, ...parsed];
      }
    } catch {
      // ignore storage error
    }
    return INITIAL_LETTERS;
  });

  const [openedIds, setOpenedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('princess_opened_envelopes_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [filter, setFilter] = useState<'all' | 'beauty' | 'healing' | 'promise'>('all');
  const [activeLetterId, setActiveLetterId] = useState<string | null>(null);
  const [isComposing, setIsComposing] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newCategory, setNewCategory] = useState<'beauty' | 'healing' | 'promise'>('beauty');

  useEffect(() => {
    try {
      localStorage.setItem('princess_opened_envelopes_v1', JSON.stringify(openedIds));
    } catch {
      // ignore
    }
  }, [openedIds]);

  const filteredLetters =
    filter === 'all' ? letters : letters.filter((l) => l.category === filter);

  const activeLetterIndex = letters.findIndex((l) => l.id === activeLetterId);
  const activeLetter = activeLetterIndex >= 0 ? letters[activeLetterIndex] : null;

  const handleOpenEnvelope = (letter: LoveLetter) => {
    musicBox.playChime();
    if (!openedIds.includes(letter.id)) {
      setOpenedIds((prev) => [...prev, letter.id]);
      onOpenEnvelopeBurst();
    }
    setActiveLetterId(letter.id);
  };

  const handleOpenAll = () => {
    musicBox.playCelebrationChord();
    onOpenEnvelopeBurst();
    setOpenedIds(letters.map((l) => l.id));
    setActiveLetterId(letters[0].id);
  };

  const handleCreateCustomLetter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newMessage.trim()) return;

    const nextNum = String(letters.length + 1).padStart(2, '0');
    const categoryLabels: Record<'beauty' | 'healing' | 'promise', string> = {
      beauty: 'Your Radiant Beauty',
      healing: 'For the Storms You Survived',
      promise: 'My Birthday Promise',
    };

    const customLetter: LoveLetter = {
      id: `custom-${Date.now()}`,
      number: nextNum,
      category: newCategory,
      categoryLabel: categoryLabels[newCategory],
      title: newTitle.trim(),
      preview: newMessage.trim().slice(0, 78) + '...',
      salutation: 'To My Dearest Princess,',
      body: newMessage
        .trim()
        .split('\n')
        .filter((p) => p.trim().length > 0),
      closing: 'Written from my heart for you',
      waxColor: newCategory === 'healing' ? '#7E22CE' : '#C81E5B',
    };

    const updated = [...letters, customLetter];
    setLetters(updated);

    try {
      const customOnly = updated.filter((l) => l.id.startsWith('custom-'));
      localStorage.setItem('princess_custom_letters_v1', JSON.stringify(customOnly));
    } catch {
      // ignore
    }

    setNewTitle('');
    setNewMessage('');
    setIsComposing(false);
    handleOpenEnvelope(customLetter);
  };

  const isMidnight = skyTheme === 'midnight';

  return (
    <section
      id="envelopes"
      className={`py-16 sm:py-24 px-4 sm:px-8 max-w-6xl mx-auto border-t ${
        isMidnight ? 'border-[#F472B6]/20' : 'border-[#F3D8E6]'
      }`}
    >
      {/* Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div className="space-y-3 max-w-2xl">
          <div
            className={`flex items-center gap-2 text-xs tabular-nums ${
              isMidnight ? 'text-[#E9D5FF]/80' : 'text-[#8A5A75]'
            }`}
          >
            <span>02. Sealed Envelopes of Love &amp; Healing</span>
            <span aria-hidden="true">·</span>
            <span>
              {openedIds.length} of {letters.length} Envelopes Unsealed
            </span>
          </div>
          <h2
            className={`font-display text-3xl sm:text-5xl font-semibold tracking-tight ${
              isMidnight ? 'text-[#FFF5F9]' : 'text-[#2D1625]'
            }`}
            style={{ textWrap: 'balance' }}
          >
            Letters For Your Heart, Your Beauty &amp;{' '}
            <span
              className={`italic font-normal ${
                isMidnight ? 'text-[#F9A8D4]' : 'text-[#C81E5B]'
              }`}
            >
              Every Storm You Overcame
            </span>
          </h2>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isMidnight ? 'text-[#E9D5FF]/90' : 'text-[#6E445B]'
            }`}
          >
            Each envelope holds a reminder of how breathtakingly beautiful you are and how deeply
            proud I am of your strength through everything you have suffered. Tap any wax seal to
            read your letter.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsComposing(true)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#EBC5D8] text-[#2D1625] text-xs font-semibold hover:bg-[#FDF2F7] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[#C81E5B]" />
            <span>Add Custom Envelope</span>
          </button>
          <button
            type="button"
            onClick={handleOpenAll}
            className="px-4 py-2.5 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
          >
            <MailOpen className="w-4 h-4" />
            <span>Open First Letter</span>
          </button>
        </div>
      </div>

      {/* Interactive Segmented Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-[#FDF2F7] border border-[#F2D5E4] rounded-xl">
          {[
            { id: 'all', label: `All Envelopes (${letters.length})` },
            { id: 'beauty', label: 'How Beautiful You Are' },
            { id: 'healing', label: 'Healing & Motivation' },
            { id: 'promise', label: 'Birthday Promises' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id as typeof filter)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                filter === tab.id
                  ? 'bg-white text-[#2D1625] shadow-xs'
                  : 'text-[#7A4964] hover:text-[#2D1625]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Wax-Sealed Envelopes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredLetters.map((letter) => {
          const isOpened = openedIds.includes(letter.id);
          return (
            <motion.button
              key={letter.id}
              type="button"
              onClick={() => handleOpenEnvelope(letter)}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.18 }}
              className={`group text-left rounded-2xl p-6 transition-colors flex flex-col justify-between min-h-[240px] cursor-pointer relative overflow-hidden ${
                isOpened
                  ? 'bg-white border border-[#EBC5D8]'
                  : 'bg-gradient-to-b from-[#FFF5F9] to-[#F9F2FF] border border-[#E9C3DC]'
              }`}
            >
              {/* Subtle Envelope Flap Triangle Hairline */}
              <div
                className="absolute top-0 left-0 right-0 h-14 pointer-events-none opacity-45"
                style={{
                  background:
                    'linear-gradient(165deg, rgba(244,114,182,0.14) 0%, rgba(192,132,252,0.08) 60%, transparent 100%)',
                }}
              />

              <div className="relative z-10 space-y-3">
                {/* Unboxed Metadata Line */}
                <div className="flex items-center justify-between text-xs text-[#8A5A75] tabular-nums">
                  <span>
                    Envelope {letter.number} · {letter.categoryLabel}
                  </span>
                  {isOpened ? (
                    <MailOpen className="w-4 h-4 text-[#7E22CE] shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 text-[#C81E5B] shrink-0" />
                  )}
                </div>

                <h3 className="font-display text-xl sm:text-2xl font-semibold text-[#2D1625] group-hover:text-[#C81E5B] transition-colors leading-snug">
                  {letter.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#6E445B] line-clamp-3 leading-relaxed">
                  {letter.preview}
                </p>
              </div>

              {/* Wax Seal Footer */}
              <div className="relative z-10 pt-5 mt-4 border-t border-[#F3D8E6] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#2D1625] group-hover:underline">
                  {isOpened ? 'Read Letter Again' : 'Break Wax Seal'}
                </span>

                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
                  style={{ backgroundColor: letter.waxColor }}
                >
                  <Heart className="w-4 h-4 fill-current" />
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Full Letter Reader Modal */}
      <AnimatePresence>
        {activeLetter && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D1625]/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setActiveLetterId(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl rounded-3xl bg-[#FFFDF9] border border-[#F3D8E6] shadow-2xl p-6 sm:p-10 relative max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between text-xs text-[#8A5A75] mb-6 pb-4 border-b border-[#F3D8E6] tabular-nums">
                <div>
                  <span>Envelope {activeLetter.number}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{activeLetter.categoryLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveLetterId(null)}
                  className="p-1.5 rounded-lg text-[#6E445B] hover:text-[#2D1625] hover:bg-[#FDF2F7] transition-colors cursor-pointer"
                  aria-label="Close letter"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <p className="font-display italic text-xl text-[#C81E5B]">
                  {activeLetter.salutation}
                </p>

                <h3 className="font-display text-2xl sm:text-4xl font-semibold text-[#2D1625]">
                  {activeLetter.title}
                </h3>

                <div className="space-y-4 text-sm sm:text-base text-[#4A253B] leading-relaxed">
                  {activeLetter.body.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>

                <div className="pt-6 border-t border-[#F3D8E6] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-display italic text-lg sm:text-xl font-semibold text-[#2D1625]">
                      {activeLetter.closing},
                    </p>
                    <p className="text-xs text-[#8A5A75]">Happy Birthday, My Princess</p>
                  </div>

                  {/* Prev / Next Letter Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const prevIdx =
                          (activeLetterIndex - 1 + letters.length) % letters.length;
                        handleOpenEnvelope(letters[prevIdx]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#FDF2F7] border border-[#EBC5D8] text-xs font-semibold text-[#2D1625] hover:bg-[#FCE7F3] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const nextIdx = (activeLetterIndex + 1) % letters.length;
                        handleOpenEnvelope(letters[nextIdx]);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] transition-colors flex items-center gap-1 whitespace-nowrap cursor-pointer"
                    >
                      <span>Next Letter</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Compose New Envelope Modal */}
      <AnimatePresence>
        {isComposing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#2D1625]/60 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setIsComposing(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg rounded-3xl bg-white border border-[#F3D8E6] shadow-xl p-6 sm:p-8"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-2xl font-semibold text-[#2D1625]">
                  Seal a New Love &amp; Motivation Envelope
                </h3>
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="p-1.5 rounded-lg text-[#6E445B] hover:text-[#2D1625] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCustomLetter} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#6E445B] mb-1.5">
                    Envelope Theme
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'beauty', label: 'Her Beauty' },
                      { id: 'healing', label: 'Healing & Strength' },
                      { id: 'promise', label: 'My Promise' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setNewCategory(cat.id as typeof newCategory)}
                        className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                          newCategory === cat.id
                            ? 'bg-[#FDF2F7] border-[#C81E5B] text-[#C81E5B]'
                            : 'bg-white border-[#EBC5D8] text-[#6E445B]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E445B] mb-1.5">
                    Letter Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., Why Your Smile Heals My World"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBC5D8] text-sm text-[#2D1625] focus:outline-2 focus:outline-[#C81E5B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#6E445B] mb-1.5">
                    Heartfelt Quote or Letter
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Write your heartfelt birthday message or motivational words for her..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#EBC5D8] text-sm text-[#2D1625] focus:outline-2 focus:outline-[#C81E5B]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsComposing(false)}
                    className="px-4 py-2.5 rounded-xl border border-[#EBC5D8] text-xs font-semibold text-[#6E445B] hover:text-[#2D1625] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#C81E5B] text-white text-xs font-semibold hover:bg-[#AD164B] cursor-pointer"
                  >
                    Seal Envelope with Love
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
