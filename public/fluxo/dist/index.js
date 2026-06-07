// src/ticker.ts
var Ticker = class {
  callbacks = /* @__PURE__ */ new Set();
  rafId = null;
  lastTime = 0;
  time = 0;
  constructor() {
    this.tick = this.tick.bind(this);
  }
  add(cb) {
    this.callbacks.add(cb);
    if (this.rafId === null) {
      this.start();
    }
  }
  remove(cb) {
    this.callbacks.delete(cb);
    if (this.callbacks.size === 0 && this.rafId !== null) {
      this.stop();
    }
  }
  start() {
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.tick);
  }
  stop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }
  tick(now) {
    const dt = (now - this.lastTime) / 1e3;
    this.lastTime = now;
    this.time += dt;
    const activeCallbacks = Array.from(this.callbacks);
    for (const cb of activeCallbacks) {
      cb(this.time, dt);
    }
    if (this.callbacks.size > 0) {
      this.rafId = requestAnimationFrame(this.tick);
    } else {
      this.rafId = null;
    }
  }
};
var ticker = new Ticker();

// src/easings.ts
var easings = {
  none: (t) => t,
  linear: (t) => t,
  "slow.in": (t) => t * t,
  "slow.out": (t) => t * (2 - t),
  "slow.inOut": (t) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2,
  "medium.in": (t) => t * t * t,
  "medium.out": (t) => 1 - Math.pow(1 - t, 3),
  "medium.inOut": (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
  "fast.in": (t) => t * t * t * t,
  "fast.out": (t) => 1 - Math.pow(1 - t, 4),
  "fast.inOut": (t) => t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2,
  "veryFast.in": (t) => t * t * t * t * t,
  "veryFast.out": (t) => 1 - Math.pow(1 - t, 5),
  "veryFast.inOut": (t) => t < 0.5 ? 16 * t * t * t * t * t : 1 - Math.pow(-2 * t + 2, 5) / 2
};
function getEasing(ease) {
  if (!ease) return easings["slow.out"];
  if (typeof ease === "function") return ease;
  return easings[ease] || easings["slow.out"];
}

// src/utils.ts
function resolveTargets(target) {
  if (!target) return [];
  if (typeof target === "string") {
    if (typeof document !== "undefined") {
      return Array.from(document.querySelectorAll(target));
    }
    return [];
  }
  if (Array.isArray(target)) {
    return target;
  }
  if (typeof NodeList !== "undefined" && target instanceof NodeList) {
    return Array.from(target);
  }
  if (typeof HTMLCollection !== "undefined" && target instanceof HTMLCollection) {
    return Array.from(target);
  }
  return [target];
}
function splitText(target, options = {}) {
  const targets = resolveTargets(target);
  const type = options.type || "chars";
  const resultSpans = [];
  targets.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const originalText = el.textContent || "";
    el.innerHTML = "";
    if (type === "chars") {
      const chars = originalText.split("");
      chars.forEach((char) => {
        if (char === " ") {
          el.appendChild(document.createTextNode(" "));
        } else {
          const span = document.createElement("span");
          span.className = "fluxo-char";
          span.style.display = "inline-block";
          span.textContent = char;
          el.appendChild(span);
          resultSpans.push(span);
        }
      });
    } else {
      const words = originalText.split(" ");
      words.forEach((word, index) => {
        if (index > 0) {
          el.appendChild(document.createTextNode(" "));
        }
        const span = document.createElement("span");
        span.className = "fluxo-word";
        span.style.display = "inline-block";
        span.textContent = word;
        el.appendChild(span);
        resultSpans.push(span);
      });
    }
  });
  return resultSpans;
}
function drawSVG(target, vars) {
  const targets = resolveTargets(target);
  const path = targets.length > 0 ? targets[0] : null;
  if (!path || typeof path.getTotalLength !== "function") {
    throw new Error(
      "drawSVG: Target must be a valid SVG element with getTotalLength (such as <path>)"
    );
  }
  const length = path.getTotalLength();
  path.style.strokeDasharray = String(length);
  path.style.strokeDashoffset = String(length);
  return new Tween(path, {
    strokeDashoffset: 0,
    ...vars
  });
}

