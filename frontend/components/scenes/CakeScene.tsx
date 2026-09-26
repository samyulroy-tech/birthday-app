"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { sfx } from "@/lib/audio";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

const CANDLE_COUNT = 5;

export function CakeScene({
  cakeMessage,
  recipientName,
  onDone,
}: {
  cakeMessage: string;
  recipientName: string;
  onDone: () => void;
}) {
  const [lit, setLit] = useState(Array.from({ length: CANDLE_COUNT }, () => true));
  const [hint, setHint] = useState("Tap the candles to blow them out ❤️");
  const [micActive, setMicActive] = useState(false);
  const [cutStage, setCutStage] = useState<0 | 1 | 2>(0); // 0 lit-phase, 1 ready-to-cut, 2 cut
  const cakeRef = useRef<HTMLDivElement>(null);
  const fx = useFx();
  const streamRef = useRef<MediaStream | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const litCount = lit.filter(Boolean).length;

  // Make sure the microphone is always released, even if the person leaves
  // this scene (browser back, tab switch, or the scene simply advancing)
  // while listening is still active.
  useEffect(() => {
    return () => stopMic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (litCount === 0 && cutStage === 0) {
      stopMic();
      sfx.ding();
      fx?.confetti(120);
      setHint("You did it! 🕯️✨");
      const t = setTimeout(() => {
        setHint("Now cut the cake 🎂");
        setCutStage(1);
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [litCount, cutStage, fx]);

  function blowOut(i: number) {
    setLit((prev) => {
      if (!prev[i]) return prev;
      const next = [...prev];
      next[i] = false;
      return next;
    });
    sfx.blow();
    if (cakeRef.current) {
      const [x, y] = elementCenter(cakeRef.current);
      fx?.burst(x, y - 20, 14, { v: 1.2, g: -0.03, life: 70, size: 3, colors: ["#ccc", "#999", "#f4c97a"] });
    }
  }

  async function startMic() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false },
      });
      streamRef.current = stream;
      setMicActive(true);
      setHint("Now blow gently towards your mic 🌬️");
      const AC = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioCtxRef.current = AC;
      const analyser = AC.createAnalyser();
      analyser.fftSize = 512;
      AC.createMediaStreamSource(stream).connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      let hot = 0;
      let cooldown = 0;
      let firstUnlit = 0;

      function loop() {
        if (!streamRef.current) return;
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) sum += ((v - 128) / 128) ** 2;
        const rms = Math.sqrt(sum / data.length);
        hot = rms > 0.09 ? hot + 1 : 0;
        if (hot > 5 && performance.now() > cooldown) {
          setLit((prev) => {
            const idx = prev.findIndex(Boolean);
            if (idx === -1) return prev;
            blowOut(idx);
            return prev;
          });
          cooldown = performance.now() + 450;
        }
        requestAnimationFrame(loop);
      }
      loop();
    } catch {
      setHint("Tap the candles to blow them out ❤️");
    }
  }

  function stopMic() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    setMicActive(false);
  }

  async function handleCut() {
    setCutStage(2);
    sfx.cut();
    if (cakeRef.current) {
      const [x, y] = elementCenter(cakeRef.current);
      fx?.burst(x + 40, y + 20, 60, { v: 3, life: 60, colors: ["#ffd9e6", "#f4c97a", "#fff3ea"] });
    }
    fx?.confetti(140);
    setHint("First slice is yours ❤️");
    setTimeout(onDone, 5000);
  }

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center text-center px-6">
      <h2 className="serif gradient-text-animated text-[clamp(30px,7vw,60px)] leading-[1.1] mb-1 animate-fade-up">One more thing...</h2>
      <div className="serif text-[clamp(24px,6vw,38px)] text-gold text-glow mb-2">
        {cakeMessage} {recipientName}
      </div>

      <motion.div
        ref={cakeRef}
        initial={{ y: 60, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: "easeOut" }}
        className="relative w-[min(80vw,330px)] h-[min(76vw,315px)] my-6"
      >
        <div className="absolute bottom-[-16px] left-[-10%] w-[120%] h-7 rounded-[50%]" style={{ background: "radial-gradient(rgba(255,255,255,0.25), rgba(255,255,255,0.08) 60%, transparent 70%)", boxShadow: "0 22px 30px rgba(0,0,0,0.6)" }} />
        <div className="absolute bottom-0 left-0 w-full h-[34%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#ffd9e6, #ff9fc0)", boxShadow: "inset -14px 0 22px rgba(0,0,0,0.25), inset 10px 0 18px rgba(255,255,255,0.2)" }} />
        <div className="absolute bottom-[33%] left-[13%] w-[74%] h-[30%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#fff0d0, #f4c97a)", boxShadow: "inset -14px 0 22px rgba(0,0,0,0.25), inset 10px 0 18px rgba(255,255,255,0.2)" }} />
        <div className="absolute bottom-[62%] left-[26%] w-[48%] h-[26%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#e9d5ff, #a77be0)", boxShadow: "inset -14px 0 22px rgba(0,0,0,0.25), inset 10px 0 18px rgba(255,255,255,0.2)" }} />

        <div className="absolute bottom-[87%] left-[30%] w-[40%] flex justify-between z-[2]">
          {lit.map((isLit, i) => (
            <button
              key={i}
              aria-label={`Candle ${i + 1}`}
              onPointerDown={() => isLit && blowOut(i)}
              className="relative w-2 h-[38px] rounded-[3px]"
              style={{
                background:
                  "repeating-linear-gradient(45deg, #fff, #fff 5px, #ff7fa9 5px, #ff7fa9 10px)",
              }}
            >
              {isLit && (
                <motion.div
                  animate={{ scaleX: [1, 0.92, 1], rotate: [0, 4, 0] }}
                  transition={{ duration: 0.18, repeat: Infinity }}
                  className="absolute left-1/2 bottom-full w-3 h-[22px] -ml-1.5 rounded-[50%]"
                  style={{
                    background: "radial-gradient(#fff 10%, #ffd36a 40%, #ff8a3d 70%, transparent 72%)",
                    filter: "drop-shadow(0 0 10px #ffb84a)",
                    transformOrigin: "50% 100%",
                  }}
                />
              )}
            </button>
          ))}
        </div>

        {cutStage === 2 && (
          <motion.div
            initial={{ x: 0, rotate: 0 }}
            animate={{ x: "34%", y: "-8%", rotate: 6, scale: 1.1 }}
            transition={{ duration: 1.5, ease: [0.2, 1, 0.3, 1] }}
            className="absolute inset-0"
            style={{ clipPath: "polygon(60% 0,80% 0,80% 100%,60% 100%)" }}
          >
            <div className="absolute bottom-0 left-0 w-full h-[34%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#ffd9e6, #ff9fc0)" }} />
            <div className="absolute bottom-[33%] left-[13%] w-[74%] h-[30%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#fff0d0, #f4c97a)" }} />
            <div className="absolute bottom-[62%] left-[26%] w-[48%] h-[26%] rounded-t-2xl rounded-b-lg" style={{ background: "linear-gradient(#e9d5ff, #a77be0)" }} />
          </motion.div>
        )}
      </motion.div>

      <p className="serif text-[22px]">{hint}</p>

      <div className="flex gap-3 mt-3 justify-center">
        {cutStage === 0 && !micActive && (
          <button onClick={startMic} className="min-h-[46px] px-5 rounded-full glass glass-interactive">
            🎤 Blow into your mic
          </button>
        )}
        {cutStage === 1 && (
          <button
            onClick={handleCut}
            className="min-h-[52px] px-7 rounded-full border border-gold/60 bg-gradient-to-br from-rose to-violet text-white font-semibold shadow-glow hover:shadow-glow-lg hover:scale-[1.04] active:scale-95 transition-all duration-300 ease-out"
          >
            Cut the cake 🔪
          </button>
        )}
      </div>
    </div>
  );
}
