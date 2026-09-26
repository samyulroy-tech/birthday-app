"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MediaItem } from "@/lib/types";
import { MediaVisual } from "@/components/MediaFrame";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

export function SpecialScene({
  item,
  index,
  subtitle,
  onDone,
}: {
  item: MediaItem;
  index: number;
  subtitle: string;
  onDone: () => void;
}) {
  const [showCaption, setShowCaption] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const fx = useFx();

  useEffect(() => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    let sparkleTimer: number | undefined;
    (async () => {
      await sleep(1200);
      sparkleTimer = window.setInterval(() => {
        if (!frameRef.current) return;
        const [x, y] = elementCenter(frameRef.current);
        fx?.burst(x + (Math.random() - 0.5) * 380, y + (Math.random() - 0.5) * 400, 3, {
          v: 0.8,
          g: -0.02,
          life: 90,
          colors: ["#f4c97a"],
        });
        if (Math.random() < 0.3) fx?.hearts(x + (Math.random() - 0.5) * 380, y + 180, 1);
      }, 120);
      await sleep(2800);
      setShowCaption(true);
      await sleep(8000);
      if (sparkleTimer) clearInterval(sparkleTimer);
      onDone();
    })();
    return () => {
      if (sparkleTimer) clearInterval(sparkleTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6">
      <div className="[perspective:1200px] w-full flex justify-center">
        <motion.div
          ref={frameRef}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2.5, ease: "easeOut" }}
          className="relative w-[min(74vw,440px)] bg-[#fbf3ea] rounded-md p-3.5 pb-0 text-[#2a1633] overflow-hidden"
          style={{ boxShadow: "0 0 90px rgba(244,201,122,0.55), 0 40px 80px rgba(0,0,0,0.6)" }}
        >
          <div className="aspect-square overflow-hidden bg-[#222] rounded-sm">
            <motion.div
              className="w-full h-full"
              initial={{ scale: 1 }}
              animate={{ scale: 1.18 }}
              transition={{ duration: 14, ease: "linear" }}
            >
              <MediaVisual item={item} index={index} className="w-full h-full object-cover" />
            </motion.div>
          </div>
          <div className="py-3.5 px-1 pb-4">
            <h3 className="serif m-0 text-3xl font-medium">{item.title}</h3>
            <p className="text-sm opacity-85">{item.caption}</p>
          </div>
        </motion.div>
      </div>
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: showCaption ? 1 : 0 }}
        transition={{ duration: 3 }}
        className="serif mt-6 text-[clamp(24px,5vw,40px)]"
      >
        {subtitle}
      </motion.h1>
    </div>
  );
}
