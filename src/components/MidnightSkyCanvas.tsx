import React, { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  baseRadius: number;
  color: string;
  glowColor: string;
  phase: number;
  twinkleSpeed: number;
  minAlpha: number;
  maxAlpha: number;
  driftX: number;
  driftY: number;
  kind: 'dust' | 'gem' | 'sparkle';
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  alpha: number;
  life: number;
  maxLife: number;
  color: string;
}

interface MidnightSkyCanvasProps {
  skyTheme?: 'midnight' | 'twilight';
  wishBurstCount?: number;
}

const MIDNIGHT_STAR_PALETTE = [
  { color: '#FFF7FB', glow: 'rgba(255, 247, 251, 0.55)' }, // Starlight Ivory
  { color: '#FBCFE8', glow: 'rgba(244, 114, 182, 0.65)' }, // Blush Rose
  { color: '#F9A8D4', glow: 'rgba(236, 72, 153, 0.65)' },  // Romantic Pink
  { color: '#E9D5FF', glow: 'rgba(192, 132, 252, 0.65)' }, // Soft Lavender
  { color: '#FDE68A', glow: 'rgba(251, 191, 36, 0.55)' },  // Champagne Gold
];

const TWILIGHT_STAR_PALETTE = [
  { color: '#C81E5B', glow: 'rgba(200, 30, 91, 0.38)' },
  { color: '#9333EA', glow: 'rgba(147, 51, 234, 0.38)' },
  { color: '#DB2777', glow: 'rgba(219, 39, 119, 0.35)' },
  { color: '#D97706', glow: 'rgba(217, 119, 6, 0.32)' },
];

