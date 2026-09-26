"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { BalloonField } from "@/components/BalloonField";
import { computeTargetEpoch } from "@/lib/time";
import { Balloon } from "@/lib/types";

const UNITS = [
  "Days",
  "Hours",
  "Minutes",
  "Seconds",
] as const;

interface CountdownSceneProps {
  date: string;
  time: string;
  timezone: string;
  balloons: Balloon[];
  onComplete: () => void;
}

export function CountdownScene({
  date,
  time,
  timezone,
  balloons,
  onComplete,
}: CountdownSceneProps) {
  const target = useRef(
    computeTargetEpoch(date, time, timezone)
  );

  const [values, setValues] = useState([
    0,
    0,
    0,
    0,
  ]);

  const [popped, setPopped] = useState(0);
  const [toast, setToast] = useState("");

  const toastTimerRef =
    useRef<number | null>(null);

  const messages = useRef<string[]>([
    "Someone is getting closer to something special... 🎈",
    "You found a little surprise ❤️",
    "Keep going...",
    "Almost there...",
    ...balloons
      .filter(
        (balloon) =>
          balloon.enabled &&
          Boolean(balloon.message?.trim())
      )
      .map((balloon) =>
        balloon.message.trim()
      ),
  ]);

  // -----------------------------------------
  // COUNTDOWN
  // -----------------------------------------

  useEffect(() => {
    const updateCountdown = () => {
      const difference = Math.max(
        0,
        target.current - Date.now()
      );

      const days = Math.floor(
        difference / 864e5
      );

      const hours = Math.floor(
        (difference % 864e5) / 36e5
      );

      const minutes = Math.floor(
        (difference % 36e5) / 6e4
      );

      const seconds = Math.floor(
        (difference % 6e4) / 1e3
      );

      setValues([
        days,
        hours,
        minutes,
        seconds,
      ]);

      if (difference <= 0) {
        return true;
      }

      return false;
    };

    // Run immediately so there is no
    // initial 250ms delay.
    if (updateCountdown()) {
      onComplete();
      return;
    }

    const interval =
      window.setInterval(() => {
        if (updateCountdown()) {
          window.clearInterval(interval);
          onComplete();
        }
      }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [onComplete]);

  // -----------------------------------------
  // BALLOON POP
  // -----------------------------------------

  function handlePop(_message: string) {
    setPopped((previous) => {
      const next = previous + 1;

      const availableMessages =
        messages.current;

      const message =
        next % 5 === 0
          ? "Keep going..."
          : availableMessages.length > 0
            ? availableMessages[
                Math.floor(
                  Math.random() *
                    availableMessages.length
                )
              ]
            : "You found a little surprise ❤️";

      setToast(message);

      if (
        toastTimerRef.current !== null
      ) {
        window.clearTimeout(
          toastTimerRef.current
        );
      }

      toastTimerRef.current =
        window.setTimeout(() => {
          setToast("");
          toastTimerRef.current = null;
        }, 2600);

      return next;
    });
  }

  // -----------------------------------------
  // CLEANUP TOAST TIMER
  // -----------------------------------------

  useEffect(() => {
    return () => {
      if (
        toastTimerRef.current !== null
      ) {
        window.clearTimeout(
          toastTimerRef.current
        );

        toastTimerRef.current = null;
      }
    };
  }, []);

  // -----------------------------------------
  // UI
  // -----------------------------------------

  return (
    <div
      className="
        fixed
        inset-0
        flex
        flex-col
        items-center
        justify-center
        px-6
        overflow-hidden
        text-center
      "
    >
      {/* -----------------------------------
          BALLOONS
      ----------------------------------- */}

      <BalloonField
        active={true}
        onPop={handlePop}
      />

      {/* -----------------------------------
          POP COUNTER
      ----------------------------------- */}

      <div
        className="
          absolute
          left-[18px]
          top-4
          z-[4]
          text-[13px]
          opacity-60
        "
      >
        🎈 {popped}
      </div>

      {/* -----------------------------------
          TITLE
      ----------------------------------- */}

      <h1
        className="
          serif
          text-glow
          gradient-text-animated
          relative
          z-[3]
          mb-2
          max-w-[90vw]
          text-[clamp(26px,6vw,52px)]
          leading-[1.1]
        "
      >
        Something special is waiting for you...
      </h1>

      {/* -----------------------------------
          COUNTDOWN
      ----------------------------------- */}

      <div
        className="
          relative
          z-[3]
          mt-5
          flex
          items-center
          gap-[clamp(4px,1.6vw,14px)]
          pointer-events-none
        "
      >
        {UNITS.map((label, index) => (
          <div
            key={label}
            className="
              flex
              items-center
              gap-[clamp(4px,1.6vw,14px)]
            "
          >
            {/* DIGIT CARD */}

            <div
              className="
                flip-digit
                relative
                min-w-[clamp(60px,16vw,104px)]
                overflow-hidden
                rounded-2xl
                px-1.5
                py-3.5
              "
            >
              <AnimatePresence
                mode="popLayout"
              >
                <motion.b
                  key={values[index]}
                  initial={{
                    y: -28,
                    opacity: 0,
                    filter:
                      "blur(6px)",
                  }}
                  animate={{
                    y: 0,
                    opacity: 1,
                    filter:
                      "blur(0px)",
                  }}
                  exit={{
                    y: 28,
                    opacity: 0,
                    filter:
                      "blur(6px)",
                  }}
                  transition={{
                    duration: 0.45,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                  className="
                    serif
                    text-glow
                    text-gold
                    block
                    text-[clamp(28px,7.5vw,52px)]
                    leading-none
                  "
                >
                  {String(
                    values[index]
                  ).padStart(2, "0")}
                </motion.b>
              </AnimatePresence>

              <small
                className="
                  text-[10px]
                  uppercase
                  tracking-widest
                  opacity-70
                  sm:text-xs
                "
              >
                {label}
              </small>
            </div>

            {/* SEPARATOR */}

            {index <
              UNITS.length - 1 && (
              <div
                className="
                  -mt-4
                  flex
                  flex-col
                  gap-2
                "
              >
                <span
                  className="
                    animate-twinkle
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-gold
                  "
                />

                <span
                  className="
                    animate-twinkle
                    h-1.5
                    w-1.5
                    rounded-full
                    bg-gold
                  "
                  style={{
                    animationDelay:
                      "1.1s",
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* -----------------------------------
          POP MESSAGE
      ----------------------------------- */}

      <div
        className="
          pointer-events-none
          absolute
          bottom-[9%]
          left-0
          right-0
          z-[4]
          px-6
        "
      >
        <AnimatePresence
          mode="wait"
        >
          {toast && (
            <motion.div
              key={toast}
              initial={{
                opacity: 0,
                y: 8,
                filter:
                  "blur(6px)",
              }}
              animate={{
                opacity: 1,
                y: 0,
                filter:
                  "blur(0px)",
              }}
              exit={{
                opacity: 0,
                y: -8,
                filter:
                  "blur(6px)",
              }}
              transition={{
                duration: 0.35,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              className="
                serif
                text-gold
                text-[clamp(20px,4.5vw,28px)]
              "
            >
              {toast}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}