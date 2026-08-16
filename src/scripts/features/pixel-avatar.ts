import { byId } from "../core/dom";
import { clamp, lerp, prefersReducedMotion } from "../core/motion";
import { observeVisibility, trackScrollRange } from "../core/scroll";
import { ticker } from "../core/ticker";

/** Sampling resolution of the portrait, in blocks per side. */
const GRID = 64;
const REVEAL_DELAY_MS = 250;
const REVEAL_DURATION_MS = 1500;
const GLITCH_DURATION_MS = 900;
const LUMINANCE_CUTOFF = 30;

interface Block {
  readonly x: number;
  readonly y: number;
  readonly r: number;
  readonly g: number;
  readonly b: number;
  /** 0.35–1, brighter pixels react more to pointer parallax. */
  readonly depth: number;
  /** Diagonal wave position, staggers the dissolve. */
  readonly wave: number;
  readonly fly: number;
}

interface AvatarState {
  reveal: number;
  scatter: number;
  assemble: number;
  blink: number;
  parallaxX: number;
  parallaxY: number;
}

const isEye = (block: Block): boolean =>
  block.y >= 21 &&
  block.y <= 25 &&
  ((block.x >= 27 && block.x <= 33) || (block.x >= 37 && block.x <= 43));

/**
 * The hero portrait rendered as coloured blocks on a canvas.
 *
 * It reveals row by row on load, dissolves into streaks as the hero scrolls
 * away, and reassembles as a small badge pinned to the corner of the viewport.
 */
class PixelAvatar {
  private readonly state: AvatarState = {
    reveal: 0,
    scatter: 0,
    assemble: 0,
    blink: 0,
    parallaxX: 0,
    parallaxY: 0,
  };

  private blocks: Block[] = [];
  private pointerX = 0;
  private pointerY = 0;
  private clientX = 0;
  private glitchUntil = 0;
  private heroVisible = true;
  private running = false;
  private stopTicker: (() => void) | null = null;
  private revealStartedAt = 0;
  private nextBlinkAt = 0;
  private blinkUntil = 0;

  constructor(
    private readonly heroCanvas: HTMLCanvasElement,
    private readonly cornerCanvas: HTMLCanvasElement | null,
    private readonly reduced: boolean,
  ) {}

  async start(source: string): Promise<void> {
    const image = await loadImage(source);
    this.blocks = sampleBlocks(image, GRID);
    if (this.blocks.length === 0) throw new Error("pixel-avatar: portrait produced no blocks");

    this.heroCanvas.dataset.ready = "true";
    byId("avatar-fallback")?.setAttribute("hidden", "");

    if (this.reduced) {
      this.state.reveal = 1;
      this.render(performance.now());
      return;
    }

    this.revealStartedAt = performance.now() + REVEAL_DELAY_MS;
    this.nextBlinkAt = performance.now() + 2200;
    this.wirePointer();
    this.wireScroll();
    this.wireVisibility();
    this.resume();
  }

  private wirePointer(): void {
    const stage = this.heroCanvas.closest("[data-avatar-stage]");
    stage?.addEventListener("pointerenter", () => {
      this.glitchUntil = performance.now() + GLITCH_DURATION_MS;
    });

    window.addEventListener(
      "pointermove",
      (event) => {
        this.pointerX = (event.clientX / window.innerWidth) * 2 - 1;
        this.pointerY = (event.clientY / window.innerHeight) * 2 - 1;
        this.clientX = event.clientX;
      },
      { passive: true },
    );
  }

  private wireScroll(): void {
    const hero = byId("top");
    if (!hero) return;

    const glow = byId("avatar-glow");
    const hint = byId("avatar-hint");
    const corner = byId("corner-avatar");

    trackScrollRange({
      target: hero,
      from: { edge: "bottom", viewport: 0.88 },
      to: { edge: "bottom", viewport: 0.15 },
      onUpdate: (progress) => {
        this.state.scatter = clamp(progress / 0.53);
        this.state.assemble = clamp((progress - 0.37) / 0.53);
        const fade = String(1 - this.state.scatter);
        if (glow) glow.style.opacity = fade;
        if (hint) hint.style.opacity = fade;
        if (corner) {
          const shown = clamp((progress - 0.47) / 0.53);
          corner.style.opacity = String(shown);
          corner.style.transform = `translateY(${(1 - shown) * 14}px)`;
        }
        this.resume();
      },
    });
  }

