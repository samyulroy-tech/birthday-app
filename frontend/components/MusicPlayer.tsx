"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

interface MusicPlayerProps {
  visible: boolean;
  youtubeUrl?: string | null;

  // Har unlock/click par value change karo
  // taaki music ko play karne ka fresh request mile.
  playRequest?: number;
}

interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  mute: () => void;
  unMute: () => void;
  setVolume: (volume: number) => void;
  destroy: () => void;
}

interface YouTubePlayerOptions {
  height: string;
  width: string;
  videoId: string;
  playerVars?: {
    autoplay?: number;
    controls?: number;
    disablekb?: number;
    fs?: number;
    playsinline?: number;
    rel?: number;
    modestbranding?: number;
  };
  events?: {
    onReady?: () => void;
    onStateChange?: (event: { data: number }) => void;
  };
}

interface YouTubePlayerConstructor {
  new (
    element: HTMLElement,
    options: YouTubePlayerOptions
  ): YouTubePlayer;
}

interface YouTubeWindow extends Window {
  YT?: {
    Player: YouTubePlayerConstructor;
    PlayerState: {
      PLAYING: number;
      PAUSED: number;
      ENDED: number;
    };
  };

  onYouTubeIframeAPIReady?: () => void;
}

/* ----------------------------------------
   Extract YouTube Video ID
---------------------------------------- */