// src/tween.ts
var TRANSFORM_KEYS = /* @__PURE__ */ new Set(["x", "y", "rotation", "scale"]);
var RESERVED_KEYS = /* @__PURE__ */ new Set([
  "duration",
  "delay",
  "ease",
  "autoPlay",
  "repeat",
  "alternate",
  "onStart",
  "onUpdate",
  "onComplete",
  "onRepeat"
]);
var Tween = class {
  target;
  vars;
  duration;
  delay;
  ease;
  fromVars;
  isFrom = false;
  playhead = 0;
  reversed = false;
  started = false;
  completed = false;
  repeatCount = 0;
  propTweens = [];
  constructor(target, vars, fromVars, isFrom = false) {
    const resolved = resolveTargets(target);
    this.target = resolved.length > 0 ? resolved[0] : null;
    this.vars = vars;
    this.fromVars = fromVars;
    this.isFrom = isFrom;
    this.duration = vars.duration !== void 0 ? vars.duration : 0.5;
    this.delay = vars.delay !== void 0 ? vars.delay : 0;
    this.ease = getEasing(vars.ease);
    this.update = this.update.bind(this);
    const autoPlay = vars.autoPlay !== false;
    if (this.target) {
      if (this.isFrom || this.fromVars) {
        this.initProperties();
        this.started = true;
      }
      if (autoPlay) {
        ticker.add(this.update);
      }
    }
  }
  initProperties() {
    this.propTweens = [];
    const isDOM = this.target instanceof HTMLElement || typeof SVGElement !== "undefined" && this.target instanceof SVGElement;
    let transformState = null;
    if (isDOM) {
      transformState = this.getTransformState(this.target);
    }
    for (const key in this.vars) {
      if (RESERVED_KEYS.has(key)) continue;
      const endValueRaw = this.vars[key];
      const parsedEnd = this.parseValue(endValueRaw);
      let currentVal = 0;
      let unit = parsedEnd.unit;
      const isTransform = isDOM && TRANSFORM_KEYS.has(key);
      if (isTransform && transformState) {
        currentVal = transformState[key];
      } else if (isDOM) {
        const computedStyle = window.getComputedStyle(this.target);
        const styleVal = computedStyle[key] || this.target.style[key];
        const parsedStart = this.parseValue(styleVal);
        currentVal = parsedStart.value;
        if (unit === "" && parsedStart.unit !== "") {
          unit = parsedStart.unit;
        }
      } else {
        currentVal = typeof this.target[key] === "number" ? this.target[key] : 0;
      }
      let startValue = 0;
      let endValue = 0;
      if (this.fromVars) {
        const parsedFrom = this.parseValue(this.fromVars[key]);
        startValue = parsedFrom.value;
        endValue = parsedEnd.value;
        unit = parsedEnd.unit || parsedFrom.unit || unit;
      } else if (this.isFrom) {
        startValue = parsedEnd.value;
        endValue = currentVal;
      } else {
        startValue = currentVal;
        endValue = parsedEnd.value;
      }
      this.propTweens.push({
        key,
        isTransform,
        start: startValue,
        end: endValue,
        unit
      });
      if (this.isFrom || this.fromVars) {
        if (isTransform && transformState) {
          transformState[key] = startValue;
        } else if (isDOM) {
          this.target.style[key] = startValue + unit;
        } else {
          this.target[key] = startValue;
        }
      }
    }
    if ((this.isFrom || this.fromVars) && transformState && isDOM) {
      this.applyTransform(this.target, transformState);
    }
  }
  parseValue(val) {
    if (typeof val === "number") {
      return { value: val, unit: "" };
    }
    const num = parseFloat(val);
    if (isNaN(num)) {
      return { value: 0, unit: "" };
    }
    const unit = String(val).replace(/^[-\d.]+/, "");
    return { value: num, unit };
  }
  getTransformState(el) {
    if (!el._fluxoTransform) {
      el._fluxoTransform = { x: 0, y: 0, rotation: 0, scale: 1 };
    }
    return el._fluxoTransform;
  }
  applyTransform(el, state) {
    el.style.transform = `translate3d(${state.x}px, ${state.y}px, 0px) rotate(${state.rotation}deg) scale(${state.scale})`;
  }
  play() {
    this.reversed = false;
    this.completed = false;
    const maxTime = this.duration + this.delay;
    if (this.playhead >= maxTime) {
      this.playhead = 0;
      this.repeatCount = 0;
    }
    ticker.add(this.update);
  }
  reverse() {
    this.reversed = true;
    this.completed = false;
    if (this.playhead <= 0) {
      this.playhead = this.duration + this.delay;
      this.repeatCount = 0;
    }
    ticker.add(this.update);
  }
  pause() {
    ticker.remove(this.update);
  }
  render(time) {
    let progress = 0;
    if (time >= this.delay) {
      const activeTime = time - this.delay;
      progress = this.duration > 0 ? activeTime / this.duration : 1;
      if (progress > 1) progress = 1;
    }
    if (!this.started && time >= this.delay) {
      this.started = true;
      this.initProperties();
      if (this.vars.onStart) {
        this.vars.onStart();
      }
    }
    const easedProgress = this.ease(progress);
    let hasTransform = false;
    const transformState = this.target instanceof HTMLElement || typeof SVGElement !== "undefined" && this.target instanceof SVGElement ? this.getTransformState(this.target) : null;
    for (const pt of this.propTweens) {
      const currentVal = pt.start + (pt.end - pt.start) * easedProgress;
      if (pt.isTransform && transformState) {
        transformState[pt.key] = currentVal;
        hasTransform = true;
      } else if (this.target.style !== void 0) {
        this.target.style[pt.key] = currentVal + pt.unit;
      } else {
        this.target[pt.key] = currentVal;
      }
    }
    if (hasTransform && transformState) {
      this.applyTransform(this.target, transformState);
    }
    if (this.vars.onUpdate) {
      this.vars.onUpdate();
    }
  }
  update(totalTime, dt) {
    if (this.completed) return;
    this.playhead += this.reversed ? -dt : dt;
    const maxTime = this.duration + this.delay;
    const repeatOption = this.vars.repeat !== void 0 ? this.vars.repeat : 0;
    const alternateOption = this.vars.alternate === true;
    if (this.reversed) {
      if (this.playhead <= this.delay) {
        if (repeatOption === -1 || this.repeatCount < repeatOption) {
          this.repeatCount++;
          if (this.vars.onRepeat) {
            this.vars.onRepeat();
          }
          if (alternateOption) {
            this.reversed = false;
            this.playhead = this.delay;
          } else {
            this.playhead = maxTime;
          }
        } else {
          this.playhead = 0;
          this.completed = true;
        }
      }
    } else {
      if (this.playhead >= maxTime) {
        if (repeatOption === -1 || this.repeatCount < repeatOption) {
          this.repeatCount++;
          if (this.vars.onRepeat) {
            this.vars.onRepeat();
          }
          if (alternateOption) {
            this.reversed = true;
            this.playhead = maxTime;
          } else {
            this.playhead = this.delay;
          }
        } else {
          this.playhead = maxTime;
          this.completed = true;
        }
      }
    }
    this.render(this.playhead);
    if (this.completed) {
      ticker.remove(this.update);
      if (this.vars.onComplete) {
        this.vars.onComplete();
      }
    }
  }
  kill() {
    ticker.remove(this.update);
  }
};