export const MidnightSkyCanvas: React.FC<MidnightSkyCanvasProps> = ({
  skyTheme = 'midnight',
  wishBurstCount = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);

  const spawnShootingStar = (width: number, height: number) => {
    const startX = Math.random() * width * 0.75;
    const startY = Math.random() * height * 0.42;
    const angle = (Math.PI / 180) * (18 + Math.random() * 18);
    const speed = 7 + Math.random() * 5;
    shootingStarsRef.current.push({
      x: startX,
      y: startY,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      length: 75 + Math.random() * 55,
      alpha: 1,
      life: 0,
      maxLife: 48 + Math.floor(Math.random() * 24),
      color: skyTheme === 'midnight' ? '#FDE68A' : '#EC4899',
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const palette =
      skyTheme === 'midnight' ? MIDNIGHT_STAR_PALETTE : TWILIGHT_STAR_PALETTE;

    const buildStars = (width: number, height: number): Star[] => {
      const total = 148;
      const list: Star[] = [];

      for (let i = 0; i < total; i++) {
        const swatch = palette[Math.floor(Math.random() * palette.length)];
        const rand = Math.random();
        const kind: Star['kind'] =
          rand < 0.14 ? 'sparkle' : rand < 0.42 ? 'gem' : 'dust';

        const baseRadius =
          kind === 'sparkle'
            ? 2.4 + Math.random() * 1.8
            : kind === 'gem'
            ? 1.5 + Math.random() * 1.3
            : 0.7 + Math.random() * 0.9;

        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          baseRadius,
          color: swatch.color,
          glowColor: swatch.glow,
          phase: Math.random() * Math.PI * 2,
          // Gentle fade-in and fade-out cycle
          twinkleSpeed: 0.008 + Math.random() * 0.022,
          minAlpha: kind === 'dust' ? 0.05 : 0.12,
          maxAlpha: kind === 'sparkle' ? 0.98 : kind === 'gem' ? 0.88 : 0.65,
          driftX: (Math.random() - 0.5) * 0.06,
          driftY: -0.02 - Math.random() * 0.05,
          kind,
        });
      }
      return list;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      starsRef.current = buildStars(canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const drawFourPointSparkle = (
      cx: number,
      cy: number,
      outerR: number,
      innerR: number,
      color: string,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;

      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angleOuter = (i * Math.PI) / 2;
        const angleInner = angleOuter + Math.PI / 4;
        const ox = Math.cos(angleOuter) * outerR;
        const oy = Math.sin(angleOuter) * outerR;
        const ix = Math.cos(angleInner) * innerR;
        const iy = Math.sin(angleInner) * innerR;
        if (i === 0) {
          ctx.moveTo(ox, oy);
        } else {
          ctx.lineTo(ox, oy);
        }
        ctx.lineTo(ix, iy);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    let animId: number;
    const render = () => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // 1. Render Ambient Midnight Sky Gradient & Nebula Glows
      if (skyTheme === 'midnight') {
        const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
        skyGrad.addColorStop(0, '#0B0414');
        skyGrad.addColorStop(0.45, '#150826');
        skyGrad.addColorStop(1, '#210C32');
        ctx.fillStyle = skyGrad;
        ctx.fillRect(0, 0, width, height);

        // Soft rose & amethyst nebula clouds
        const nebula1 = ctx.createRadialGradient(
          width * 0.22,
          height * 0.25,
          20,
          width * 0.22,
          height * 0.25,
          width * 0.48
        );
        nebula1.addColorStop(0, 'rgba(200, 30, 91, 0.16)');
        nebula1.addColorStop(0.5, 'rgba(147, 51, 234, 0.08)');
        nebula1.addColorStop(1, 'rgba(11, 4, 20, 0)');
        ctx.fillStyle = nebula1;
        ctx.fillRect(0, 0, width, height);

        const nebula2 = ctx.createRadialGradient(
          width * 0.78,
          height * 0.68,
          20,
          width * 0.78,
          height * 0.68,
          width * 0.45
        );
        nebula2.addColorStop(0, 'rgba(147, 51, 234, 0.16)');
        nebula2.addColorStop(0.55, 'rgba(236, 72, 153, 0.08)');
        nebula2.addColorStop(1, 'rgba(11, 4, 20, 0)');
        ctx.fillStyle = nebula2;
        ctx.fillRect(0, 0, width, height);
      }

      // 2. Update & Draw Twinkling Stars (Fading In & Out)
      for (let i = 0; i < starsRef.current.length; i++) {
        const s = starsRef.current[i];
        s.phase += s.twinkleSpeed;
        s.x += s.driftX;
        s.y += s.driftY;

        if (s.y < -10) s.y = height + 10;
        if (s.x < -10) s.x = width + 10;
        if (s.x > width + 10) s.x = -10;

        // Smooth sine wave fade-in / fade-out between minAlpha and maxAlpha
        const wave = (Math.sin(s.phase) + 1) * 0.5;
        const alpha = s.minAlpha + wave * (s.maxAlpha - s.minAlpha);

        if (s.kind === 'dust') {
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.baseRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (s.kind === 'gem') {
          const glowR = s.baseRadius * (3.2 + wave * 1.8);
          const grad = ctx.createRadialGradient(
            s.x,
            s.y,
            0,
            s.x,
            s.y,
            glowR
          );
          grad.addColorStop(0, s.color);
          grad.addColorStop(0.35, s.glowColor);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
          ctx.fill();

          // Bright star core
          ctx.fillStyle = s.color;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.baseRadius * 0.9, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else {
          // 4-point diamond starlight glint
          const glowR = s.baseRadius * (4 + wave * 2.5);
          const grad = ctx.createRadialGradient(
            s.x,
            s.y,
            0,
            s.x,
            s.y,
            glowR
          );
          grad.addColorStop(0, s.glowColor);
          grad.addColorStop(1, 'rgba(0,0,0,0)');

          ctx.save();
          ctx.globalAlpha = alpha * 0.75;
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(s.x, s.y, glowR, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();

          const outerSpike = s.baseRadius * (2.2 + wave * 1.6);
          const innerSpike = s.baseRadius * 0.42;
          drawFourPointSparkle(
            s.x,
            s.y,
            outerSpike,
            innerSpike,
            s.color,
            alpha
          );
        }
      }

      // 3. Occasional Gentle Wishing Star
      if (Math.random() < 0.004 && shootingStarsRef.current.length < 2) {
        spawnShootingStar(width, height);
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const st = shootingStarsRef.current[i];
        st.x += st.vx;
        st.y += st.vy;
        st.life += 1;

        const progress = st.life / st.maxLife;
        const fade =
          progress < 0.2
            ? progress / 0.2
            : Math.max(0, 1 - (progress - 0.2) / 0.8);

        const tailX = st.x - (st.vx / 10) * st.length;
        const tailY = st.y - (st.vy / 10) * st.length;

        const tailGrad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        tailGrad.addColorStop(0, st.color);
        tailGrad.addColorStop(0.4, 'rgba(244, 114, 182, 0.45)');
        tailGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.save();
        ctx.globalAlpha = fade * 0.85;
        ctx.strokeStyle = tailGrad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        drawFourPointSparkle(st.x, st.y, 6, 1.5, '#FFF9FB', fade);
        ctx.restore();

        if (st.life >= st.maxLife) {
          shootingStarsRef.current.splice(i, 1);
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [skyTheme]);

  // Spawn wishing stars when wishBurstCount increments
  useEffect(() => {
    if (wishBurstCount === 0) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        spawnShootingStar(width, height);
      }, i * 260);
    }
  }, [wishBurstCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
};
