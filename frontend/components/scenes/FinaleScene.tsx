"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MediaItem } from "@/lib/types";
import { MediaVisual } from "@/components/MediaFrame";
import { RevealWords } from "@/components/RevealWords";
import { useFx } from "@/lib/FxProvider";
import { sfx } from "@/lib/audio";

function heartPoint(i: number, n: number) {
  const t = (i / n) * Math.PI * 2;
  return {
    x: 16 * Math.sin(t) ** 3,
    y: -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)),
  };
}

export function FinaleScene({ items, subtitle }: { items: MediaItem[]; subtitle: string }) {
  const [showFooter, setShowFooter] = useState(false);
  const fx = useFx();
  const n = Math.min(28, Math.max(items.length * 3, 18));

  const tiles = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const item = items[i % items.length];
        const h = heartPoint(i, n);
        return {
          item,
          key: i,
          left: 50 + h.x * 2.5,
          top: 45 + h.y * 2.05,
          size: [11, 13, 9][i % 3],
        };
      }),
    [items, n]
  );

  useEffect(() => {
    if (!fx) return;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let fwTimer: number | undefined;
    let confettiTimer: number | undefined;

    (async () => {
      await sleep(n * 60 + 1400);
      fwTimer = window.setInterval(() => {
        fx.firework();
        sfx.firework();
      }, 700);
      fx.confetti(200);
      confettiTimer = window.setInterval(() => fx.confetti(70), 3500);
      await sleep(4500);
      setShowFooter(true);
    })();

    return () => {
      if (fwTimer) clearInterval(fwTimer);
      if (confettiTimer) clearInterval(confettiTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fx]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <motion.div
        initial={{ scale: 1.5 }}
        animate={{ scale: 1 }}
        transition={{ duration: 12, ease: "easeOut" }}
        className="absolute inset-0"
      >
        {tiles.map((t, i) => (
          <motion.div
            key={t.key}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1.1, delay: i * 0.22, ease: [0.2, 1.4, 0.4, 1] }}
            className="absolute -translate-x-1/2 -translate-y-1/2 border-2 border-[#fbf3ea] rounded overflow-hidden shadow-[0_8px_20px_rgba(0,0,0,0.6)]"
            style={{ left: `${t.left}%`, top: `${t.top}%`, width: `${t.size}vmin`, aspectRatio: "1" }}
          >
            <MediaVisual item={t.item} index={i} className="w-full h-full object-cover" autoPlayVideo={false} />
          </motion.div>
        ))}
      </motion.div>

      <div className="relative z-[3] h-full flex flex-col items-center justify-center text-center px-6" style={{ textShadow: "0 0 30px #000" }}>
        <h1 className="font-display italic font-medium leading-[1.05] text-[clamp(24px,5.4vw,52px)]">
          <RevealWords text="Happy Birthday, Sis ❤️" stagger={0.5} delay={n * 0.06 + 1.4} />
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: showFooter ? 1 : 0 }}
          transition={{ duration: 3 }}
          className="serif mt-2 text-[22px]"
        >
          {subtitle}
        </motion.p>
      </div>
    </div>
  );
}
