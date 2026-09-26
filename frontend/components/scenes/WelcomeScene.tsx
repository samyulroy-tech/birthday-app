"use client";

import { motion } from "framer-motion";
import { RevealWords } from "@/components/RevealWords";

interface WelcomeSceneProps {
  name?: string | null;
}

export function WelcomeScene({
  name,
}: WelcomeSceneProps) {
  /*
   * Backend se recipient_name aayega.
   *
   * Example:
   * name = "Priya"
   *
   * Result:
   * "Shh... welcome, Priya."
   */
  const safeName =
    typeof name === "string" && name.trim().length > 0
      ? name.trim()
      : "you";

  return (
    <main
      className="
        fixed
        inset-0
        flex
        min-h-screen
        items-center
        justify-center
        overflow-hidden
        bg-[#090711]
        px-6
        text-center
        text-white
      "
    >
      {/* =====================================================
          AMBIENT GLOW
      ===================================================== */}

      <motion.div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          left-1/2
          top-1/2
          h-[60vw]
          w-[60vw]
          max-h-[520px]
          max-w-[520px]
          -translate-x-1/2
          -translate-y-1/2
          rounded-full
        "
        style={{
          background:
            "radial-gradient(circle, rgba(255,127,169,0.20), transparent 65%)",
        }}
        animate={{
          opacity: [0.4, 0.9, 0.4],
          scale: [0.92, 1.04, 0.92],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* =====================================================
          DARK VIGNETTE
      ===================================================== */}

      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute
          inset-0
          bg-[radial-gradient(circle_at_center,transparent_20%,rgba(9,7,17,0.35)_75%,rgba(9,7,17,0.8)_100%)]
        "
      />

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 20,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative
          z-10
          w-full
          max-w-3xl
        "
      >
        {/* Small intro */}
        <motion.p
          initial={{
            opacity: 0,
            letterSpacing: "0.2em",
          }}
          animate={{
            opacity: 1,
            letterSpacing: "0.4em",
          }}
          transition={{
            duration: 1.2,
            delay: 0.2,
          }}
          className="
            mb-5
            text-[10px]
            font-medium
            uppercase
            text-amber-300/80
            sm:text-xs
          "
        >
          a little secret, just for you
        </motion.p>

        {/* ===================================================
            WELCOME TEXT
        =================================================== */}

        <h1
          className="
            text-[clamp(30px,7vw,60px)]
            font-semibold
            leading-[1.1]
            tracking-tight
            text-white
            drop-shadow-[0_0_25px_rgba(255,127,169,0.35)]
          "
        >
          <RevealWords
            text={`Shh... welcome, ${safeName}.`}
            stagger={0.14}
          />
        </h1>

        {/* ===================================================
            DECORATIVE LINE
        =================================================== */}

        <motion.div
          initial={{
            width: 0,
            opacity: 0,
          }}
          animate={{
            width: 80,
            opacity: 1,
          }}
          transition={{
            delay: 1.1,
            duration: 0.8,
          }}
          className="
            mx-auto
            mt-7
            h-px
            bg-gradient-to-r
            from-transparent
            via-amber-300
            to-transparent
          "
        />
      </motion.div>
    </main>
  );
}