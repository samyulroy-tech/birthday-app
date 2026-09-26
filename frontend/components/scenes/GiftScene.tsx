"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

export function GiftScene({ message, onDone }: { message: string; onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);
  const fx = useFx();

  function handleOpen() {
    if (open) return;
    setOpen(true);
    sfx.gift();
    if (boxRef.current) {
      const [x, y] = elementCenter(boxRef.current);
      fx?.burst(x, y, 90, { v: 7, life: 80, colors: ["#f4c97a", "#fff3ea"] });
      fx?.hearts(x, y, 24);
    }
    fx?.confetti(140);
    setTimeout(onDone, 4200);
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6">
      <h2 className="serif gradient-text-animated text-[clamp(30px,7vw,60px)] leading-[1.1] mb-8 animate-fade-up">{message}</h2>

      <motion.div
        ref={boxRef}
        role="button"
        tabIndex={0}
        aria-label="Open the gift"
        onClick={handleOpen}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && handleOpen()}
        animate={open ? {} : { y: [0, -14, 0] }}
        transition={{ duration: 1.5, repeat: open ? 0 : Infinity, ease: "easeInOut" }}
        className="relative w-[170px] h-[170px] cursor-pointer"
      >
        <motion.div
          className="absolute left-1/2 bottom-[55%] w-[240px] -translate-x-1/2"
          style={{
            background: "linear-gradient(rgba(244,201,122,0.94), transparent)",
            clipPath: "polygon(30% 100%, 70% 100%, 100% 0, 0 0)",
          }}
          animate={{ height: open ? "55vh" : 0 }}
          transition={{ duration: 1.2 }}
        />
        <div
          className="absolute bottom-0 left-[6%] w-[88%] h-[64%] rounded-md"
          style={{ background: "linear-gradient(90deg, #a03670, #e0609a 50%, #a03670)", boxShadow: "0 22px 30px rgba(0,0,0,0.6)" }}
        />
        <motion.div
          className="absolute bottom-[60%] left-0 w-full h-[24%] rounded-md"
          style={{ background: "linear-gradient(90deg, #b23f7c, #f070aa 50%, #b23f7c)" }}
          animate={open ? { y: -120, rotate: -18, opacity: 0 } : { y: 0, rotate: 0, opacity: 1 }}
          transition={{ duration: 1, ease: [0.3, 1.2, 0.4, 1] }}
        >
          <div
            className="absolute left-[34%] bottom-[80%] w-[32%] h-[60px] rounded-t-full"
            style={{ border: "8px solid #f4c97a", borderBottom: 0 }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
