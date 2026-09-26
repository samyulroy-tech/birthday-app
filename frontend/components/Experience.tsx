"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { publicApi } from "@/lib/api";
import { PublicConfig, Scene } from "@/lib/types";
import { useFx } from "@/lib/FxProvider";

import { MusicPlayer } from "@/components/MusicPlayer";

import { LockScreen } from "@/components/scenes/LockScreen";
import { WelcomeScene } from "@/components/scenes/WelcomeScene";
import { CountdownScene } from "@/components/scenes/CountdownScene";
import { BirthdayScene } from "@/components/scenes/BirthdayScene";
import { MemoriesScene } from "@/components/scenes/MemoriesScene";
import { GalleryScene } from "@/components/scenes/GalleryScene";
import { CakeScene } from "@/components/scenes/CakeScene";
import { GiftScene } from "@/components/scenes/GiftScene";
import { MessageScene } from "@/components/scenes/MessageScene";
import { SpecialScene } from "@/components/scenes/SpecialScene";
import { FinaleScene } from "@/components/scenes/FinaleScene";

/* -------------------------------------------------------
   SCENE ORDER
------------------------------------------------------- */

const SCENE_ORDER: Scene[] = [
  "lock",
  "welcome",
  "countdown",
  "birthday",
  "memories",
  "gallery",
  "cake",
  "gift",
  "message",
  "special",
  "finale",
];

/* -------------------------------------------------------
   ANIMATION
------------------------------------------------------- */

const sceneVariants = {
  initial: {
    opacity: 0,
    scale: 1.035,
    filter: "blur(18px)",
  },

  animate: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: {
    opacity: 0,
    scale: 0.975,
    filter: "blur(14px)",
    transition: {
      duration: 0.85,
      ease: [0.4, 0, 1, 1],
    },
  },
};

/* -------------------------------------------------------
   JOURNEY PROGRESS
------------------------------------------------------- */

