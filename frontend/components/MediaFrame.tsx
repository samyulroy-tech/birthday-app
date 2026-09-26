"use client";

import { MediaItem } from "@/lib/types";
import { resolveMediaUrl } from "@/lib/api";
import {
  useEffect,
  useRef,
  useState,
} from "react";

/*
 * Global currently active video.
 *
 * Isse ek time par sirf ek frame ka video
 * sound ke saath chalega.
 */
let activeVideo: HTMLVideoElement | null = null;

function activateVideo(video: HTMLVideoElement) {
  // Agar koi doosra video active hai,
  // usko mute + pause kar do.
  if (activeVideo && activeVideo !== video) {
    activeVideo.muted = true;
    activeVideo.pause();
  }

  activeVideo = video;

  video.muted = false;

  video.play().catch(() => {});
}

function deactivateVideo(video: HTMLVideoElement) {
  video.muted = true;

  if (activeVideo === video) {
    activeVideo = null;
  }
}

interface MediaVisualProps {
  item: MediaItem | Partial<MediaItem>;
  index: number;
  className?: string;
  autoPlayVideo?: boolean;
  muted?: boolean;
}

export function MediaVisual({
  item,
  index,
  className = "",
  autoPlayVideo = true,
  muted: initialMuted = true,
}: MediaVisualProps) {
  const videoRef =
    useRef<HTMLVideoElement>(null);

  const [isMuted, setIsMuted] =
    useState(true);

  const [isPlaying, setIsPlaying] =
    useState(false);

  /*
   * New media aaye to video reset.
   */
  useEffect(() => {
    setIsMuted(true);
    setIsPlaying(false);

    const video = videoRef.current;

    if (video) {
      video.muted = true;
      video.pause();

      if (activeVideo === video) {
        activeVideo = null;
      }
    }

    return () => {
      if (videoRef.current) {
        const video = videoRef.current;

        video.muted = true;
        video.pause();

        if (activeVideo === video) {
          activeVideo = null;
        }
      }
    };
  }, [item.url]);

  /*
   * IMPORTANT:
   *
   * Autoplay sirf MUTED hoga.
   * Sound user touch/click ke baad hi ON hoga.
   */
  useEffect(() => {
    const video = videoRef.current;

    if (
      item.media_type !== "video" ||
      !video ||
      !autoPlayVideo
    ) {
      return;
    }

    video.muted = true;

    const startMuted = async () => {
      try {
        await video.play();
        setIsPlaying(true);
      } catch {
        setIsPlaying(false);
      }
    };

    startMuted();
  }, [
    item.media_type,
    item.url,
    autoPlayVideo,
  ]);

  /*
   * Frame touch/click
   *
   * Sirf isi frame ka audio ON hoga.
   */
  const activateSound = async () => {
    const video = videoRef.current;

    if (!video) {
      return;
    }

    activateVideo(video);

    setIsMuted(false);
    setIsPlaying(true);
  };

  /*
   * Mute / Unmute button
   */
  const toggleMute = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();

    const video = videoRef.current;

    if (!video) {
      return;
    }

    /*
     * Currently muted hai
     * → sound ON
     */
    if (isMuted) {
      activateVideo(video);

      setIsMuted(false);
      setIsPlaying(true);

      return;
    }

    /*
     * Currently sound ON hai
     * → mute
     */
    deactivateVideo(video);

    setIsMuted(true);
    setIsPlaying(false);
  };

  /*
   * Empty media
   */
  if (!item.url) {
    const hue =
      (330 + index * 47) % 360;

    return (
      <div
        className={`grid place-items-center ${className}`}
        style={{
          background: `linear-gradient(
            135deg,
            hsl(${hue} 70% 55%),
            hsl(${(hue + 50) % 360} 60% 30%)
          )`,
        }}
      >
        <b className="text-5xl text-white/40">
          ♥
        </b>
      </div>
    );
  }

  /*
   * VIDEO
   */
  if (item.media_type === "video") {
    return (
      <div
        className="
          relative
          h-full
          w-full
          overflow-hidden
          cursor-pointer
        "
        onClick={activateSound}
        onTouchStart={activateSound}
      >
        <video
          ref={videoRef}
          src={resolveMediaUrl(item.url)}
          className="
            block
            h-full
            w-full
            object-cover
          "
          autoPlay={autoPlayVideo}
          muted={true}
          loop
          playsInline
          preload="metadata"
          controls={false}
          onPlay={() => {
            setIsPlaying(true);
          }}
          onPause={() => {
            setIsPlaying(false);
          }}
        />

        {/* 
          MUTE / UNMUTE
        */}
        <button
          type="button"
          onClick={toggleMute}
          aria-label={
            isMuted
              ? "Unmute video"
              : "Mute video"
          }
          title={
            isMuted
              ? "Unmute video"
              : "Mute video"
          }
          className="
            absolute
            bottom-3
            right-3
            z-30
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-full
            border
            border-white/30
            bg-black/65
            text-white
            shadow-xl
            backdrop-blur-md
            transition-all
            duration-200
            hover:scale-110
            hover:bg-black/80
            active:scale-95
          "
        >
          {isMuted ? (
            /*
             * MUTED ICON
             */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5 6 9H2v6h4l5 4V5Z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m23 9-6 6"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m17 9 6 6"
              />
            </svg>
          ) : (
            /*
             * SOUND ON ICON
             */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11 5 6 9H2v6h4l5 4V5Z"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.07 4.93a10 10 0 0 1 0 14.14"
              />

              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.54 8.46a5 5 0 0 1 0 7.07"
              />
            </svg>
          )}
        </button>

        {/* 
          Optional hint.
          Sirf muted state mein.
        */}
        {isMuted && (
          <div
            className="
              pointer-events-none
              absolute
              bottom-3
              left-3
              z-20
              rounded-full
              bg-black/50
              px-3
              py-1.5
              text-[10px]
              font-medium
              uppercase
              tracking-wider
              text-white/90
              backdrop-blur-sm
            "
          >
            Tap for sound
          </div>
        )}

        {/* Playing indicator */}
        {!isMuted && isPlaying && (
          <div
            className="
              pointer-events-none
              absolute
              left-3
              top-3
              z-20
              flex
              items-center
              gap-1.5
              rounded-full
              bg-black/50
              px-2.5
              py-1
              text-[9px]
              font-medium
              uppercase
              tracking-wider
              text-white/90
              backdrop-blur-sm
            "
          >
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            Sound on
          </div>
        )}
      </div>
    );
  }

  /*
   * PHOTO
   */

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={resolveMediaUrl(
        item.thumbnail_url || item.url
      )}
      alt={item.title || ""}
      className={className}
    />
  );
}

