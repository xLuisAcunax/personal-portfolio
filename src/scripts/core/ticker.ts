export type TickHandler = (time: number) => void;

/**
 * One `requestAnimationFrame` loop for the whole page.
 *
 * Features subscribe instead of starting their own loop, which keeps the frame
 * budget predictable and lets the loop idle completely when nothing is
 * subscribed (0% CPU at rest).
 */
class Ticker {
  private readonly handlers = new Set<TickHandler>();
  private frame: number | null = null;

  add(handler: TickHandler): () => void {
    this.handlers.add(handler);
    this.start();
    return () => this.remove(handler);
  }

  remove(handler: TickHandler): void {
    this.handlers.delete(handler);
    if (this.handlers.size === 0) this.stop();
  }

  private start(): void {
    if (this.frame !== null) return;
    const run = (time: number): void => {
      this.frame = requestAnimationFrame(run);
      for (const handler of this.handlers) handler(time);
    };
    this.frame = requestAnimationFrame(run);
  }

  private stop(): void {
    if (this.frame === null) return;
    cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}

export const ticker = new Ticker();
