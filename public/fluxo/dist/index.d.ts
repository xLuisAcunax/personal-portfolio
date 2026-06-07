type EasingFunction = (t: number) => number;
declare const easings: {
    none: (t: number) => number;
    linear: (t: number) => number;
    "slow.in": (t: number) => number;
    "slow.out": (t: number) => number;
    "slow.inOut": (t: number) => number;
    "medium.in": (t: number) => number;
    "medium.out": (t: number) => number;
    "medium.inOut": (t: number) => number;
    "fast.in": (t: number) => number;
    "fast.out": (t: number) => number;
    "fast.inOut": (t: number) => number;
    "veryFast.in": (t: number) => number;
    "veryFast.out": (t: number) => number;
    "veryFast.inOut": (t: number) => number;
};
type EasingName = keyof typeof easings;

interface TweenVars {
    duration?: number;
    delay?: number;
    ease?: EasingName | EasingFunction;
    autoPlay?: boolean;
    repeat?: number;
    alternate?: boolean;
    onStart?: () => void;
    onUpdate?: () => void;
    onComplete?: () => void;
    onRepeat?: () => void;
    [key: string]: any;
}
declare class Tween {
    target: any;
    vars: TweenVars;
    duration: number;
    delay: number;
    private ease;
    private fromVars?;
    private isFrom;
    private playhead;
    private reversed;
    private started;
    private completed;
    private repeatCount;
    private propTweens;
    constructor(target: any, vars: TweenVars, fromVars?: TweenVars, isFrom?: boolean);
    private initProperties;
    private parseValue;
    private getTransformState;
    private applyTransform;
    play(): void;
    reverse(): void;
    pause(): void;
    render(time: number): void;
    private update;
    kill(): void;
}

interface TimelineVars {
    delay?: number;
    paused?: boolean;
    repeat?: number;
    alternate?: boolean;
    onStart?: () => void;
    onUpdate?: () => void;
    onComplete?: () => void;
    onRepeat?: () => void;
}
declare class Timeline {
    private children;
    private vars;
    duration: number;
    delay: number;
    private playhead;
    private reversed;
    private started;
    private completed;
    private isPlaying;
    private repeatCount;
    constructor(vars?: TimelineVars);
    /**
     * Adds an existing, externally created Tween instance to this timeline.
     * Useful for inserting custom tweens like fluxo.drawSVG().
     *
     * @param tween The Tween instance to add.
     * @param position Optional position key (number, relative offset like "+=0.5", or alignment like "<").
     */
    add(tween: Tween, position?: number | string): this;
    /**
     * Adds .to() tweens to the timeline.
     */
    to(target: any, vars: TweenVars, position?: number | string): this;
    /**
     * Adds .from() tweens to the timeline.
     */
    from(target: any, vars: TweenVars, position?: number | string): this;
    /**
     * Adds .fromTo() tweens to the timeline.
     */
    fromTo(target: any, fromVars: TweenVars, toVars: TweenVars, position?: number | string): this;
    play(): void;
    reverse(): void;
    pause(): void;
    kill(): void;
    private parsePosition;
    private addTween;
    render(time: number): void;
    private update;
}

interface ScrollTriggerVars {
    trigger: string | HTMLElement;
    start?: string;
    end?: string;
    scrub?: boolean;
    once?: boolean;
}
declare class ScrollTrigger {
    private static instances;
    private animation;
    private triggerEl;
    private vars;
    private startScroll;
    private endScroll;
    private hasTriggered;
    constructor(animation: Tween | Timeline, vars: ScrollTriggerVars);
    refresh(): void;
    private calculateScrollPos;
    private onScroll;
    kill(): void;
    static killAll(): void;
}

type TickerCallback = (time: number, dt: number) => void;
declare class Ticker {
    private callbacks;
    private rafId;
    private lastTime;
    private time;
    constructor();
    add(cb: TickerCallback): void;
    remove(cb: TickerCallback): void;
    private start;
    private stop;
    private tick;
}
declare const ticker: Ticker;

