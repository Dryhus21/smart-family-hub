"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useAnimationFrame, useTransform } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  colors?: string[];
  animationSpeed?: number;
  direction?: "horizontal" | "vertical" | "diagonal";
  pauseOnHover?: boolean;
  yoyo?: boolean;
};

export default function GradientText({
  children,
  className = "",
  colors = ["#2f5b78", "#5291b3", "#8b6f53", "#2f5b78"],
  animationSpeed = 6,
  direction = "horizontal",
  pauseOnHover = false,
  yoyo = true,
}: Props) {
  const [isPaused, setIsPaused] = useState(false);
  const progress = useMotionValue(0);
  const elapsedRef = useRef(0);
  const lastTimeRef = useRef<number | null>(null);

  const animationDuration = animationSpeed * 1000;

  useAnimationFrame((time) => {
    if (isPaused) {
      lastTimeRef.current = null;
      return;
    }
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
      return;
    }
    const delta = time - lastTimeRef.current;
    lastTimeRef.current = time;
    elapsedRef.current += delta;

    if (yoyo) {
      const fullCycle = animationDuration * 2;
      const cycleTime = elapsedRef.current % fullCycle;
      if (cycleTime < animationDuration) progress.set((cycleTime / animationDuration) * 100);
      else progress.set(100 - ((cycleTime - animationDuration) / animationDuration) * 100);
    } else {
      progress.set((elapsedRef.current / animationDuration) * 100);
    }
  });

  useEffect(() => {
    elapsedRef.current = 0;
    progress.set(0);
  }, [animationSpeed, yoyo, progress]);

  const backgroundPosition = useTransform(progress, (p) =>
    direction === "vertical" ? `50% ${p}%` : `${p}% 50%`
  );

  const gradientAngle =
    direction === "horizontal" ? "to right" : direction === "vertical" ? "to bottom" : "to bottom right";
  const gradientColors = [...colors, colors[0]].join(", ");

  const gradientStyle = {
    backgroundImage: `linear-gradient(${gradientAngle}, ${gradientColors})`,
    backgroundSize: direction === "vertical" ? "100% 300%" : "300% 100%",
    backgroundRepeat: "repeat" as const,
  };

  return (
    <motion.span
      className={`animated-gradient-text ${className}`}
      onMouseEnter={() => pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => pauseOnHover && setIsPaused(false)}
    >
      <motion.span className="gradient-content" style={{ ...gradientStyle, backgroundPosition }}>
        {children}
      </motion.span>
    </motion.span>
  );
}
