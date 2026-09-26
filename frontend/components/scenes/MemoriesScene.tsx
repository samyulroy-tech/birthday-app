"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MemoryFrame } from "@/components/MediaFrame";
import { MediaItem } from "@/lib/types";
import { sfx } from "@/lib/audio";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

const VARIANTS = [
  { initial: { y: "-120vh", rotate: -16, opacity: 0 }, animate: { y: 0, rotate: -2, opacity: 1 } },
  { initial: { rotateY: 100, scale: 0.7, opacity: 0 }, animate: { rotateY: 0, scale: 1, opacity: 1 } },
  { initial: { scale: 0.15, opacity: 0, filter: "blur(14px)" }, animate: { scale: 1, opacity: 1, filter: "blur(0px)" } },
  { initial: { y: 70, rotateX: 20, opacity: 0 }, animate: { y: 0, rotateX: 0, opacity: 1 } },
  { initial: { clipPath: "inset(0 100% 0 0)", filter: "brightness(2.4)" }, animate: { clipPath: "inset(0 0% 0 0)", filter: "brightness(1)" }, hearts: true },
];

export function MemoriesScene({
  items,
  defaultDuration,
  onDone,
}: {
  items: MediaItem[];
  defaultDuration: number;
  onDone: () => void;
}) {
  const [index, setIndex] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const fx = useFx();
  const timerRef = useRef<number>();

  const active = items[index];
  const variant = VARIANTS[index % VARIANTS.length];
  const durationMs = (active?.duration_seconds || defaultDuration || 5) * 1000;

  useEffect(() => {
    if (!active) {
      onDone();
      return;
    }
    sfx.photo();
    if (variant.hearts && frameRef.current) {
      const [x, y] = elementCenter(frameRef.current);
      fx?.hearts(x, y, 16);
    }
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setIndex((i) => i + 1), durationMs);
    return () => window.clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  if (!active) return null;

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center px-6">
      <div className="[perspective:1200px] w-full flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            ref={frameRef}
            initial={variant.initial}
            animate={variant.animate}
            transition={{ duration: 1.5, ease: [0.2, 0.7, 0.2, 1] }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <MemoryFrame item={active} index={index} />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="w-[min(78vw,380px)] h-[3px] bg-white/15 rounded-full mt-4 overflow-hidden">
        <motion.div
          key={active.id + "-bar"}
          className="h-full bg-gradient-to-r from-rose to-gold"
          initial={{ width: `${(index / items.length) * 100}%` }}
          animate={{ width: `${((index + 1) / items.length) * 100}%` }}
          transition={{ duration: durationMs / 1000, ease: "linear" }}
        />
      </div>

      <div className="flex gap-3.5 mt-5 items-center">
        <button
          aria-label="Previous"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          className="min-h-[46px] px-5 rounded-full glass glass-interactive"
        >
          ‹
        </button>
        <button
          aria-label="Next"
          onClick={() => setIndex((i) => i + 1)}
          className="min-h-[46px] px-5 rounded-full glass glass-interactive"
        >
          ›
        </button>
      </div>
    </div>
  );
}
