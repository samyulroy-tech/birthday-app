"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/lib/audio";
import { useFx } from "@/lib/FxProvider";
import { elementCenter } from "@/lib/particles";

interface BalloonInstance {
  el: HTMLDivElement;
  size: number;
  x: number;
  y: number;
  vy: number;
  phase: number;
  hue: number;
}

interface BalloonFieldProps {
  active: boolean;
  onPop: (message: string) => void;
}

const HUES = [340, 320, 280, 45, 355, 300];

const PARTICLE_COLORS = [
  "#ffffff",
  "#fff3ea",
  "#f4c97a",
  "#ff7fa9",
  "#b48cf0",
];

const pick = <T,>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

/* =========================================================
   DOM POP EFFECT
   ========================================================= */

function createVisualBurst(
  x: number,
  y: number,
  hue: number
) {
  const layer = document.createElement("div");

  Object.assign(layer.style, {
    position: "fixed",
    left: "0",
    top: "0",
    width: "100vw",
    height: "100vh",
    pointerEvents: "none",
    zIndex: "999999",
    overflow: "visible",
  });

  document.body.appendChild(layer);

  /*
   * ========================================================
   * FLASH
   * ========================================================
   */

  const flash = document.createElement("div");

  Object.assign(flash.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: "42px",
    height: "42px",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    background: "#ffffff",
    boxShadow: `
      0 0 15px #ffffff,
      0 0 35px #ffffff,
      0 0 70px hsl(${hue}, 100%, 75%),
      0 0 120px hsl(${hue}, 100%, 65%)
    `,
    pointerEvents: "none",
  });

  layer.appendChild(flash);

  flash.animate(
    [
      {
        transform:
          "translate(-50%, -50%) scale(0.15)",
        opacity: 1,
      },
      {
        transform:
          "translate(-50%, -50%) scale(2.2)",
        opacity: 1,
      },
      {
        transform:
          "translate(-50%, -50%) scale(0)",
        opacity: 0,
      },
    ],
    {
      duration: 350,
      easing: "cubic-bezier(0.15, 0.8, 0.25, 1)",
      fill: "forwards",
    }
  );

  /*
   * ========================================================
   * SHOCKWAVE
   * ========================================================
   */

  const ring = document.createElement("div");

  Object.assign(ring.style, {
    position: "fixed",
    left: `${x}px`,
    top: `${y}px`,
    width: "24px",
    height: "24px",
    transform: "translate(-50%, -50%)",
    borderRadius: "50%",
    border: "3px solid #ffffff",
    boxShadow: `
      0 0 15px #ffffff,
      0 0 35px hsl(${hue}, 100%, 70%)
    `,
    pointerEvents: "none",
  });

  layer.appendChild(ring);

  ring.animate(
    [
      {
        transform:
          "translate(-50%, -50%) scale(0.2)",
        opacity: 1,
      },
      {
        transform:
          "translate(-50%, -50%) scale(5)",
        opacity: 0.7,
      },
      {
        transform:
          "translate(-50%, -50%) scale(10)",
        opacity: 0,
      },
    ],
    {
      duration: 800,
      easing: "cubic-bezier(0.1, 0.7, 0.2, 1)",
      fill: "forwards",
    }
  );

  /*
   * ========================================================
   * PARTICLES
   * ========================================================
   */

  const colors = [
    "#ffffff",
    "#fff3ea",
    "#f4c97a",
    "#ff7fa9",
    "#b48cf0",
    `hsl(${hue}, 95%, 72%)`,
  ];

  for (let i = 0; i < 55; i++) {
    const particle = document.createElement("div");

    const angle =
      (Math.PI * 2 * i) / 55 +
      (Math.random() - 0.5) * 0.35;

    const distance =
      70 + Math.random() * 170;

    const size =
      3 + Math.random() * 5;

    const color =
      colors[
        Math.floor(
          Math.random() * colors.length
        )
      ];

    Object.assign(particle.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius:
        Math.random() > 0.25
          ? "50%"
          : "2px",
      background: color,
      boxShadow: `
        0 0 6px ${color},
        0 0 14px ${color}
      `,
      transform:
        "translate(-50%, -50%) scale(1)",
      pointerEvents: "none",
    });

    layer.appendChild(particle);

    const dx =
      Math.cos(angle) * distance;

    const dy =
      Math.sin(angle) * distance;

    particle.animate(
      [
        {
          transform:
            "translate(-50%, -50%) scale(1.2)",
          opacity: 1,
        },
        {
          transform:
            `translate(
              calc(-50% + ${dx * 0.45}px),
              calc(-50% + ${dy * 0.45}px)
            ) scale(1)`,
          opacity: 1,
        },
        {
          transform:
            `translate(
              calc(-50% + ${dx}px),
              calc(-50% + ${dy}px)
            ) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration:
          650 + Math.random() * 350,
        easing:
          "cubic-bezier(0.12, 0.75, 0.22, 1)",
        fill: "forwards",
      }
    );
  }

  /*
   * ========================================================
   * WHITE SPARKS
   * ========================================================
   */

  for (let i = 0; i < 20; i++) {
    const spark = document.createElement("div");

    const angle =
      Math.random() * Math.PI * 2;

    const distance =
      40 + Math.random() * 100;

    Object.assign(spark.style, {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: "4px",
      height: "4px",
      borderRadius: "50%",
      background: "#ffffff",
      boxShadow:
        "0 0 8px #ffffff, 0 0 20px #ffffff",
      pointerEvents: "none",
      transform:
        "translate(-50%, -50%)",
    });

    layer.appendChild(spark);

    spark.animate(
      [
        {
          transform:
            "translate(-50%, -50%) scale(1.5)",
          opacity: 1,
        },
        {
          transform:
            `translate(
              calc(-50% + ${Math.cos(angle) * distance}px),
              calc(-50% + ${Math.sin(angle) * distance}px)
            ) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration:
          250 + Math.random() * 200,
        easing: "ease-out",
        fill: "forwards",
      }
    );
  }

  /*
   * ========================================================
   * CLEANUP
   * ========================================================
   */

  window.setTimeout(() => {
    layer.remove();
  }, 1300);
}

