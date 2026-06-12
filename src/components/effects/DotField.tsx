"use client";

import { useEffect, useRef } from "react";

type DotFieldProps = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  cursorForce?: number;
  bulgeOnly?: boolean;
  bulgeStrength?: number;
  glowRadius?: number;
  sparkle?: boolean;
  waveAmplitude?: number;
  color?: string;
};

export function DotField({
  dotRadius = 2.4,
  dotSpacing = 14,
  cursorRadius = 500,
  cursorForce = 0.10,
  bulgeOnly = true,
  bulgeStrength = 67,
  glowRadius = 160,
  color = "rgba(74, 117, 149, 0.22)",
}: DotFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let mouseX = -10000;
    let mouseY = -10000;
    let raf = 0;
    type Dot = { x: number; y: number; baseX: number; baseY: number };
    let dots: Dot[] = [];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      for (let x = dotSpacing / 2; x < width; x += dotSpacing) {
        for (let y = dotSpacing / 2; y < height; y += dotSpacing) {
          dots.push({ x, y, baseX: x, baseY: y });
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onLeave = () => {
      mouseX = -10000;
      mouseY = -10000;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Soft glow halo following cursor
      if (mouseX > -1000 && glowRadius > 0) {
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
        grad.addColorStop(0, "rgba(82, 145, 179, 0.18)");
        grad.addColorStop(0.5, "rgba(82, 145, 179, 0.08)");
        grad.addColorStop(1, "rgba(82, 145, 179, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = color;
      for (const dot of dots) {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < cursorRadius && dist > 0) {
          // Bulge: dots move AWAY from cursor (outward push)
          const normalized = 1 - dist / cursorRadius;
          const force = bulgeStrength * normalized * cursorForce;
          const angle = Math.atan2(dy, dx);
          if (bulgeOnly) {
            // Push only outward, never pull through
            dot.x -= Math.cos(angle) * force * 0.06;
            dot.y -= Math.sin(angle) * force * 0.06;
          } else {
            dot.x -= Math.cos(angle) * force * 0.06;
            dot.y -= Math.sin(angle) * force * 0.06;
          }
        } else {
          // Spring back to base position when out of cursor range
          dot.x += (dot.baseX - dot.x) * 0.08;
          dot.y += (dot.baseY - dot.y) * 0.08;
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = requestAnimationFrame(animate);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [dotRadius, dotSpacing, cursorRadius, cursorForce, bulgeOnly, bulgeStrength, glowRadius, color]);

  return <canvas ref={canvasRef} className="dot-field-canvas" />;
}

type ColorBendsProps = {
  color?: string;
  speed?: number;
  frequency?: number;
  intensity?: number;
};

export function ColorBends({
  color = "#5291b3",
  intensity = 1.3,
}: ColorBendsProps) {
  // CSS-driven approximation of the React Bits WebGL ColorBends
  // Multiple animated radial gradients in the user's base color
  return (
    <div
      className="color-bends"
      aria-hidden
      style={{
        background: `
          radial-gradient(ellipse 60% 50% at 18% 20%, ${color}66, transparent 60%),
          radial-gradient(ellipse 50% 60% at 82% 30%, #F3E3D0aa, transparent 55%),
          radial-gradient(ellipse 70% 40% at 50% 92%, #D2C4B4cc, transparent 65%),
          radial-gradient(ellipse 40% 35% at 75% 75%, ${color}55, transparent 60%)
        `,
        filter: `blur(${48 * intensity}px) saturate(${1 + intensity * 0.1})`,
      }}
    />
  );
}