function JourneyProgress({
  scene,
}: {
  scene: Scene;
}) {
  const index = SCENE_ORDER.indexOf(scene);

  if (index < 0) {
    return null;
  }

  return (
    <div
      className="
        pointer-events-none
        fixed
        left-1/2
        z-40
        flex
        -translate-x-1/2
        gap-1.5
      "
      style={{
        bottom:
          "calc(14px + env(safe-area-inset-bottom, 0px))",
      }}
      aria-hidden="true"
    >
      {SCENE_ORDER.map((item, i) => (
        <motion.div
          key={item}
          className="h-1.5 rounded-full"
          animate={{
            width: i === index ? 22 : 6,
            opacity: i <= index ? 1 : 0.28,
            background:
              i <= index
                ? "linear-gradient(90deg,#ff7fa9,#f4c97a)"
                : "rgba(255,255,255,0.4)",
          }}
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

/* -------------------------------------------------------
   MAIN EXPERIENCE
------------------------------------------------------- */

export function Experience() {
  const [config, setConfig] =
    useState<PublicConfig | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  const [scene, setScene] =
    useState<Scene>("lock");

  const fx = useFx();

  /* -----------------------------------------------------
     LOAD CONFIG
  ----------------------------------------------------- */

  useEffect(() => {
    let mounted = true;

    publicApi
      .getConfig()
      .then((data) => {
        if (!mounted) {
          return;
        }

        console.log(
          "Birthday config loaded:",
          data
        );

        setConfig(data);
      })
      .catch((e) => {
        console.error(
          "Failed to load birthday config:",
          e
        );

        if (!mounted) {
          return;
        }

        setError(
          e instanceof Error
            ? e.message
            : "Couldn't load this surprise"
        );
      });

    return () => {
      mounted = false;
    };
  }, []);

  /* -----------------------------------------------------
     FX STAR LEVEL
  ----------------------------------------------------- */

  useEffect(() => {
    if (!fx) {
      return;
    }

    fx.starLevel =
      scene === "lock" ||
      scene === "welcome"
        ? 0.35
        : 0.55;
  }, [scene, fx]);

  /* -----------------------------------------------------
     LOADING
  ----------------------------------------------------- */

  if (!config && !error) {
    return (
      <main
        className="
          fixed
          inset-0
          z-10
          flex
          min-h-screen
          flex-col
          items-center
          justify-center
          gap-5
          bg-[#090711]
          px-6
          text-center
          text-white
        "
      >
        <motion.div
          className="
            h-14
            w-14
            rounded-full
            border-2
            border-white/10
            border-t-[#f4c97a]
          "
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 1.1,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.p
          className="text-xl text-white/80"
          animate={{
            opacity: [0.35, 1, 0.35],
          }}
          transition={{
            duration: 1.6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          Loading something special...
        </motion.p>
      </main>
    );
  }

  /* -----------------------------------------------------
     ERROR
  ----------------------------------------------------- */

  if (error || !config) {
    return (
      <main
        className="
          fixed
          inset-0
          z-10
          flex
          min-h-screen
          items-center
          justify-center
          bg-[#090711]
          px-6
          text-center
          text-white
        "
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.8,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="max-w-md"
        >
          <div className="mb-4 text-5xl">
            💫
          </div>

          <h1 className="text-2xl font-semibold">
            This surprise isn't ready yet.
          </h1>

          <p className="mt-3 text-sm text-white/55">
            Please check back soon.
          </p>

          {error && (
            <p
              className="
                mt-4
                break-words
                text-xs
                text-pink-300/70
              "
            >
              {error}
            </p>
          )}
        </motion.div>
      </main>
    );
  }

  /* -----------------------------------------------------
     SAFE MEDIA DATA
  ----------------------------------------------------- */

  const mediaItems = Array.isArray(
    config.media_items
  )
    ? config.media_items
    : [];

  const galleryItems =
    mediaItems.filter(
      (item) =>
        item.include_in_gallery
    );

  const finaleItems =
    mediaItems.filter(
      (item) =>
        item.include_in_finale
    );

  const specialItem =
    mediaItems.find(
      (item) =>
        item.id ===
        config.special_media_id
    ) ?? mediaItems[0];

  /* -----------------------------------------------------
     MUSIC URL
  ----------------------------------------------------- */

  const musicUrl =
    typeof config.music_url === "string"
      ? config.music_url.trim()
      : "";

  /* -----------------------------------------------------
     RENDER
  ----------------------------------------------------- */

  return (
    <main
      className="
        fixed
        inset-0
        min-h-screen
        overflow-hidden
        bg-[#090711]
        text-white
      "
    >
      {/* =================================================
          MUSIC PLAYER
      ================================================= */}

      {scene !== "lock" && (
        <MusicPlayer
          visible={true}
          youtubeUrl={musicUrl}
        />
      )}

      {/* =================================================
          PROGRESS
      ================================================= */}

      {scene !== "lock" && (
        <JourneyProgress scene={scene} />
      )}

      {/* =================================================
          SCENES
      ================================================= */}

      <AnimatePresence mode="wait">

        {/* =================================================
            LOCK
        ================================================= */}

        {scene === "lock" && (
          <motion.div
            key="lock"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LockScreen
              intro={config.intro_message}
              onUnlock={() => {
                console.log(
                  "Birthday surprise unlocked"
                );

                /*
                 * IMPORTANT:
                 *
                 * Yahan pehle:
                 * startMusic(config.music_url)
                 *
                 * call ho raha tha.
                 *
                 * Ab YouTube music MusicPlayer
                 * handle karega.
                 */

                setScene("welcome");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            WELCOME
        ================================================= */}

        {scene === "welcome" && (
          <motion.div
            key="welcome"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <WelcomeScene
              name={config.recipient_name}
            />

            <AutoAdvance
              delay={4600}
              onComplete={() => {
                setScene("countdown");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            COUNTDOWN
        ================================================= */}

        {scene === "countdown" && (
          <motion.div
            key="countdown"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CountdownScene
              date={config.birthday_date}
              time={config.birthday_time}
              timezone={config.timezone}
              balloons={config.balloons}
              onComplete={() => {
                setScene("birthday");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            BIRTHDAY
        ================================================= */}

        {scene === "birthday" && (
          <motion.div
            key="birthday"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <BirthdayScene
              message={
                config.birthday_message
              }
              onDone={() => {
                setScene("memories");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            MEMORIES
        ================================================= */}

        {scene === "memories" && (
          <motion.div
            key="memories"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {mediaItems.length > 0 ? (
              <MemoriesScene
                items={mediaItems}
                defaultDuration={
                  config.photo_duration_seconds
                }
                onDone={() => {
                  setScene("gallery");
                }}
              />
            ) : (
              <AutoAdvance
                delay={2500}
                onComplete={() => {
                  setScene("gallery");
                }}
              />
            )}
          </motion.div>
        )}

        {/* =================================================
            GALLERY
        ================================================= */}

        {scene === "gallery" && (
          <motion.div
            key="gallery"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {mediaItems.length > 0 ? (
              <GalleryScene
                items={
                  galleryItems.length > 0
                    ? galleryItems
                    : mediaItems
                }
                onNext={() => {
                  setScene("cake");
                }}
              />
            ) : (
              <AutoAdvance
                delay={2500}
                onComplete={() => {
                  setScene("cake");
                }}
              />
            )}
          </motion.div>
        )}

        {/* =================================================
            CAKE
        ================================================= */}

        {scene === "cake" && (
          <motion.div
            key="cake"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <CakeScene
              cakeMessage={
                config.cake_message
              }
              recipientName={
                config.recipient_name
              }
              onDone={() => {
                setScene("gift");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            GIFT
        ================================================= */}

        {scene === "gift" && (
          <motion.div
            key="gift"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <GiftScene
              message={
                config.gift_message
              }
              onDone={() => {
                setScene("message");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            MESSAGE
        ================================================= */}

        {scene === "message" && (
          <motion.div
            key="message"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <MessageScene
              text={config.final_message}
              onDone={() => {
                setScene("special");
              }}
            />
          </motion.div>
        )}

        {/* =================================================
            SPECIAL
        ================================================= */}

        {scene === "special" && (
          <motion.div
            key="special"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {specialItem ? (
              <SpecialScene
                item={specialItem}
                index={mediaItems.indexOf(
                  specialItem
                )}
                subtitle="Always keep smiling. ❤️"
                onDone={() => {
                  setScene("finale");
                }}
              />
            ) : (
              <AutoAdvance
                delay={2500}
                onComplete={() => {
                  setScene("finale");
                }}
              />
            )}
          </motion.div>
        )}

        {/* =================================================
            FINALE
        ================================================= */}

        {scene === "finale" && (
          <motion.div
            key="finale"
            className="fixed inset-0"
            variants={sceneVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FinaleScene
              items={
                finaleItems.length > 0
                  ? finaleItems
                  : mediaItems
              }
              subtitle={
                config.finale_subtitle
              }
            />
          </motion.div>
        )}

      </AnimatePresence>
    </main>
  );
}

/* -------------------------------------------------------
   AUTO ADVANCE
------------------------------------------------------- */

function AutoAdvance({
  delay,
  onComplete,
}: {
  delay: number;
  onComplete: () => void;
}) {
  useEffect(() => {
    const timer =
      window.setTimeout(
        onComplete,
        delay
      );

    return () => {
      window.clearTimeout(timer);
    };
  }, [delay, onComplete]);

  return null;
}