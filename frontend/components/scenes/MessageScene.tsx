"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useFx } from "@/lib/FxProvider";

export function MessageScene({ text, onDone }: { text: string; onDone: () => void }) {
  const [lines, setLines] = useState<string[]>([]);
  const fx = useFx();
  const doneRef = useRef(false);

  useEffect(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const paragraphs = text.split("\n").filter(Boolean);

    let heartTimer: number | undefined;
    (async () => {
      if (fx) {
        heartTimer = window.setInterval(() => {
          fx.hearts(Math.random() * window.innerWidth, window.innerHeight + 10, 1);
        }, 350);
        fx.starLevel = 0.8;
      }
      await sleep(2500);
      for (const line of paragraphs) {
        let acc = "";
        setLines((prev) => [...prev, ""]);
        for (const ch of line) {
          acc += ch;
          const snapshot = acc;
          setLines((prev) => {
            const next = [...prev];
            next[next.length - 1] = snapshot;
            return next;
          });
          await sleep(/[.,]/.test(ch) ? 280 : 52);
        }
        await sleep(1300);
      }
      await sleep(2500);
      if (heartTimer) clearInterval(heartTimer);
      onDone();
    })();

    return () => {
      if (heartTimer) clearInterval(heartTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="invite-card w-full max-w-[680px] px-7 py-10 sm:px-14 sm:py-14"
      >
        <span className="block text-3xl mb-2 animate-float">💌</span>
        <h1 className="serif gradient-text-animated text-[clamp(26px,6vw,52px)] leading-[1.1] mb-6">
          Happy Birthday, Sis ❤️
        </h1>
        <div className="serif opacity-95 max-w-[560px] mx-auto text-[clamp(18px,4vw,26px)] leading-[1.6] whitespace-pre-line">
          {lines.map((l, i) => (
            <p key={i} className="my-2 min-h-[1.4em]">
              {l}
              {i === lines.length - 1 && l.length > 0 && (
                <motion.span
                  className="inline-block w-[2px] h-[1em] bg-gold ml-1 align-middle"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
                />
              )}
            </p>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