  private wireVisibility(): void {
    const stage = this.heroCanvas.closest("[data-avatar-stage]");
    if (stage) {
      observeVisibility(stage, (visible) => {
        this.heroVisible = visible;
        this.resume();
      });
    }
    document.addEventListener("visibilitychange", () => this.resume());
  }

  /** Draw only while there is something to look at — idle costs nothing. */
  private shouldRun(): boolean {
    if (document.visibilityState === "hidden") return false;
    return this.heroVisible || this.state.assemble > 0;
  }

  private resume(): void {
    if (this.running) {
      if (!this.shouldRun()) this.pause();
      return;
    }
    if (!this.shouldRun()) return;
    this.running = true;
    this.stopTicker = ticker.add((now) => this.frame(now));
  }

  private pause(): void {
    this.running = false;
    this.stopTicker?.();
    this.stopTicker = null;
  }

  private frame(now: number): void {
    if (!this.shouldRun()) {
      this.pause();
      return;
    }
    this.state.reveal = clamp((now - this.revealStartedAt) / REVEAL_DURATION_MS);
    this.updateBlink(now);
    this.state.parallaxX = lerp(this.state.parallaxX, this.pointerX, 0.07);
    this.state.parallaxY = lerp(this.state.parallaxY, this.pointerY, 0.07);
    this.render(now);
  }

  private updateBlink(now: number): void {
    if (now >= this.nextBlinkAt) {
      this.blinkUntil = now + 90;
      this.nextBlinkAt = now + 1600 + Math.random() * 4000;
    }
    this.state.blink = now < this.blinkUntil ? 1 : 0;
  }

  private render(now: number): void {
    this.renderHero(now);
    this.renderCorner();
  }

  private renderHero(now: number): void {
    const ctx = this.heroCanvas.getContext("2d");
    if (!ctx) return;

    const size = this.heroCanvas.width;
    const cell = size / GRID;
    const state = this.state;
    ctx.clearRect(0, 0, size, size);

    const glitching = now < this.glitchUntil;
    const glitchAmount = glitching ? 1 - (this.glitchUntil - now) / GLITCH_DURATION_MS : 0;

    for (const block of this.blocks) {
      if (state.reveal < 1 && block.y > state.reveal * GRID) continue;

      const scattered = clamp((state.scatter - block.wave * 0.38) / 0.62);
      const eased = scattered * scattered;
      const alpha = 1 - eased;
      if (alpha <= 0.02) continue;

      let x = block.x * cell + eased * eased * size * 0.34 + state.parallaxX * block.depth * 16;
      const y =
        block.y * cell +
        Math.sin(block.y * 0.7 + block.x * 0.3) * eased * 9 +
        state.parallaxY * block.depth * 16;
      const width = cell + 0.6 + eased * size * 0.42 * block.fly;
      const height = cell + 0.6 - eased * cell * 0.35;

      if (glitching) {
        const offset = Math.sin(block.y + now * 0.012) * 3.4 * glitchAmount;
        ctx.globalAlpha = alpha * 0.3;
        ctx.fillStyle = "rgb(46,196,166)";
        ctx.fillRect(x + offset - 3, y, width, height);
        ctx.fillStyle = "rgb(226,85,47)";
        ctx.fillRect(x + offset + 3, y, width, height);
        x += offset;
      }

      const leadingEdge = scattered > 0 && scattered < 0.16;
      ctx.globalAlpha = leadingEdge ? Math.min(1, alpha + 0.35) : alpha;
      if (leadingEdge) ctx.fillStyle = "rgb(190,255,240)";
      else if (state.blink > 0.5 && isEye(block)) ctx.fillStyle = "rgb(24,26,32)";
      else ctx.fillStyle = `rgb(${block.r},${block.g},${block.b})`;

      ctx.fillRect(x, y, leadingEdge ? width + cell * 1.4 : width, height);
    }

    ctx.globalAlpha = 1;
  }