function extractYouTubeId(url: string): string | null {
  if (!url?.trim()) return null;

  try {
    const parsed = new URL(url.trim());
    const hostname = parsed.hostname.toLowerCase();

    // youtube.com/watch?v=...
    if (
      hostname === "youtube.com" ||
      hostname === "www.youtube.com" ||
      hostname === "m.youtube.com"
    ) {
      const watchId = parsed.searchParams.get("v");

      if (watchId) {
        return watchId;
      }

      // /embed/VIDEO_ID
      if (parsed.pathname.startsWith("/embed/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id || null;
      }

      // /shorts/VIDEO_ID
      if (parsed.pathname.startsWith("/shorts/")) {
        const id = parsed.pathname.split("/").filter(Boolean)[1];
        return id || null;
      }
    }

    // youtu.be/VIDEO_ID
    if (hostname === "youtu.be") {
      const id = parsed.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    return null;
  } catch {
    return null;
  }
}

/* ----------------------------------------
   Load YouTube IFrame API
---------------------------------------- */

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === "undefined") {
    return Promise.resolve();
  }

  const win = window as YouTubeWindow;

  if (win.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise<void>((resolve) => {
    const existingScript = document.getElementById(
      "youtube-iframe-api"
    );

    if (existingScript) {
      const checkReady = () => {
        if ((window as YouTubeWindow).YT?.Player) {
          resolve();
        } else {
          window.setTimeout(checkReady, 50);
        }
      };

      checkReady();
      return;
    }

    const previousCallback = win.onYouTubeIframeAPIReady;

    win.onYouTubeIframeAPIReady = () => {
      previousCallback?.();
      resolve();
    };

    const script = document.createElement("script");

    script.id = "youtube-iframe-api";
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    document.head.appendChild(script);
  });

  return youtubeApiPromise;
}

/* ----------------------------------------
   Component
---------------------------------------- */

export function MusicPlayer({
  visible,
  youtubeUrl,
  playRequest = 0,
}: MusicPlayerProps) {
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [vol, setVol] = useState(60);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const videoId = extractYouTubeId(youtubeUrl || "");

  /* ----------------------------------------
     Create Player
  ---------------------------------------- */

  useEffect(() => {
    if (!videoId) {
      setReady(false);
      setPlaying(false);

      if (youtubeUrl?.trim()) {
        setError("Invalid YouTube URL");
      } else {
        setError(null);
      }

      return;
    }

    const currentVideoId = videoId;
    let cancelled = false;

    async function initPlayer() {
      try {
        setError(null);
        setReady(false);
        setPlaying(false);

        await loadYouTubeAPI();

        if (cancelled) return;

        const win = window as YouTubeWindow;

        if (!win.YT?.Player) {
          setError("YouTube player load nahi hua.");
          return;
        }

        const container = playerContainerRef.current;

        if (!container) {
          setError("Music player container nahi mila.");
          return;
        }

        // Existing player destroy
        if (playerRef.current) {
          try {
            playerRef.current.destroy();
          } catch {}

          playerRef.current = null;
        }

        container.innerHTML = "";

        const playerElement = document.createElement("div");

        container.appendChild(playerElement);

        const player = new win.YT.Player(playerElement, {
          height: "1",
          width: "1",

          videoId: currentVideoId,

          playerVars: {
            // Player ko load hote hi play karne ki permission
            autoplay: 1,

            controls: 0,
            disablekb: 1,
            fs: 0,
            playsinline: 1,
            rel: 0,
            modestbranding: 1,
          },

          events: {
            onReady: () => {
              if (cancelled) return;

              player.setVolume(vol);

              setReady(true);
              setMuted(false);

              /*
               * Agar unlock ke baad request aa chuki hai,
               * to music play karne ki koshish karo.
               */
              if (playRequest > 0) {
                try {
                  player.unMute();
                  player.setVolume(vol > 0 ? vol : 60);
                  player.playVideo();

                  setPlaying(true);
                } catch (err) {
                  console.warn(
                    "[MusicPlayer] Autoplay blocked:",
                    err
                  );

                  setPlaying(false);
                }
              }
            },

            onStateChange: (event) => {
              if (cancelled) return;

              const state = event.data;

              if (
                state === win.YT!.PlayerState.PLAYING
              ) {
                setPlaying(true);
              }

              if (
                state === win.YT!.PlayerState.PAUSED
              ) {
                setPlaying(false);
              }

              if (
                state === win.YT!.PlayerState.ENDED
              ) {
                setPlaying(false);
              }
            },
          },
        });

        playerRef.current = player;
      } catch (err) {
        console.error(
          "[MusicPlayer] YouTube error:",
          err
        );

        setReady(false);
        setPlaying(false);
        setError(
          "YouTube music load nahi ho saki."
        );
      }
    }

    initPlayer();

    return () => {
      cancelled = true;

      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch {}

        playerRef.current = null;
      }

      setReady(false);
      setPlaying(false);
    };
  }, [videoId]);

  /* ----------------------------------------
     Play when unlock request changes
  ---------------------------------------- */

  useEffect(() => {
    if (!playRequest) return;

    const player = playerRef.current;

    if (!player || !ready) {
      return;
    }

    try {
      player.unMute();
      player.setVolume(vol > 0 ? vol : 60);
      player.playVideo();

      setPlaying(true);
      setMuted(false);

      console.log(
        "[MusicPlayer] Music play requested"
      );
    } catch (err) {
      console.warn(
        "[MusicPlayer] Play request blocked:",
        err
      );
    }
  }, [playRequest, ready]);

  /* ----------------------------------------
     Play / Pause
  ---------------------------------------- */

  const handlePlayPause = () => {
    const player = playerRef.current;

    if (!player || !ready) return;

    if (playing) {
      player.pauseVideo();
      setPlaying(false);
    } else {
      player.playVideo();
      setPlaying(true);
    }
  };

  /* ----------------------------------------
     Mute
  ---------------------------------------- */

  const handleMute = () => {
    const player = playerRef.current;

    if (!player || !ready) return;

    if (muted) {
      player.unMute();

      const nextVolume = vol > 0 ? vol : 60;

      player.setVolume(nextVolume);

      if (vol === 0) {
        setVol(60);
      }

      setMuted(false);
    } else {
      player.mute();
      setMuted(true);
    }
  };

  /* ----------------------------------------
     Volume
  ---------------------------------------- */

  const handleVolumeChange = (value: number) => {
    setVol(value);

    const player = playerRef.current;

    if (!player || !ready) return;

    player.setVolume(value);

    if (value === 0) {
      player.mute();
      setMuted(true);
    } else {
      player.unMute();
      setMuted(false);
    }
  };

  /* ----------------------------------------
     UI
  ---------------------------------------- */

  return (
    <>
      {/* YouTube player */}
      <div
        ref={playerContainerRef}
        aria-hidden="true"
        className="
          pointer-events-none
          fixed
          -left-[9999px]
          top-0
          h-px
          w-px
          overflow-hidden
          opacity-0
        "
      />

      {/* Controls */}
      {visible && videoId && (
        <motion.div
          initial={{
            opacity: 0,
            y: -12,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="
            fixed
            right-3
            top-3
            z-[100]
            flex
            items-center
            gap-1.5
            rounded-full
            border
            border-white/15
            bg-black/50
            px-3
            py-1.5
            text-white
            shadow-xl
            backdrop-blur-xl
          "
          style={{
            top:
              "calc(10px + env(safe-area-inset-top, 0px))",
            right: "10px",
          }}
        >
          <button
            type="button"
            aria-label={
              playing
                ? "Pause music"
                : "Play music"
            }
            disabled={!ready}
            onClick={handlePlayPause}
            className="
              grid
              min-h-9
              min-w-9
              place-items-center
              rounded-full
              text-lg
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {playing ? "Ⅱ" : "▶"}
          </button>

          <button
            type="button"
            aria-label={
              muted
                ? "Unmute music"
                : "Mute music"
            }
            disabled={!ready}
            onClick={handleMute}
            className="
              grid
              min-h-9
              min-w-9
              place-items-center
              rounded-full
              text-lg
              transition
              hover:bg-white/10
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            {muted || vol === 0
              ? "🔇"
              : "🔊"}
          </button>

          <input
            type="range"
            min="0"
            max="100"
            step="1"
            value={vol}
            disabled={!ready}
            aria-label="Music volume"
            onChange={(event) =>
              handleVolumeChange(
                Number(event.target.value)
              )
            }
            className="
              w-16
              accent-pink-400
              disabled:opacity-40
            "
          />

          {!ready && !error && (
            <span className="text-[10px] text-white/60">
              Loading…
            </span>
          )}

          {error && (
            <span className="max-w-[140px] text-[10px] text-red-300">
              {error}
            </span>
          )}
        </motion.div>
      )}
    </>
  );
}