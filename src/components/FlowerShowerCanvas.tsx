import React, { useEffect, useRef } from 'react';

interface Petal {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  color: string;
  opacity: number;
  shape: 'rose' | 'blossom' | 'lavender';
}

const PETAL_COLORS = [
  '#F9A8D4', // Blush Pink
  '#F472B6', // Rose Pink
  '#FBCFE8', // Soft Sakura
  '#E879F9', // Orchid Glow
  '#D8B4FE', // Pastel Lavender
  '#C084FC', // Royal Lilac
  '#FDA4AF', // Coral Rose
];

interface FlowerShowerCanvasProps {
  burstCount: number;
  intensity?: 'normal' | 'lush';
}

export const FlowerShowerCanvas: React.FC<FlowerShowerCanvasProps> = ({
  burstCount,
  intensity = 'normal',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const petalsRef = useRef<Petal[]>([]);

  const createPetal = (width: number, height: number, fromTop = false): Petal => {
    const shapes: Array<'rose' | 'blossom' | 'lavender'> = ['rose', 'blossom', 'lavender'];
    return {
      x: Math.random() * width,
      y: fromTop ? -20 - Math.random() * 140 : Math.random() * height,
      size: 7 + Math.random() * 10,
      speedY: 0.7 + Math.random() * 1.4,
      speedX: (Math.random() - 0.5) * 0.6,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.025,
      swayPhase: Math.random() * Math.PI * 2,
      swaySpeed: 0.012 + Math.random() * 0.02,
      color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      opacity: 0.55 + Math.random() * 0.35,
      shape: shapes[Math.floor(Math.random() * shapes.length)],
    };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const targetBaseCount = intensity === 'lush' ? 56 : 36;
    if (petalsRef.current.length === 0) {
      petalsRef.current = Array.from({ length: targetBaseCount }, () =>
        createPetal(canvas.width, canvas.height, false)
      );
    }

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = petalsRef.current.length - 1; i >= 0; i--) {
        const p = petalsRef.current[i];
        p.swayPhase += p.swaySpeed;
        p.y += p.speedY;
        p.x += p.speedX + Math.sin(p.swayPhase) * 0.65;
        p.rotation += p.rotationSpeed;

        if (p.y > canvas.height + 30) {
          if (petalsRef.current.length > targetBaseCount) {
            petalsRef.current.splice(i, 1);
            continue;
          } else {
            p.y = -20;
            p.x = Math.random() * canvas.width;
          }
        }
        if (p.x > canvas.width + 30) p.x = -20;
        if (p.x < -30) p.x = canvas.width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === 'rose') {
          // Organic rose petal curve
          ctx.moveTo(0, -p.size * 0.6);
          ctx.bezierCurveTo(
            p.size * 0.8,
            -p.size * 0.8,
            p.size * 0.9,
            p.size * 0.5,
            0,
            p.size * 0.85
          );
          ctx.bezierCurveTo(
            -p.size * 0.9,
            p.size * 0.5,
            -p.size * 0.8,
            -p.size * 0.8,
            0,
            -p.size * 0.6
          );
        } else if (p.shape === 'blossom') {
          // Notched sakura cherry blossom petal
          ctx.moveTo(0, p.size * 0.8);
          ctx.bezierCurveTo(
            p.size * 0.75,
            p.size * 0.3,
            p.size * 0.65,
            -p.size * 0.7,
            p.size * 0.18,
            -p.size * 0.85
          );
          ctx.lineTo(0, -p.size * 0.55);
          ctx.lineTo(-p.size * 0.18, -p.size * 0.85);
          ctx.bezierCurveTo(
            -p.size * 0.65,
            -p.size * 0.7,
            -p.size * 0.75,
            p.size * 0.3,
            0,
            p.size * 0.8
          );
        } else {
          // Delicate lavender teardrop
          ctx.ellipse(0, 0, p.size * 0.42, p.size * 0.85, 0, 0, Math.PI * 2);
        }
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [intensity]);

  // Trigger extra petal shower burst when burstCount increments
  useEffect(() => {
    if (burstCount === 0) return;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const newPetals = Array.from({ length: 65 }, () => {
      const p = createPetal(width, height, true);
      p.speedY = 1.6 + Math.random() * 2.5;
      p.size = 9 + Math.random() * 11;
      p.opacity = 0.75 + Math.random() * 0.25;
      return p;
    });
    petalsRef.current.push(...newPetals);
  }, [burstCount]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-20"
      aria-hidden="true"
    />
  );
};
