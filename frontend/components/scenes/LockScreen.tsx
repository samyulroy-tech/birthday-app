"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { publicApi } from "@/lib/api";
import { sfx, primeAudio } from "@/lib/audio";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

export function LockScreen({
  intro,
  onUnlock,
}: {
  intro: string;
  onUnlock: () => void;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [opening, setOpening] = useState(false);
  const [checking, setChecking] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const fx = useFx();

  useEffect(() => {
    const id = setInterval(() => {
      if (!fx || opening) return;

      const [x, y] = elementCenter(wrapRef.current);

      fx.burst(
        x + (Math.random() - 0.5) * 300,
        y + (Math.random() - 0.5) * 60,
        2,
        {
          v: 0.8,
          g: -0.01,
          colors: ["#f4c97a", "#ff7fa9"],
          life: 80,
        }
      );
    }, 250);

    return () => clearInterval(id);
  }, [fx, opening]);

  async function tryUnlock() {
    primeAudio();

    if (!password.trim()) {
      setError("Enter the secret word ❤️");
      return;
    }

    setChecking(true);
    setError("");

    try {
      const { valid } = await publicApi.verifyPassword(password);

      if (!valid) {
        setError("Not quite... try again 😄");
        setShake(true);
        sfx.click();

        setTimeout(() => {
          setShake(false);
        }, 500);

        return;
      }

      setOpening(true);
      sfx.unlock();

      const lockIcon = document.getElementById("lock-icon");

      if (lockIcon) {
        const [x, y] = elementCenter(lockIcon);

        fx?.burst(x, y, 120, {
          v: 8,
          life: 80,
          colors: ["#f4c97a", "#fff3ea"],
        });
      }

      setTimeout(onUnlock, 1900);
    } catch (e) {
      console.error("Unlock error:", e);
      setError("Something went wrong — try again in a moment.");
    } finally {
      setChecking(false);
    }
  }

  return (
    <main
      ref={wrapRef}
      className="fixed inset-0 z-10 flex min-h-screen items-center justify-center overflow-hidden bg-[#090711] px-4 py-8 text-white"
    >
      {/* Background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[18%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-pink-500/10 blur-[100px]" />

        <div className="absolute bottom-[-120px] left-[-100px] h-[300px] w-[300px] rounded-full bg-purple-500/10 blur-[90px]" />

        <div className="absolute right-[-100px] top-[-100px] h-[300px] w-[300px] rounded-full bg-amber-400/10 blur-[90px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative z-10 w-full max-w-[560px] rounded-[32px] border border-white/10 bg-white/[0.07] px-6 py-9 text-center shadow-2xl backdrop-blur-xl sm:px-12 sm:py-14"
      >
        {/* Lock */}
        <motion.div
          className="mx-auto mb-5 grid h-[92px] w-[92px] place-items-center rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(244,201,122,0.22), transparent 70%)",
          }}
          animate={{
            boxShadow: [
              "0 0 0 rgba(244,201,122,0)",
              "0 0 32px rgba(244,201,122,0.35)",
              "0 0 0 rgba(244,201,122,0)",
            ],
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <motion.svg
            id="lock-icon"
            viewBox="0 0 28 34"
            className="w-[62px]"
            style={{
              filter:
                "drop-shadow(0 0 18px rgba(244,201,122,0.55))",
            }}
          >
            <motion.path
              d="M7 15V10a7 7 0 0 1 14 0v5"
              fill="none"
              stroke="#f4c97a"
              strokeWidth={2.6}
              animate={
                opening
                  ? {
                      translateY: -9,
                      rotate: -38,
                    }
                  : {
                      translateY: 0,
                      rotate: 0,
                    }
              }
              style={{
                transformOrigin: "14px 30px",
              }}
              transition={{
                duration: 1,
                ease: [0.3, 1.4, 0.5, 1],
              }}
            />

            <rect
              x={3}
              y={15}
              width={22}
              height={17}
              rx={4}
              fill="#f4c97a"
            />

            <circle
              cx={14}
              cy={23}
              r={2.4}
              fill="#3a1a2a"
            />
          </motion.svg>
        </motion.div>

        <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-amber-300/80">
          A private invitation
        </p>

        <h1 className="mb-4 text-[clamp(28px,6vw,48px)] font-semibold leading-[1.1] tracking-tight text-white">
          Before we begin...
        </h1>

        <p className="mx-auto max-w-[460px] whitespace-pre-line text-[clamp(18px,4vw,26px)] leading-[1.5] text-white/85">
          {intro}
        </p>

        {/* Password */}
        <motion.div
          animate={
            shake
              ? {
                  x: [0, -12, 12, -12, 12, 0],
                }
              : {
                  x: 0,
                }
          }
          transition={{ duration: 0.5 }}
          className="mx-auto my-7 w-fit rounded-full p-[3px]"
          style={{
            background:
              "conic-gradient(from 0deg, #ff7fa9, #f4c97a, #8a63d8, #ff7fa9)",
            boxShadow:
              "0 0 40px rgba(255,127,169,0.4)",
          }}
        >
          <input
            type="password"
            autoComplete="off"
            placeholder="the secret word"
            aria-label="Password"
            value={password}
            disabled={checking}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                void tryUnlock();
              }
            }}
            className="h-[54px] w-[min(78vw,320px)] rounded-full border-0 bg-[#160a22] px-5 text-center text-lg font-semibold tracking-wider text-[#fff3ea] outline-none placeholder:text-white/35 focus:ring-2 focus:ring-amber-300/50 disabled:opacity-60"
          />
        </motion.div>

        <div className="mb-3 min-h-[26px] text-sm text-pink-300">
          {error}
        </div>

        <button
          type="button"
          onClick={() => void tryUnlock()}
          disabled={checking}
          className="min-h-[52px] rounded-full border border-amber-300/60 bg-gradient-to-br from-pink-500 to-purple-600 px-7 font-semibold text-white shadow-lg shadow-pink-500/20 transition-all duration-300 hover:scale-[1.03] hover:shadow-pink-500/30 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {checking ? "Checking..." : "Unlock My Surprise ❤️"}
        </button>
      </motion.div>

      {/* Unlock flash */}
      {opening && (
        <motion.div
          className="pointer-events-none fixed inset-0 z-50"
          style={{
            background:
              "radial-gradient(circle, #ffe6a8, rgba(244,201,122,0.33) 40%, transparent 70%)",
          }}
          initial={{
            opacity: 0,
            scale: 0.2,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0.2, 1, 2.4],
          }}
          transition={{
            duration: 1.8,
            ease: "easeIn",
          }}
        />
      )}
    </main>
  );
}