  private renderCorner(): void {
    const canvas = this.cornerCanvas;
    const assemble = this.state.assemble;
    if (!canvas || assemble <= 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = canvas.width;
    const cell = size / GRID;
    const head = assemble * 1.12;
    const tilt = clamp((this.clientX - window.innerWidth + 52) / 260, -1, 1);
    const flicker = assemble >= 1 && Math.random() < 0.04 ? 0.82 : 1;

    ctx.clearRect(0, 0, size, size);

    for (const block of this.blocks) {
      const rowProgress = (head - block.y / GRID) / 0.12;
      if (rowProgress <= 0) continue;
      const local = Math.min(1, rowProgress);

      ctx.globalAlpha = local * flicker;
      if (local < 0.5) ctx.fillStyle = "rgb(46,196,166)";
      else if (this.state.blink > 0.5 && isEye(block)) ctx.fillStyle = "rgb(24,26,32)";
      else ctx.fillStyle = `rgb(${block.r},${block.g},${block.b})`;

      ctx.fillRect(
        block.x * cell - (1 - local) * 16 + tilt * block.depth * 2.2,
        block.y * cell,
        cell + 0.6,
        cell + 0.6,
      );
    }

    if (assemble < 1) {
      const scanY = Math.min(size - 2, head * size);
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "rgb(240,193,75)";
      ctx.fillRect(0, scanY, size, 2.5);
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = "rgb(46,196,166)";
      ctx.fillRect(0, scanY - 7, size, 7);
    }

    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "rgb(0,0,0)";
    for (let line = 0; line < size; line += 4) ctx.fillRect(0, line, size, 1.2);
    ctx.globalAlpha = 1;
  }
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`pixel-avatar: could not load ${source}`));
    image.src = source;
  });
}

/** Downsample the portrait to a grid of coloured blocks, dropping dark pixels. */
function sampleBlocks(image: HTMLImageElement, grid: number): Block[] {
  const offscreen = document.createElement("canvas");
  offscreen.width = grid;
  offscreen.height = grid;

  const ctx = offscreen.getContext("2d", { willReadFrequently: true });
  if (!ctx) return [];

  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(image, 0, 0, grid, grid);

  const { data } = ctx.getImageData(0, 0, grid, grid);
  const blocks: Block[] = [];

  for (let y = 0; y < grid; y += 1) {
    for (let x = 0; x < grid; x += 1) {
      const index = (y * grid + x) * 4;
      const r = data[index] ?? 0;
      const g = data[index + 1] ?? 0;
      const b = data[index + 2] ?? 0;
      const luminance = r * 0.299 + g * 0.587 + b * 0.114;
      if (luminance < LUMINANCE_CUTOFF) continue;

      blocks.push({
        x,
        y,
        r,
        g,
        b,
        depth: 0.35 + (luminance / 255) * 0.65,
        wave: (x + (grid - y)) / (2 * grid),
        fly: 0.55 + Math.random() * 0.9,
      });
    }
  }

  return blocks;
}

/** Mounts the avatar if its canvas is present. Failures degrade to the photo. */
export async function initPixelAvatar(source: string): Promise<void> {
  const heroCanvas = byId<HTMLCanvasElement>("hero-canvas");
  if (!heroCanvas) return;

  const avatar = new PixelAvatar(
    heroCanvas,
    byId<HTMLCanvasElement>("corner-canvas"),
    prefersReducedMotion(),
  );

  try {
    await avatar.start(source);
  } catch {
    delete heroCanvas.dataset.ready;
    byId("avatar-fallback")?.removeAttribute("hidden");
  }
}