/*
 * ============================================================
 * MEMORY FRAME
 * ============================================================
 */

export function MemoryFrame({
  item,
  index,
}: {
  item: MediaItem | Partial<MediaItem>;
  index: number;
}) {
  return (
    <div
      className="
        relative
        w-[min(78vw,380px)]
        rounded-md
        bg-[#fbf3ea]
        p-3.5
        pb-0
        text-[#2a1633]
        shadow-frame
      "
    >
      <div
        className="
          pointer-events-none
          absolute
          inset-0
          rounded-md
          bg-gradient-to-br
          from-transparent
          via-white/30
          to-transparent
        "
      />

      <div
        className="
          aspect-square
          overflow-hidden
          rounded-sm
          bg-[#222]
        "
      >
        <MediaVisual
          item={item}
          index={index}
          className="
            h-full
            w-full
            object-cover
            block
          "
          autoPlayVideo={true}
          muted={true}
        />
      </div>

      <div
        className="
          min-h-[96px]
          px-1
          py-3.5
          pb-4
        "
      >
        <h3 className="serif m-0 text-2xl font-medium">
          {item.title}
        </h3>

        <p className="mt-1 text-sm opacity-85">
          {item.caption}
        </p>

        <small className="opacity-55">
          {item.date_label}
        </small>
      </div>
    </div>
  );
}