// src/timeline.ts
var Timeline = class {
  children = [];
  vars;
  duration = 0;
  delay;
  playhead = 0;
  reversed = false;
  started = false;
  completed = false;
  isPlaying = false;
  repeatCount = 0;
  constructor(vars = {}) {
    this.vars = vars;
    this.delay = vars.delay !== void 0 ? vars.delay : 0;
    this.update = this.update.bind(this);
    if (!vars.paused) {
      this.play();
    }
  }
  /**
   * Adds an existing, externally created Tween instance to this timeline.
   * Useful for inserting custom tweens like fluxo.drawSVG().
   *
   * @param tween The Tween instance to add.
   * @param position Optional position key (number, relative offset like "+=0.5", or alignment like "<").
   */
  add(tween, position) {
    tween.pause();
    const baseTime = this.parsePosition(position);
    this.addTween(tween, baseTime);
    return this;
  }
  /**
   * Adds .to() tweens to the timeline.
   */
  to(target, vars, position) {
    const targets = resolveTargets(target);
    const baseTime = this.parsePosition(position);
    const stagger = vars.stagger || 0;
    const tweenVars = { ...vars };
    delete tweenVars.stagger;
    targets.forEach((t, i) => {
      const tween = new Tween(t, { ...tweenVars, autoPlay: false });
      this.addTween(tween, baseTime + i * stagger);
    });
    return this;
  }
  /**
   * Adds .from() tweens to the timeline.
   */
  from(target, vars, position) {
    const targets = resolveTargets(target);
    const baseTime = this.parsePosition(position);
    const stagger = vars.stagger || 0;
    const tweenVars = { ...vars };
    delete tweenVars.stagger;
    targets.forEach((t, i) => {
      const tween = new Tween(
        t,
        { ...tweenVars, autoPlay: false },
        void 0,
        true
      );
      this.addTween(tween, baseTime + i * stagger);
    });
    return this;
  }
  /**
   * Adds .fromTo() tweens to the timeline.
   */
  fromTo(target, fromVars, toVars, position) {
    const targets = resolveTargets(target);
    const baseTime = this.parsePosition(position);
    const stagger = toVars.stagger || 0;
    const tweenVars = { ...toVars };
    delete tweenVars.stagger;
    targets.forEach((t, i) => {
      const tween = new Tween(t, { ...tweenVars, autoPlay: false }, fromVars);
      this.addTween(tween, baseTime + i * stagger);
    });
    return this;
  }
  play() {
    this.reversed = false;
    this.completed = false;
    const maxTime = this.duration + this.delay;
    if (this.playhead >= maxTime) {
      this.playhead = 0;
      this.repeatCount = 0;
    }
    this.isPlaying = true;
    ticker.add(this.update);
  }
  reverse() {
    this.reversed = true;
    this.completed = false;
    if (this.playhead <= 0) {
      this.playhead = this.duration + this.delay;
      this.repeatCount = 0;
    }
    this.isPlaying = true;
    ticker.add(this.update);
  }
  pause() {
    if (!this.isPlaying) return;
    this.isPlaying = false;
    ticker.remove(this.update);
  }
  kill() {
    this.isPlaying = false;
    ticker.remove(this.update);
    for (const child of this.children) {
      child.tween.kill();
    }
  }
  parsePosition(position) {
    let startTime = this.duration;
    const prevChild = this.children[this.children.length - 1];
    if (position !== void 0) {
      if (typeof position === "number") {
        startTime = position;
      } else if (typeof position === "string") {
        if (position.startsWith("+=")) {
          const val = parseFloat(position.slice(2));
          startTime = this.duration + (isNaN(val) ? 0 : val);
        } else if (position.startsWith("-=")) {
          const val = parseFloat(position.slice(2));
          startTime = this.duration - (isNaN(val) ? 0 : val);
        } else if (position === "<") {
          startTime = prevChild ? prevChild.startTime : 0;
        } else if (position.startsWith("<")) {
          const offsetStr = position.slice(1);
          const baseTime = prevChild ? prevChild.startTime : 0;
          if (offsetStr.startsWith("+=")) {
            const val = parseFloat(offsetStr.slice(2));
            startTime = baseTime + (isNaN(val) ? 0 : val);
          } else if (offsetStr.startsWith("-=")) {
            const val = parseFloat(offsetStr.slice(2));
            startTime = baseTime - (isNaN(val) ? 0 : val);
          }
        }
      }
    }
    return startTime;
  }
  addTween(tween, startTime) {
    const tweenDuration = tween.duration + tween.delay;
    const endTime = startTime + tweenDuration;
    this.children.push({
      tween,
      startTime,
      endTime
    });
    this.duration = Math.max(this.duration, endTime);
  }
  render(time) {
    let activeTime = 0;
    if (time >= this.delay) {
      activeTime = time - this.delay;
    }
    if (!this.started && time >= this.delay) {
      this.started = true;
      if (this.vars.onStart) {
        this.vars.onStart();
      }
    }
    for (const child of this.children) {
      const localTime = activeTime - child.startTime;
      child.tween.render(localTime);
    }
    if (this.vars.onUpdate) {
      this.vars.onUpdate();
    }
  }
  update(totalTime, dt) {
    if (this.completed) return;
    this.playhead += this.reversed ? -dt : dt;
    const maxTime = this.duration + this.delay;
    const repeatOption = this.vars.repeat !== void 0 ? this.vars.repeat : 0;
    const alternateOption = this.vars.alternate === true;
    if (this.reversed) {
      if (this.playhead <= this.delay) {
        if (repeatOption === -1 || this.repeatCount < repeatOption) {
          this.repeatCount++;
          if (this.vars.onRepeat) {
            this.vars.onRepeat();
          }
          if (alternateOption) {
            this.reversed = false;
            this.playhead = this.delay;
          } else {
            this.playhead = maxTime;
          }
        } else {
          this.playhead = 0;
          this.completed = true;
        }
      }
    } else {
      if (this.playhead >= maxTime) {
        if (repeatOption === -1 || this.repeatCount < repeatOption) {
          this.repeatCount++;
          if (this.vars.onRepeat) {
            this.vars.onRepeat();
          }
          if (alternateOption) {
            this.reversed = true;
            this.playhead = maxTime;
          } else {
            this.playhead = this.delay;
          }
        } else {
          this.playhead = maxTime;
          this.completed = true;
        }
      }
    }
    this.render(this.playhead);
    if (this.completed) {
      this.isPlaying = false;
      ticker.remove(this.update);
      if (this.vars.onComplete) {
        this.vars.onComplete();
      }
    }
  }
};

