// ============================================================
// Canvas Particle Engine
// Visible burst / sparkle / confetti / hearts / shockwave FX.
// ============================================================

export type ParticleKind =
  | "dot"
  | "heart"
  | "confetti"
  | "sparkle";

interface Particle {
  x: number;
  y: number;

  vx: number;
  vy: number;

  g: number;

  life: number;
  maxLife: number;

  size: number;

  color: string;

  kind: ParticleKind;

  rot: number;
  vrot: number;
}

interface Shockwave {
  x: number;
  y: number;

  life: number;
  maxLife: number;

  color: string;

  startSize: number;
  endSize: number;

  lineWidth: number;
}

interface Flash {
  x: number;
  y: number;

  life: number;
  maxLife: number;

  color: string;
  size: number;
}

const COLORS = [
  "#ff7fa9",
  "#f4c97a",
  "#fff3ea",
  "#b48cf0",
  "#ff9fc0",
  "#ffffff",
];

const pick = <T,>(arr: T[]): T => {
  return arr[
    Math.floor(Math.random() * arr.length)
  ];
};

export class ParticleField {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private particles: Particle[] = [];

  private shockwaves: Shockwave[] = [];

  private flashes: Flash[] = [];

  private stars: {
    x: number;
    y: number;
    z: number;
    f: number;
    p: number;
  }[] = [];

  private width = 0;

  private height = 0;

  private raf = 0;

  private destroyed = false;