/**
 * Resolves various target formats (CSS selector, single DOM element, array, NodeList)
 * into a standard array of targets.
 */
declare function resolveTargets(target: any): any[];
/**
 * Splits the text of DOM elements into individual character or word spans,
 * making them ready for cascaded stagger animations.
 *
 * @param target CSS selector string or HTMLElement(s).
 * @param options Split configuration (type: 'chars' | 'words'). Defaults to 'chars'.
 */
declare function splitText(target: any, options?: {
    type?: "chars" | "words";
}): HTMLElement[];
/**
 * Animates the outline drawing of SVG paths by computing total length
 * and tweening its stroke dash offsets.
 *
 * @param target CSS selector string or SVGPathElement.
 * @param vars Tween configuration (duration, delay, ease, callbacks).
 */
declare function drawSVG(target: any, vars: TweenVars): Tween;

declare function slidingMenu(containerSelector: any, linksSelector: string, pillSelector: any, options?: {
    duration?: number;
    ease?: EasingName | EasingFunction;
}): void;
declare function magnetic(target: any, options?: {
    strength?: number;
    proximity?: number;
    duration?: number;
    ease?: EasingName | EasingFunction;
}): void;
declare function tilt(target: any, options?: {
    maxTilt?: number;
    perspective?: number;
    duration?: number;
    ease?: EasingName | EasingFunction;
}): void;
declare function explodeOnScroll(target: any, options?: {
    strength?: number;
    start?: string;
    end?: string;
    ease?: EasingName | EasingFunction;
}): void;
declare function implodeOnScroll(target: any, options?: {
    strength?: number;
    start?: string;
    end?: string;
    ease?: EasingName | EasingFunction;
}): void;
declare function revealText(target: any, options?: {
    type?: "chars" | "words";
    stagger?: number;
    duration?: number;
    ease?: EasingName | EasingFunction;
    delay?: number;
}): void;
declare function scrollReveal(target: any, options?: {
    stagger?: number;
    y?: number;
    duration?: number;
    ease?: EasingName | EasingFunction;
    start?: string;
    once?: boolean;
}): void;

declare const fluxo: {
    /**
     * Creates an animation that goes FROM the current values of the target
     * TO the values defined in 'vars'. Supports multiple targets, stagger, and scroll animator.
     */
    to(target: any, vars: TweenVars): Tween | Timeline;
    /**
     * Creates an animation that goes FROM the values defined in 'vars'
     * TO the current values of the target. Supports multiple targets, stagger, and scroll animator.
     */
    from(target: any, vars: TweenVars): Tween | Timeline;
    /**
     * Creates an animation that goes FROM the values defined in 'fromVars'
     * TO the values defined in 'toVars'. Supports multiple targets, stagger, and scroll animator.
     */
    fromTo(target: any, fromVars: TweenVars, toVars: TweenVars): Tween | Timeline;
    /**
     * Creates a new Timeline instance for sequencing multiple animations.
     */
    timeline(vars?: TimelineVars & {
        scroll?: any;
    }): Timeline;
    /**
     * Splits text of DOM elements into individual character or word spans,
     * making them ready for cascaded stagger animations.
     */
    splitText(target: any, options?: {
        type?: "chars" | "words";
    }): HTMLElement[];
    /**
     * Animates the outline drawing of SVG paths.
     */
    drawSVG(target: any, vars: TweenVars): Tween;
    magnetic(target: any, options?: any): void;
    tilt(target: any, options?: any): void;
    explodeOnScroll(target: any, options?: any): void;
    implodeOnScroll(target: any, options?: any): void;
    revealText(target: any, options?: any): void;
    scrollReveal(target: any, options?: any): void;
    slidingMenu(container: any, links: string, pill: any, options?: any): void;
    killAllTriggers(): void;
};

export { ScrollTrigger, type ScrollTriggerVars, Timeline, type TimelineVars, Tween, type TweenVars, drawSVG, easings, explodeOnScroll, fluxo, implodeOnScroll, magnetic, resolveTargets, revealText, scrollReveal, slidingMenu, splitText, ticker, tilt };