// src/scrollTrigger.ts
var ScrollTrigger = class _ScrollTrigger {
  static instances = [];
  animation;
  triggerEl;
  vars;
  startScroll = 0;
  endScroll = 0;
  hasTriggered = false;
  constructor(animation, vars) {
    this.animation = animation;
    this.vars = vars;
    _ScrollTrigger.instances.push(this);
    const resolved = resolveTargets(vars.trigger);
    if (resolved.length === 0) {
      throw new Error(
        `ScrollTrigger: Target trigger element not found for "${vars.trigger}"`
      );
    }
    this.triggerEl = resolved[0];
    this.onScroll = this.onScroll.bind(this);
    this.refresh = this.refresh.bind(this);
    this.refresh();
    window.addEventListener("scroll", this.onScroll, { passive: true });
    window.addEventListener("resize", this.refresh, { passive: true });
    this.onScroll();
  }
  refresh() {
    const rect = this.triggerEl.getBoundingClientRect();
    const docScrollY = window.scrollY;
    const elTop = rect.top + docScrollY;
    const elHeight = rect.height;
    const startStr = this.vars.start || "top bottom";
    this.startScroll = this.calculateScrollPos(
      startStr,
      elTop,
      elHeight,
      "top",
      "bottom"
    );
    const endStr = this.vars.end || "bottom top";
    this.endScroll = this.calculateScrollPos(
      endStr,
      elTop,
      elHeight,
      "bottom",
      "top"
    );
    if (this.endScroll <= this.startScroll) {
      this.endScroll = this.startScroll + 1;
    }
  }
  calculateScrollPos(posStr, elTop, elHeight, defaultElPart, defaultVPart) {
    const parts = posStr.split(" ");
    const elPart = parts[0] || defaultElPart;
    const vPart = parts[1] || defaultVPart;
    let elOffset = 0;
    if (elPart === "top") elOffset = 0;
    else if (elPart === "center") elOffset = elHeight / 2;
    else if (elPart === "bottom") elOffset = elHeight;
    else if (elPart.endsWith("%")) {
      elOffset = parseFloat(elPart) / 100 * elHeight;
    } else {
      elOffset = parseFloat(elPart) || 0;
    }
    let vOffset = 0;
    const vh = window.innerHeight;
    if (vPart === "top") vOffset = 0;
    else if (vPart === "center") vOffset = vh / 2;
    else if (vPart === "bottom") vOffset = vh;
    else if (vPart.endsWith("%")) {
      vOffset = parseFloat(vPart) / 100 * vh;
    } else {
      vOffset = parseFloat(vPart) || 0;
    }
    return elTop + elOffset - vOffset;
  }
  onScroll() {
    const scrollY = window.scrollY;
    if (this.vars.scrub) {
      let progress = (scrollY - this.startScroll) / (this.endScroll - this.startScroll);
      progress = Math.max(0, Math.min(1, progress));
      const totalDuration = this.animation.duration + this.animation.delay;
      this.animation.render(progress * totalDuration);
    } else {
      if (scrollY >= this.startScroll) {
        if (!this.hasTriggered) {
          this.hasTriggered = true;
          this.animation.play();
          if (this.vars.once) {
            this.kill();
          }
        }
      } else {
        if (!this.vars.once && this.hasTriggered) {
          this.hasTriggered = false;
          this.animation.pause();
          this.animation.render(0);
        }
      }
    }
  }
  kill() {
    window.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("resize", this.refresh);
    const idx = _ScrollTrigger.instances.indexOf(this);
    if (idx !== -1) {
      _ScrollTrigger.instances.splice(idx, 1);
    }
  }
  static killAll() {
    const list = [..._ScrollTrigger.instances];
    list.forEach((instance) => instance.kill());
    _ScrollTrigger.instances = [];
  }
};

