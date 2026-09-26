"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { RevealWords } from "@/components/RevealWords";
import { useFx } from "@/lib/FxProvider";
import { sfx } from "@/lib/audio";

export function BirthdayScene({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  const fx = useFx();
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (!fx) return;
    let cancelled = false;
    (async () => {
      const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
      await sleep(1000);
      for (let i = 0; i < 6; i++) {
        if (cancelled) return;
        fx.firework();
        sfx.firework();
        await sleep(600);
      }
      fx.confetti(160);
      setStage(1);
      await sleep(2600);
      setStage(2);
      await sleep(3200);
      setStage(3);
      fx.confetti(80);
      await sleep(6000);
      onDone();
    })();
    return () => {
      cancelled = true;
    };
  }, [fx, onDone]);

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6">
      {stage >= 1 && (
        <motion.div
          className="absolute w-[70vw] h-[70vw] max-w-[640px] max-h-[640px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(244,201,122,0.22), transparent 65%)" }}
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.05, 0.9] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      {stage >= 1 && (
        <div
          className="font-display italic font-medium leading-[1.05] text-[clamp(40px,11vw,120px)] relative"
          style={{
            background: "linear-gradient(#fff, #f4c97a)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            filter: "drop-shadow(0 0 40px rgba(244,201,122,0.35))",
          }}
        >
          <RevealWords text="HAPPY BIRTHDAY" stagger={0.22} />
        </div>
      )}
      {stage >= 2 && (
        <div
          className="font-display italic font-medium leading-[1.05] mt-3.5"
          style={{
            fontSize: "clamp(28px,7vw,72px)",
            background: "linear-gradient(#fff, #f4c97a)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        >
          <RevealWords text="MY BEAUTIFUL SIS ❤️" stagger={0.18} />
        </div>
      )}
      {stage >= 3 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3 }}
          className="serif mt-6 max-w-[640px] text-[clamp(20px,4.6vw,30px)] leading-[1.4]"
        >
          {message}
        </motion.p>
      )}
    </div>
  );
}