/* =========================================================
   BALLOON FIELD
   ========================================================= */

export function BalloonField({
  active,
  onPop,
}: BalloonFieldProps) {
  const wrapRef =
    useRef<HTMLDivElement | null>(null);

  const balloonsRef =
    useRef<Set<BalloonInstance>>(
      new Set()
    );

  const rafRef =
    useRef<number | null>(null);

  const spawnTimersRef =
    useRef<number[]>([]);

  const fx = useFx();

  const activeRef =
    useRef(active);

  activeRef.current = active;

  const onPopRef =
    useRef(onPop);

  onPopRef.current = onPop;

  useEffect(() => {
    const container = wrapRef.current;

    if (!container) {
      console.warn(
        "[BalloonField] Container not found"
      );
      return;
    }

    console.log(
      "[BalloonField] FX instance:",
      fx
    );

    /* =====================================================
       SPAWN
    ===================================================== */

    const spawn = (
      initial = false
    ) => {
      if (!activeRef.current) {
        return;
      }

      const size =
        62 + Math.random() * 34;

      const hue = pick(HUES);

      const balloon =
        document.createElement("div");

      Object.assign(balloon.style, {
        position: "absolute",
        left: "0",
        top: "0",
        width: `${size}px`,
        height: `${size * 1.22}px`,
        display: "block",
        visibility: "visible",
        opacity: "1",
        borderRadius:
          "50% 50% 48% 48% / 55% 55% 45% 45%",
        cursor: "pointer",
        pointerEvents: "auto",
        touchAction: "manipulation",
        background: `
          radial-gradient(
            circle at 32% 28%,
            rgba(255,255,255,0.75) 0 8%,
            transparent 22%
          ),
          radial-gradient(
            circle at 50% 60%,
            hsl(${hue} 85% 68%),
            hsl(${hue} 70% 42%)
          )
        `,
        boxShadow: `
          0 0 30px hsla(${hue},90%,60%,0.55),
          inset -8px -12px 18px rgba(0,0,0,0.25)
        `,
        zIndex: "10000",
      });

      /* Knot */

      const knot =
        document.createElement("div");

      Object.assign(knot.style, {
        position: "absolute",
        left: "50%",
        top: "100%",
        width: "10px",
        height: "9px",
        marginLeft: "-5px",
        background:
          `hsl(${hue} 70% 40%)`,
        clipPath:
          "polygon(50% 0,100% 100%,0 100%)",
      });

      /* String */

      const string =
        document.createElement("div");

      Object.assign(string.style, {
        position: "absolute",
        left: "50%",
        top: "calc(100% + 8px)",
        width: "1px",
        height: "70px",
        background:
          "rgba(255,255,255,0.3)",
      });

      balloon.appendChild(knot);
      balloon.appendChild(string);

      balloon.setAttribute(
        "role",
        "button"
      );

      balloon.setAttribute(
        "aria-label",
        "Pop balloon"
      );

      const maxX =
        Math.max(
          0,
          window.innerWidth - size
        );

      const obj: BalloonInstance = {
        el: balloon,
        size,
        x:
          Math.random() *
          maxX,
        y: initial
          ? window.innerHeight *
            (0.3 + Math.random() * 0.6)
          : window.innerHeight + 40,
        vy:
          0.35 +
          Math.random() * 0.5,
        phase:
          Math.random() *
          Math.PI *
          2,
        hue,
      };

      /* ===================================================
         POP
      =================================================== */

      balloon.addEventListener(
        "pointerdown",
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          if (
            !balloonsRef.current.has(obj)
          ) {
            return;
          }

          console.log(
            "[BalloonField] 💥 BALLOON POP",
            {
              x: obj.x,
              y: obj.y,
              hue,
            }
          );

          balloonsRef.current.delete(obj);

          /*
           * Get center BEFORE removing balloon.
           */
          const [x, y] =
            elementCenter(balloon);

          /*
           * Remove balloon.
           */
          balloon.remove();

          /*
           * Sound.
           */
          sfx.pop();

          /*
           * GUARANTEED DOM EXPLOSION.
           */
          createVisualBurst(
            x,
            y,
            hue
          );

          /*
           * Canvas particle system.
           */
          if (fx) {
            console.log(
              "[BalloonField] ✨ Canvas FX popBurst"
            );

            fx.popBurst(
              x,
              y,
              [
                `hsl(${hue} 90% 70%)`,
                "#fff3ea",
                "#f4c97a",
                "#ffffff",
              ]
            );

            fx.confetti(25);
          } else {
            console.warn(
              "[BalloonField] ⚠️ ParticleField is null"
            );
          }

          /*
           * Countdown message / pop counter.
           */
          onPopRef.current("");

          /*
           * Respawn.
           */
          const timer =
            window.setTimeout(() => {
              if (activeRef.current) {
                spawn(false);
              }
            }, 1000);

          spawnTimersRef.current.push(
            timer
          );
        },
        {
          passive: false,
        }
      );

      container.appendChild(balloon);

      balloonsRef.current.add(obj);

      console.log(
        "[BalloonField] Balloon spawned",
        {
          x: obj.x,
          y: obj.y,
          size,
          hue,
        }
      );
    };

    /* =====================================================
       ANIMATION LOOP
    ===================================================== */

    const tick = (
      time: number
    ) => {
      if (!activeRef.current) {
        balloonsRef.current.forEach(
          (balloon) => {
            balloon.el.remove();
          }
        );

        balloonsRef.current.clear();

        rafRef.current = null;

        return;
      }

      balloonsRef.current.forEach(
        (balloon) => {
          balloon.y -= balloon.vy;

          const sway =
            Math.sin(
              time * 0.001 +
                balloon.phase
            );

          balloon.el.style.transform =
            `translate3d(
              ${balloon.x + sway * 16}px,
              ${balloon.y}px,
              0
            )
            rotate(${sway * 7}deg)`;

          if (
            balloon.y <
            -balloon.size * 2
          ) {
            balloon.y =
              window.innerHeight + 40;

            balloon.x =
              Math.random() *
              Math.max(
                0,
                window.innerWidth -
                  balloon.size
              );
          }
        }
      );

      rafRef.current =
        requestAnimationFrame(tick);
    };

    /* =====================================================
       INITIAL BALLOONS
    ===================================================== */

    if (active) {
      for (
        let i = 0;
        i < 9;
        i++
      ) {
        const timer =
          window.setTimeout(
            () => {
              spawn(true);
            },
            i * 350
          );

        spawnTimersRef.current.push(
          timer
        );
      }

      rafRef.current =
        requestAnimationFrame(tick);
    }

    /* =====================================================
       CLEANUP
    ===================================================== */

    return () => {
      if (
        rafRef.current !== null
      ) {
        cancelAnimationFrame(
          rafRef.current
        );

        rafRef.current = null;
      }

      spawnTimersRef.current.forEach(
        (timer) => {
          window.clearTimeout(timer);
        }
      );

      spawnTimersRef.current = [];

      balloonsRef.current.forEach(
        (balloon) => {
          balloon.el.remove();
        }
      );

      balloonsRef.current.clear();
    };
  }, [active, fx]);

  return (
    <div
      ref={wrapRef}
      aria-hidden={!active}
      className="
        pointer-events-none
        fixed
        inset-0
        z-[9999]
        overflow-visible
      "
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}