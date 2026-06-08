"use client";

import { useEffect, useRef } from "react";

type Props = {
  dotRadius?: number;
  dotSpacing?: number;
  cursorRadius?: number;
  bulgeStrength?: number;
  glowRadius?: number;
};

export function DotField({
  dotRadius = 1.5,
  dotSpacing = 40,
  cursorRadius = 150,
  bulgeStrength = 0.05,
  glowRadius = 160,
}: Props) {
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
    let dots: { x: number; y: number; baseX: number; baseY: number }[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      dots = [];
      for (let x = 0; x < width; x += dotSpacing) {
        for (let y = 0; y < height; y += dotSpacing) {
          dots.push({ x, y, baseX: x, baseY: y });
        }
      }
    };

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // glow under cursor
      if (mouseX > 0 && mouseY > 0) {
        const grad = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, glowRadius);
        grad.addColorStop(0, "rgba(99, 102, 241, 0.15)");
        grad.addColorStop(1, "rgba(99, 102, 241, 0)");
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.fillStyle = "rgba(192, 193, 255, 0.18)";
      for (const dot of dots) {
        const dx = mouseX - dot.x;
        const dy = mouseY - dot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < cursorRadius) {
          const angle = Math.atan2(dy, dx);
          const push = (cursorRadius - dist) * bulgeStrength;
          dot.x -= Math.cos(angle) * push;
          dot.y -= Math.sin(angle) * push;
        } else {
          dot.x += (dot.baseX - dot.x) * 0.1;
          dot.y += (dot.baseY - dot.y) * 0.1;
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
    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
    };
  }, [dotRadius, dotSpacing, cursorRadius, bulgeStrength, glowRadius]);

  return <canvas ref={canvasRef} className="dot-field-canvas" />;
}

export function ColorBends() {
  // CSS-driven approximation of the WebGL ColorBends effect
  return <div className="color-bends" aria-hidden />;
}