// src/effects.ts
function slidingMenu(containerSelector, linksSelector, pillSelector, options = {}) {
  const container = resolveTargets(containerSelector)[0];
  const pill = resolveTargets(pillSelector)[0];
  const links = container ? Array.from(container.querySelectorAll(linksSelector)) : [];
  if (!container || !pill || links.length === 0) return;
  const duration = options.duration !== void 0 ? options.duration : 0.35;
  const ease = options.ease || "veryFast.out";
  const movePill = (linkEl) => {
    const rect = linkEl.getBoundingClientRect();
    const parentRect = container.getBoundingClientRect();
    const targetLeft = rect.left - parentRect.left;
    const targetWidth = rect.width;
    const targetTop = rect.top - parentRect.top;
    const targetHeight = rect.height;
    new Tween(pill, {
      left: targetLeft,
      width: targetWidth,
      top: targetTop,
      height: targetHeight,
      opacity: 1,
      duration,
      ease,
      autoPlay: true
    });
  };
  links.forEach((link) => {
    if (!(link instanceof HTMLElement)) return;
    link.addEventListener("mouseenter", () => movePill(link), {
      passive: true
    });
  });
  container.addEventListener(
    "mouseleave",
    () => {
      new Tween(pill, {
        opacity: 0,
        duration: 0.3,
        ease: "medium.out",
        autoPlay: true
      });
    },
    { passive: true }
  );
}
function magnetic(target, options = {}) {
  const resolved = resolveTargets(target);
  const strength = options.strength !== void 0 ? options.strength : 0.45;
  const proximity = options.proximity !== void 0 ? options.proximity : 100;
  const duration = options.duration !== void 0 ? options.duration : 0.3;
  const ease = options.ease || "veryFast.out";
  resolved.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    let isInside = false;
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = e.clientX - centerX;
      const deltaY = e.clientY - centerY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
      if (distance < proximity) {
        isInside = true;
        new Tween(el, {
          x: deltaX * strength,
          y: deltaY * strength,
          duration,
          ease,
          autoPlay: true
        });
      } else if (isInside) {
        isInside = false;
        new Tween(el, {
          x: 0,
          y: 0,
          duration: 0.6,
          ease: "medium.out",
          autoPlay: true
        });
      }
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
  });
}
function tilt(target, options = {}) {
  const resolved = resolveTargets(target);
  const maxTilt = options.maxTilt !== void 0 ? options.maxTilt : 25;
  const perspective = options.perspective !== void 0 ? options.perspective : 800;
  const duration = options.duration !== void 0 ? options.duration : 0.2;
  const ease = options.ease || "veryFast.out";
  resolved.forEach((el) => {
    if (!(el instanceof HTMLElement)) return;
    const onMouseMove = (e) => {
      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const pctX = mouseX / rect.width * 100;
      const pctY = mouseY / rect.height * 100;
      el.style.setProperty("--mouse-x", `${pctX}%`);
      el.style.setProperty("--mouse-y", `${pctY}%`);
      const tiltX = (mouseY / rect.height - 0.5) * -maxTilt;
      const tiltY = (mouseX / rect.width - 0.5) * maxTilt;
      new Tween(el, {
        transform: `perspective(${perspective}px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`,
        duration,
        ease,
        autoPlay: true
      });
    };
    const onMouseLeave = () => {
      new Tween(el, {
        transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg)`,
        duration: 0.6,
        ease: "medium.out",
        autoPlay: true
      });
      el.style.setProperty("--mouse-x", "50%");
      el.style.setProperty("--mouse-y", "50%");
    };
    el.addEventListener("mousemove", onMouseMove, { passive: true });
    el.addEventListener("mouseleave", onMouseLeave, { passive: true });
  });
}
function explodeOnScroll(target, options = {}) {
  const resolved = resolveTargets(target);
  const strength = options.strength !== void 0 ? options.strength : 1;
  const start = options.start || "top 70%";
  const end = options.end || "top 20%";
  const ease = options.ease || "medium.out";
  resolved.forEach((el) => {
    const chars = splitText(el, { type: "chars" });
    const tl = new Timeline({ paused: true });
    chars.forEach((char) => {
      const targetX = (Math.random() - 0.5) * 600 * strength;
      const targetY = (Math.random() - 0.5) * 500 * strength;
      const targetRot = (Math.random() - 0.5) * 360;
      const targetScale = 0.1 + Math.random() * 2.2;
      const tween = new Tween(char, {
        x: targetX,
        y: targetY,
        rotation: targetRot,
        scale: targetScale,
        opacity: 0,
        duration: 1,
        ease,
        autoPlay: false
      });
      tl.add(tween, 0);
    });
    new ScrollTrigger(tl, {
      trigger: el,
      start,
      end,
      scrub: true
    });
  });
}
function implodeOnScroll(target, options = {}) {
  const resolved = resolveTargets(target);
  const strength = options.strength !== void 0 ? options.strength : 1;
  const start = options.start || "top 95%";
  const end = options.end || "top 50%";
  const ease = options.ease || "medium.out";
  resolved.forEach((el) => {
    const chars = splitText(el, { type: "chars" });
    const tl = new Timeline({ paused: true });
    chars.forEach((char) => {
      const startX = (Math.random() - 0.5) * 700 * strength;
      const startY = (Math.random() - 0.5) * 600 * strength;
      const startRot = (Math.random() - 0.5) * 360;
      const startScale = 0.1 + Math.random() * 2.5;
      const tween = new Tween(
        char,
        {
          x: 0,
          y: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
          duration: 1,
          ease,
          autoPlay: false
        },
        {
          x: startX,
          y: startY,
          rotation: startRot,
          scale: startScale,
          opacity: 0
        }
      );
      tl.add(tween, 0);
    });
    new ScrollTrigger(tl, {
      trigger: el,
      start,
      end,
      scrub: true
    });
  });
}
function revealText(target, options = {}) {
  const type = options.type || "chars";
  const stagger = options.stagger !== void 0 ? options.stagger : type === "chars" ? 0.03 : 0.12;
  const duration = options.duration !== void 0 ? options.duration : 0.8;
  const ease = options.ease || "veryFast.out";
  const delay = options.delay !== void 0 ? options.delay : 0;
  const resolved = resolveTargets(target);
  resolved.forEach((el) => {
    const spans = splitText(el, { type });
    const tl = new Timeline({ delay, paused: true });
    spans.forEach((span, i) => {
      const tween = new Tween(
        span,
        {
          opacity: 1,
          y: 0,
          scale: 1,
          rotation: 0,
          duration,
          ease,
          autoPlay: false
        },
        {
          opacity: 0,
          y: 40,
          scale: 0.5,
          rotation: 15
        }
      );
      tl.add(tween, i * stagger);
    });
    tl.play();
  });
}
function scrollReveal(target, options = {}) {
  const resolved = resolveTargets(target);
  const stagger = options.stagger !== void 0 ? options.stagger : 0.1;
  const y = options.y !== void 0 ? options.y : 50;
  const duration = options.duration !== void 0 ? options.duration : 0.8;
  const ease = options.ease || "medium.out";
  const start = options.start || "top 85%";
  const once = options.once !== false;
  if (resolved.length === 0) return;
  const tl = new Timeline({ paused: true });
  resolved.forEach((el, i) => {
    const tween = new Tween(
      el,
      {
        opacity: 1,
        y: 0,
        duration,
        ease,
        autoPlay: false
      },
      {
        opacity: 0,
        y
      }
    );
    tl.add(tween, i * stagger);
  });
  new ScrollTrigger(tl, {
    trigger: resolved[0],
    start,
    once
  });
}

// src/index.ts
var fluxo = {
  /**
   * Creates an animation that goes FROM the current values of the target
   * TO the values defined in 'vars'. Supports multiple targets, stagger, and scroll animator.
   */
  to(target, vars) {
    const targets = resolveTargets(target);
    const hasScroll = vars.scroll !== void 0;
    const varsWithAutoPlay = { ...vars };
    if (hasScroll) {
      varsWithAutoPlay.autoPlay = false;
    }
    let animation;
    if (targets.length === 0) {
      animation = new Tween(null, varsWithAutoPlay);
    } else if (targets.length === 1) {
      animation = new Tween(targets[0], varsWithAutoPlay);
    } else {
      const tl = new Timeline({
        delay: varsWithAutoPlay.delay,
        onStart: varsWithAutoPlay.onStart,
        onUpdate: varsWithAutoPlay.onUpdate,
        onComplete: varsWithAutoPlay.onComplete,
        paused: true
      });
      const stagger = varsWithAutoPlay.stagger || 0;
      const tweenVars = { ...varsWithAutoPlay };
      delete tweenVars.delay;
      delete tweenVars.onStart;
      delete tweenVars.onUpdate;
      delete tweenVars.onComplete;
      delete tweenVars.stagger;
      delete tweenVars.scroll;
      targets.forEach((t, i) => {
        tl.to(t, tweenVars, i * stagger);
      });
      if (!hasScroll) {
        tl.play();
      }
      animation = tl;
    }
    if (hasScroll && vars.scroll) {
      new ScrollTrigger(animation, vars.scroll);
    }
    return animation;
  },
  /**
   * Creates an animation that goes FROM the values defined in 'vars'
   * TO the current values of the target. Supports multiple targets, stagger, and scroll animator.
   */
  from(target, vars) {
    const targets = resolveTargets(target);
    const hasScroll = vars.scroll !== void 0;
    const varsWithAutoPlay = { ...vars };
    if (hasScroll) {
      varsWithAutoPlay.autoPlay = false;
    }
    let animation;
    if (targets.length === 0) {
      animation = new Tween(null, varsWithAutoPlay, void 0, true);
    } else if (targets.length === 1) {
      animation = new Tween(targets[0], varsWithAutoPlay, void 0, true);
    } else {
      const tl = new Timeline({
        delay: varsWithAutoPlay.delay,
        onStart: varsWithAutoPlay.onStart,
        onUpdate: varsWithAutoPlay.onUpdate,
        onComplete: varsWithAutoPlay.onComplete,
        paused: true
      });
      const stagger = varsWithAutoPlay.stagger || 0;
      const tweenVars = { ...varsWithAutoPlay };
      delete tweenVars.delay;
      delete tweenVars.onStart;
      delete tweenVars.onUpdate;
      delete tweenVars.onComplete;
      delete tweenVars.stagger;
      delete tweenVars.scroll;
      targets.forEach((t, i) => {
        tl.from(t, tweenVars, i * stagger);
      });
      if (!hasScroll) {
        tl.play();
      }
      animation = tl;
    }
    if (hasScroll && vars.scroll) {
      new ScrollTrigger(animation, vars.scroll);
    }
    return animation;
  },
  /**
   * Creates an animation that goes FROM the values defined in 'fromVars'
   * TO the values defined in 'toVars'. Supports multiple targets, stagger, and scroll animator.
   */
  fromTo(target, fromVars, toVars) {
    const targets = resolveTargets(target);
    const hasScroll = toVars.scroll !== void 0;
    const toVarsWithAutoPlay = { ...toVars };
    if (hasScroll) {
      toVarsWithAutoPlay.autoPlay = false;
    }
    let animation;
    if (targets.length === 0) {
      animation = new Tween(null, toVarsWithAutoPlay, fromVars);
    } else if (targets.length === 1) {
      animation = new Tween(targets[0], toVarsWithAutoPlay, fromVars);
    } else {
      const tl = new Timeline({
        delay: toVarsWithAutoPlay.delay,
        onStart: toVarsWithAutoPlay.onStart,
        onUpdate: toVarsWithAutoPlay.onUpdate,
        onComplete: toVarsWithAutoPlay.onComplete,
        paused: true
      });
      const stagger = toVarsWithAutoPlay.stagger || 0;
      const tweenVars = { ...toVarsWithAutoPlay };
      delete tweenVars.delay;
      delete tweenVars.onStart;
      delete tweenVars.onUpdate;
      delete tweenVars.onComplete;
      delete tweenVars.stagger;
      delete tweenVars.scroll;
      targets.forEach((t, i) => {
        tl.fromTo(t, fromVars, tweenVars, i * stagger);
      });
      if (!hasScroll) {
        tl.play();
      }
      animation = tl;
    }
    if (hasScroll && toVars.scroll) {
      new ScrollTrigger(animation, toVars.scroll);
    }
    return animation;
  },
  /**
   * Creates a new Timeline instance for sequencing multiple animations.
   */
  timeline(vars) {
    const hasScroll = vars?.scroll !== void 0;
    const timelineVars = { ...vars };
    if (hasScroll) {
      timelineVars.paused = true;
    }
    const tl = new Timeline(timelineVars);
    if (hasScroll && vars?.scroll) {
      new ScrollTrigger(tl, vars.scroll);
    }
    return tl;
  },
  /**
   * Splits text of DOM elements into individual character or word spans,
   * making them ready for cascaded stagger animations.
   */
  splitText(target, options) {
    return splitText(target, options);
  },
  /**
   * Animates the outline drawing of SVG paths.
   */
  drawSVG(target, vars) {
    const hasScroll = vars.scroll !== void 0;
    const varsWithAutoPlay = { ...vars };
    if (hasScroll) {
      varsWithAutoPlay.autoPlay = false;
    }
    const tween = drawSVG(target, varsWithAutoPlay);
    if (hasScroll && vars.scroll) {
      new ScrollTrigger(tween, vars.scroll);
    }
    return tween;
  },
  magnetic(target, options) {
    magnetic(target, options);
  },
  tilt(target, options) {
    tilt(target, options);
  },
  explodeOnScroll(target, options) {
    explodeOnScroll(target, options);
  },
  implodeOnScroll(target, options) {
    implodeOnScroll(target, options);
  },
  revealText(target, options) {
    revealText(target, options);
  },
  scrollReveal(target, options) {
    scrollReveal(target, options);
  },
  slidingMenu(container, links, pill, options) {
    slidingMenu(container, links, pill, options);
  },
  killAllTriggers() {
    ScrollTrigger.killAll();
  }
};
export {
  ScrollTrigger,
  Timeline,
  Tween,
  drawSVG,
  easings,
  explodeOnScroll,
  fluxo,
  implodeOnScroll,
  magnetic,
  resolveTargets,
  revealText,
  scrollReveal,
  slidingMenu,
  splitText,
  ticker,
  tilt
};
