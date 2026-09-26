"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MediaItem } from "@/lib/types";
import { MediaVisual, MemoryFrame } from "@/components/MediaFrame";
import { sfx } from "@/lib/audio";

function heartPoint(i: number, n: number) {
  const t = (i / n) * Math.PI * 2;
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
}

export function GalleryScene({ items, onNext }: { items: MediaItem[]; onNext: () => void }) {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const [showNext, setShowNext] = useState(false);
  const n = Math.max(items.length, 14);

  const tiles = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const item = items[i % items.length];
        const h = heartPoint(i, n);
        return {
          item,
          key: i,
          left: 50 + h.x * 2.6,
          top: 47 + h.y * 2.15,
          size: [15, 19, 13][i % 3],
          delay: -Math.random() * 4,
          dur: 3 + Math.random() * 3,
          rot: (Math.random() * 8 - 4) | 0,
        };
      }),
    [items, n]
  );

  useEffect(() => {
    const t = setTimeout(() => setShowNext(true), 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <h2 className="serif absolute top-[5%] left-0 right-0 text-center z-[3] text-[clamp(30px,7vw,60px)] animate-fade-up">
        Every moment, still yours
      </h2>

      <div className="absolute inset-0">
        {tiles.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: [0, -8, 8, 0],
              rotate: [t.rot, -t.rot, t.rot],
            }}
            transition={{
              opacity: { duration: 0.9, delay: i * 0.09 },
              scale: { duration: 0.9, delay: i * 0.09, ease: "easeOut" },
              y: { duration: t.dur, repeat: Infinity, ease: "easeInOut", delay: t.delay },
              rotate: { duration: t.dur, repeat: Infinity, ease: "easeInOut", delay: t.delay },
            }}
            className="absolute -translate-x-1/2 -translate-y-1/2 border-[3px] border-[#fbf3ea] rounded overflow-hidden shadow-[0_14px_30px_rgba(0,0,0,0.55)] cursor-pointer bg-[#222]"
            style={{ left: `${t.left}%`, top: `${t.top}%`, width: `${t.size}vmin`, aspectRatio: "1" }}
            onClick={() => {
              setLightbox(i);
              sfx.photo();
            }}
          >
            <MediaVisual item={t.item} index={i} className="w-full h-full object-cover" autoPlayVideo={false} />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showNext && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onNext}
            className="absolute bottom-[5%] left-1/2 -translate-x-1/2 z-[3] min-h-[52px] px-7 rounded-full border border-gold/60 bg-gradient-to-br from-rose to-violet text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.04] active:scale-95 transition-all duration-300 ease-out animate-glow-pulse"
          >
            One more thing... 🎂
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {lightbox !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/75 backdrop-blur-md grid place-items-center"
            onClick={() => setLightbox(null)}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MemoryFrame item={tiles[lightbox].item} index={lightbox} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
