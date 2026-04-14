import { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

const clampColor = (value) => Math.min(255, Math.max(0, value));

const normalizeColor = (color) => {
  if (Array.isArray(color) && color.length === 3) {
    return color.map((value) => clampColor(Number(value) || 0));
  }
  if (typeof color === 'string' && color.includes(',')) {
    const parts = color.split(',').map((part) => clampColor(Number(part.trim()) || 0));
    if (parts.length === 3) return parts;
  }
  return [16, 185, 129];
};

const drawWaves = (ctx, width, height, config, elapsed) => {
  const [r, g, b] = normalizeColor(config.color);
  const lines = Math.max(4, Math.floor(config.density));
  const points = Math.max(28, Math.floor(width / 30));

  ctx.clearRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width * 0.22, height * 0.1, 8, width * 0.22, height * 0.1, width * 0.7);
  glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.22)`);
  glow.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  for (let i = 0; i < lines; i += 1) {
    const ratio = lines === 1 ? 0.5 : i / (lines - 1);
    const baseline = height * (0.14 + ratio * 0.72);
    const lineAmplitude = config.amplitude * (0.4 + ratio * 0.9);
    const frequency = 1 + (i % 4) * 0.35;
    const phase = elapsed * config.speed * (0.8 + ratio * 0.65) + i * 0.72;

    ctx.beginPath();
    for (let point = 0; point <= points; point += 1) {
      const progress = point / points;
      const x = progress * width;
      const y =
        baseline +
        Math.sin(progress * Math.PI * 2 * frequency + phase) * lineAmplitude +
        Math.cos(progress * Math.PI * 3 + phase * 0.72) * lineAmplitude * 0.2;

      if (point === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }

    const alpha = 0.06 + ratio * 0.2;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.lineWidth = 1 + (1 - ratio) * 0.8;
    ctx.stroke();
  }
};

export default function VisualBackground({
  density = 12,
  speed = 0.55,
  amplitude = 14,
  color = [16, 185, 129],
  className,
}) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    let animationFrame;
    const start = performance.now();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const render = (timestamp) => {
      const elapsed = (timestamp - start) / 1000;
      drawWaves(context, canvas.clientWidth, canvas.clientHeight, { density, speed, amplitude, color }, elapsed);
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    animationFrame = requestAnimationFrame(render);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
    };
  }, [density, speed, amplitude, color]);

  return <canvas ref={canvasRef} className={cn('h-full w-full', className)} aria-hidden="true" />;
}