  public starLevel = 0.35;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });

    if (!ctx) {
      throw new Error(
        "[ParticleField] Canvas 2D context unavailable"
      );
    }

    this.ctx = ctx;

    /*
     * Star field.
     */
    this.stars = Array.from(
      { length: 110 },
      () => ({
        x: Math.random(),
        y: Math.random(),
        z:
          Math.random() * 2 +
          0.6,
        f:
          Math.random() * 2 +
          0.5,
        p:
          Math.random() * 6,
      })
    );

    this.resize();

    this.loop =
      this.loop.bind(this);

    this.raf =
      requestAnimationFrame(
        this.loop
      );

    console.log(
      "[ParticleField] ✅ initialized",
      {
        width: this.width,
        height: this.height,
      }
    );
  }

  // ============================================================
  // RESIZE
  // ============================================================

  resize() {
    if (this.destroyed) {
      return;
    }

    const dpr = Math.min(
      window.devicePixelRatio || 1,
      2
    );

    this.width =
      window.innerWidth;

    this.height =
      window.innerHeight;

    this.canvas.width =
      Math.round(
        this.width * dpr
      );

    this.canvas.height =
      Math.round(
        this.height * dpr
      );

    this.canvas.style.width =
      `${this.width}px`;

    this.canvas.style.height =
      `${this.height}px`;

    /*
     * All drawing coordinates remain
     * in CSS pixels.
     */
    this.ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );
  }

  // ============================================================
  // DESTROY
  // ============================================================

  destroy() {
    this.destroyed = true;

    cancelAnimationFrame(
      this.raf
    );

    this.particles = [];

    this.shockwaves = [];

    this.flashes = [];

    this.ctx.setTransform(
      1,
      0,
      0,
      1,
      0,
      0
    );

    this.ctx.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );

    console.log(
      "[ParticleField] destroyed"
    );
  }

  // ============================================================
  // GENERIC BURST
  // ============================================================

  burst(
    x: number,
    y: number,
    n = 30,
    opts: Partial<{
      v: number;
      up: number;
      g: number;
      life: number;
      size: number;
      colors: string[];
      kind: ParticleKind;
    }> = {}
  ) {
    if (this.destroyed) {
      return;
    }

    const count =
      Math.max(1, n);

    const speedBase =
      opts.v ?? 4;

    const colors =
      opts.colors?.length
        ? opts.colors
        : COLORS;

    const kind =
      opts.kind ?? "dot";

    for (
      let i = 0;
      i < count;
      i++
    ) {
      const angle =
        Math.random() *
        Math.PI *
        2;

      const speed =
        speedBase *
        (
          0.45 +
          Math.random() * 0.9
        );

      this.particles.push({
        x,
        y,

        vx:
          Math.cos(angle) *
          speed,

        vy:
          Math.sin(angle) *
            speed -
          (opts.up ?? 0),

        g:
          opts.g ?? 0.06,

        life: 0,

        maxLife:
          (opts.life ?? 60) *
          (
            0.7 +
            Math.random() * 0.6
          ),

        size:
          opts.size ??
          (
            3 +
            Math.random() * 4
          ),

        color:
          pick(colors),

        kind,

        rot:
          Math.random() *
          Math.PI *
          2,

        vrot:
          (
            Math.random() -
            0.5
          ) * 0.3,
      });
    }
  }

  // ============================================================
  // BALLOON POP
  // ============================================================

  popBurst(
    x: number,
    y: number,
    colors: string[] = COLORS
  ) {
    if (this.destroyed) {
      console.warn(
        "[ParticleField] popBurst ignored: destroyed"
      );

      return;
    }

    const safeColors =
      colors.filter(
        (color) =>
          typeof color === "string" &&
          color.length > 0
      );

    const finalColors =
      safeColors.length
        ? safeColors
        : COLORS;

    console.log(
      "[ParticleField] 💥 popBurst CALLED",
      {
        x,
        y,
        colors: finalColors,
      }
    );

    // ----------------------------------------------------------
    // CENTRAL FLASH
    // ----------------------------------------------------------

    this.flashes.push({
      x,
      y,
      life: 0,
      maxLife: 20,
      color: "#ffffff",
      size: 42,
    });

    // ----------------------------------------------------------
    // FIRST SHOCKWAVE
    // ----------------------------------------------------------

    this.shockwaves.push({
      x,
      y,
      life: 0,
      maxLife: 34,
      color: pick(finalColors),
      startSize: 8,
      endSize: 155,
      lineWidth: 4,
    });

    // ----------------------------------------------------------
    // SECOND SHOCKWAVE
    // ----------------------------------------------------------

    this.shockwaves.push({
      x,
      y,
      life: 0,
      maxLife: 48,
      color: "#ffffff",
      startSize: 4,
      endSize: 105,
      lineWidth: 2,
    });

    // ----------------------------------------------------------
    // MAIN SPARKLE EXPLOSION
    // ----------------------------------------------------------

    this.burst(
      x,
      y,
      85,
      {
        v: 6.5,
        life: 68,
        size: 4.5,
        g: 0.045,
        colors: finalColors,
        kind: "sparkle",
      }
    );

    // ----------------------------------------------------------
    // SECONDARY DOT EXPLOSION
    // ----------------------------------------------------------

    this.burst(
      x,
      y,
      50,
      {
        v: 3.6,
        life: 92,
        size: 3,
        g: 0.035,
        colors: finalColors,
        kind: "dot",
      }
    );

    // ----------------------------------------------------------
    // WHITE CORE
    // ----------------------------------------------------------

    this.burst(
      x,
      y,
      20,
      {
        v: 2.4,
        life: 30,
        size: 7,
        g: 0,
        colors: [
          "#ffffff",
        ],
        kind: "sparkle",
      }
    );

    // ----------------------------------------------------------
    // FAST OUTER SPARKS
    // ----------------------------------------------------------

    this.burst(
      x,
      y,
      28,
      {
        v: 8,
        life: 38,
        size: 2.5,
        g: 0,
        colors: [
          "#ffffff",
          ...finalColors,
        ],
        kind: "dot",
      }
    );

    console.log(
      "[ParticleField] 💥 FX CREATED",
      {
        particles:
          this.particles.length,

        shockwaves:
          this.shockwaves.length,

        flashes:
          this.flashes.length,
      }
    );
  }

  // ============================================================
  // CONFETTI
  // ============================================================

  confetti(n = 110) {
    if (this.destroyed) {
      return;
    }

    for (
      let i = 0;
      i < n;
      i++
    ) {
      this.particles.push({
        x:
          Math.random() *
          this.width,

        y:
          -20 -
          Math.random() *
            200,

        vx:
          (
            Math.random() -
            0.5
          ) * 2,

        vy:
          2 +
          Math.random() * 3,

        g: 0.02,

        life: 0,

        maxLife: 320,

        size:
          6 +
          Math.random() * 5,

        color:
          pick(COLORS),

        kind: "confetti",

        rot:
          Math.random() *
          Math.PI *
          2,

        vrot:
          (
            Math.random() -
            0.5
          ) * 0.3,
      });
    }
  }

  // ============================================================
  // FIREWORK
  // ============================================================

  firework(
    x =
      Math.random() *
      this.width,

    y =
      Math.random() *
        this.height *
        0.55 +
      40
  ) {
    if (this.destroyed) {
      return;
    }

    this.burst(
      x,
      y,
      100,
      {
        v: 7,
        life: 85,
        size: 4,
        colors: [
          "#f4c97a",
          "#ff7fa9",
          "#fff3ea",
          "#ffffff",
        ],
        kind: "sparkle",
      }
    );

    this.shockwaves.push({
      x,
      y,
      life: 0,
      maxLife: 35,
      color: "#ffffff",
      startSize: 5,
      endSize: 120,
      lineWidth: 3,
    });
  }

  // ============================================================
  // HEARTS
  // ============================================================

  hearts(
    x: number,
    y: number,
    n = 10
  ) {
    if (this.destroyed) {
      return;
    }

    this.burst(
      x,
      y,
      n,
      {
        kind: "heart",
        v: 2.4,
        up: 2,
        g: -0.01,
        life: 90,
        size:
          5 +
          Math.random() * 6,
      }
    );
  }

  // ============================================================
  // DRAW SPARKLE
  // ============================================================

  private drawSparkle(
    p: Particle,
    alpha: number
  ) {
    const ctx = this.ctx;

    ctx.save();

    ctx.translate(
      p.x,
      p.y
    );

    ctx.rotate(
      p.rot
    );

    const pulse =
      0.75 +
      Math.sin(
        p.life * 0.45
      ) *
        0.25;

    const size =
      p.size *
      (0.7 + alpha) *
      pulse;

    ctx.globalAlpha =
      alpha;

    ctx.shadowBlur =
      22;

    ctx.shadowColor =
      p.color;

    ctx.fillStyle =
      p.color;

    /*
     * Four-point sparkle.
     */
    ctx.beginPath();

    ctx.moveTo(
      0,
      -size * 2.8
    );

    ctx.lineTo(
      size * 0.38,
      -size * 0.42
    );

    ctx.lineTo(
      size * 2.8,
      0
    );

    ctx.lineTo(
      size * 0.38,
      size * 0.42
    );

    ctx.lineTo(
      0,
      size * 2.8
    );

    ctx.lineTo(
      -size * 0.38,
      size * 0.42
    );

    ctx.lineTo(
      -size * 2.8,
      0
    );

    ctx.lineTo(
      -size * 0.38,
      -size * 0.42
    );

    ctx.closePath();

    ctx.fill();

    /*
     * Bright center.
     */
    ctx.shadowBlur = 8;

    ctx.beginPath();

    ctx.arc(
      0,
      0,
      Math.max(
        1.5,
        size * 0.3
      ),
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // DRAW PARTICLE
  // ============================================================

  private drawParticle(
    p: Particle
  ) {
    const ctx = this.ctx;

    const alpha =
      Math.max(
        1 -
          p.life /
            p.maxLife,
        0
      );

    ctx.globalAlpha =
      alpha;

    // ----------------------------------------------------------
    // SPARKLE
    // ----------------------------------------------------------

    if (
      p.kind ===
      "sparkle"
    ) {
      this.drawSparkle(
        p,
        alpha
      );

      return;
    }

    // ----------------------------------------------------------
    // CONFETTI
    // ----------------------------------------------------------

    if (
      p.kind ===
      "confetti"
    ) {
      ctx.save();

      ctx.translate(
        p.x,
        p.y
      );

      ctx.rotate(
        p.rot
      );

      ctx.fillStyle =
        p.color;

      ctx.shadowBlur = 5;

      ctx.shadowColor =
        p.color;

      const flip =
        Math.abs(
          Math.sin(
            p.rot * 2
          )
        );

      ctx.scale(
        1,
        Math.max(
          0.2,
          flip
        )
      );

      ctx.fillRect(
        -p.size / 2,
        -p.size / 3,
        p.size,
        p.size * 0.6
      );

      ctx.restore();

      return;
    }

    // ----------------------------------------------------------
    // HEART
    // ----------------------------------------------------------

    if (
      p.kind ===
      "heart"
    ) {
      ctx.save();

      ctx.globalAlpha =
        alpha;

      ctx.fillStyle =
        p.color;

      ctx.shadowBlur =
        10;

      ctx.shadowColor =
        p.color;

      ctx.font =
        `${p.size * 3}px serif`;

      ctx.fillText(
        "♥",
        p.x,
        p.y
      );

      ctx.restore();

      return;
    }

    // ----------------------------------------------------------
    // DOT
    // ----------------------------------------------------------

    ctx.save();

    ctx.globalAlpha =
      alpha;

    ctx.globalCompositeOperation =
      "lighter";

    ctx.fillStyle =
      p.color;

    ctx.shadowBlur =
      14;

    ctx.shadowColor =
      p.color;

    ctx.beginPath();

    ctx.arc(
      p.x,
      p.y,
      Math.max(
        1.5,
        p.size * alpha
      ),
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // DRAW FLASH
  // ============================================================

  private drawFlash(
    flash: Flash
  ) {
    const ctx = this.ctx;

    const progress =
      Math.min(
        flash.life /
          flash.maxLife,
        1
      );

    const alpha =
      Math.max(
        1 - progress,
        0
      );

    const size =
      flash.size *
      (
        1 +
        progress * 2
      );

    const gradient =
      ctx.createRadialGradient(
        flash.x,
        flash.y,
        0,
        flash.x,
        flash.y,
        size
      );

    gradient.addColorStop(
      0,
      `rgba(255,255,255,${alpha})`
    );

    gradient.addColorStop(
      0.2,
      `rgba(255,255,255,${alpha * 0.95})`
    );

    gradient.addColorStop(
      0.45,
      `rgba(255,220,235,${alpha * 0.7})`
    );

    gradient.addColorStop(
      0.75,
      `rgba(255,127,169,${alpha * 0.25})`
    );

    gradient.addColorStop(
      1,
      "rgba(255,255,255,0)"
    );

    ctx.save();

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation =
      "lighter";

    ctx.fillStyle =
      gradient;

    ctx.beginPath();

    ctx.arc(
      flash.x,
      flash.y,
      size,
      0,
      Math.PI * 2
    );

    ctx.fill();

    ctx.restore();
  }

  // ============================================================
  // DRAW SHOCKWAVE
  // ============================================================

  private drawShockwave(
    wave: Shockwave
  ) {
    const ctx = this.ctx;

    const progress =
      Math.min(
        wave.life /
          wave.maxLife,
        1
      );

    const alpha =
      Math.max(
        1 - progress,
        0
      );

    const size =
      wave.startSize +
      (
        wave.endSize -
        wave.startSize
      ) *
        progress;

    ctx.save();

    ctx.globalAlpha =
      alpha * 0.95;

    ctx.globalCompositeOperation =
      "lighter";

    ctx.strokeStyle =
      wave.color;

    ctx.lineWidth =
      Math.max(
        0.8,
        wave.lineWidth *
          (1 -
            progress * 0.45)
      );

    ctx.shadowBlur =
      20;

    ctx.shadowColor =
      wave.color;

    ctx.beginPath();

    ctx.arc(
      wave.x,
      wave.y,
      size,
      0,
      Math.PI * 2
    );

    ctx.stroke();

    ctx.restore();
  }

  // ============================================================
  // ANIMATION LOOP
  // ============================================================

  private loop(
    t: number
  ) {
    if (this.destroyed) {
      return;
    }

    const {
      ctx,
      width: W,
      height: H,
    } = this;

    /*
     * Clear using CSS-pixel dimensions.
     * The transform set in resize()
     * handles DPR scaling.
     */
    ctx.clearRect(
      0,
      0,
      W,
      H
    );

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation =
      "source-over";

    ctx.shadowBlur = 0;

    // ----------------------------------------------------------
    // BACKGROUND STARS
    // ----------------------------------------------------------

    for (
      const s of this.stars
    ) {
      ctx.globalAlpha =
        (
          0.25 +
          0.75 *
            Math.abs(
              Math.sin(
                t *
                  0.001 *
                  s.f +
                  s.p
              )
            )
        ) *
        this.starLevel;

      ctx.fillStyle =
        "#ffffff";

      ctx.fillRect(
        s.x * W,
        s.y * H,
        s.z,
        s.z
      );
    }

    // ----------------------------------------------------------
    // FLASH
    // ----------------------------------------------------------

    this.flashes =
      this.flashes.filter(
        (flash) => {
          if (
            flash.life >=
            flash.maxLife
          ) {
            return false;
          }

          this.drawFlash(
            flash
          );

          flash.life += 1;

          return true;
        }
      );

    // ----------------------------------------------------------
    // SHOCKWAVES
    // ----------------------------------------------------------

    this.shockwaves =
      this.shockwaves.filter(
        (wave) => {
          if (
            wave.life >=
            wave.maxLife
          ) {
            return false;
          }

          this.drawShockwave(
            wave
          );

          wave.life += 1;

          return true;
        }
      );

    // ----------------------------------------------------------
    // REMOVE DEAD PARTICLES
    // ----------------------------------------------------------

    this.particles =
      this.particles.filter(
        (particle) =>
          particle.life <
          particle.maxLife
      );

    // ----------------------------------------------------------
    // UPDATE + DRAW PARTICLES
    // ----------------------------------------------------------

    for (
      const particle of
        this.particles
    ) {
      particle.life += 1;

      particle.vy +=
        particle.g;

      particle.x +=
        particle.vx;

      particle.y +=
        particle.vy;

      particle.vx *=
        0.99;

      particle.rot +=
        particle.vrot;

      this.drawParticle(
        particle
      );
    }

    // ----------------------------------------------------------
    // RESET CANVAS STATE
    // ----------------------------------------------------------

    ctx.globalAlpha = 1;

    ctx.globalCompositeOperation =
      "source-over";

    ctx.shadowBlur = 0;

    ctx.shadowColor =
      "transparent";

    this.raf =
      requestAnimationFrame(
        this.loop
      );
  }
}

// ============================================================
// ELEMENT CENTER
// ============================================================

export function elementCenter(
  el: Element | null
): [number, number] {
  if (!el) {
    return [
      window.innerWidth / 2,
      window.innerHeight / 2,
    ];
  }

  const rect =
    el.getBoundingClientRect();

  return [
    rect.left +
      rect.width / 2,

    rect.top +
      rect.height / 2,
  ];
}