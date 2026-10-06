/** A brief homepage welcome. The page stays usable if animation is unavailable. */
export function initStartupIntro() {
  const intro = document.querySelector<HTMLDialogElement>("#studio-intro");
  const skip = intro?.querySelector<HTMLButtonElement>(".intro-skip");
  const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
  const navigation = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  if (
    !intro ||
    !skip ||
    preference.matches ||
    location.hash ||
    window.scrollY > 0 ||
    document.hidden ||
    navigation?.type === "back_forward" ||
    typeof intro.showModal !== "function" ||
    typeof intro.animate !== "function"
  ) return;

  const animations: Animation[] = [];
  let resolveIntro = () => {};
  const complete = new Promise<void>((resolve) => { resolveIntro = resolve; });
  let finished = false;
  let safetyTimer: ReturnType<typeof setTimeout>;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safetyTimer);
    if (intro.open) intro.close();
    animations.forEach((animation) => animation.cancel());
    skip.removeEventListener("click", finish);
    intro.removeEventListener("cancel", onCancel);
    intro.removeEventListener("wheel", stopScroll);
    intro.removeEventListener("keydown", stopScrollKeys);
    preference.removeEventListener("change", onPreferenceChange);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("pagehide", finish);
    resolveIntro();
  };
  const onCancel = (event: Event) => {
    event.preventDefault();
    finish();
  };
  const stopScroll = (event: Event) => event.preventDefault();
  const stopScrollKeys = (event: KeyboardEvent) => {
    if ([" ", "ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End"].includes(event.key)) {
      event.preventDefault();
    }
  };
  const onPreferenceChange = () => { if (preference.matches) finish(); };
  const onVisibilityChange = () => { if (document.hidden) finish(); };
  const animate = (
    selector: string,
    frames: Keyframe[],
    duration: number,
    delay: number,
  ) => {
    const element = intro.querySelector(selector);
    if (!element) return;
    animations.push(element.animate(frames, {
      duration,
      delay,
      easing: "cubic-bezier(.16,1,.3,1)",
      fill: "both",
    }));
  };

  try {
    // Independent of Three.js: a graphics failure cannot strand the intro.
    safetyTimer = setTimeout(finish, 3400);
    skip.addEventListener("click", finish);
    intro.addEventListener("cancel", onCancel);
    intro.addEventListener("wheel", stopScroll, { passive: false });
    intro.addEventListener("keydown", stopScrollKeys);
    preference.addEventListener("change", onPreferenceChange);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", finish);
    intro.showModal();

    animate(".intro-piece-left", [
      { opacity: 0, transform: "translate(-22px, 12px) rotate(-18deg) scale(.82)" },
      { opacity: 1, transform: "translate(0, 0) rotate(0deg) scale(1)" },
    ], 900, 80);
    animate(".intro-piece-right", [
      { opacity: 0, transform: "translate(22px, 12px) rotate(18deg) scale(.82)" },
      { opacity: 1, transform: "translate(0, 0) rotate(0deg) scale(1)" },
    ], 900, 170);
    animate(".intro-piece-bar", [
      { opacity: 0, transform: "translateY(20px) scale(.6)" },
      { opacity: 1, transform: "translateY(0) scale(1)" },
    ], 650, 420);
    animate(".intro-halo", [
      { opacity: 0, transform: "scale(.7)" },
      { opacity: .7, transform: "scale(1.05)", offset: .5 },
      { opacity: .35, transform: "scale(1.2)" },
    ], 1600, 80);
    animate(".intro-name", [
      { opacity: 0, transform: "translateY(18px)", filter: "blur(8px)" },
      { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
    ], 750, 650);
    animate(".intro-sweep", [
      { opacity: 0, transform: "translateX(-110%)" },
      { opacity: .85, offset: .25 },
      { opacity: 0, transform: "translateX(110%)" },
    ], 1000, 700);
    animate(".intro-caption", [{ opacity: 0 }, { opacity: 1 }], 650, 1000);
    animate(".intro-baseline span", [
      { transform: "scaleX(0)" }, { transform: "scaleX(1)" },
    ], 1800, 100);
    const exit = intro.animate([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(-12px)" },
    ], { duration: 600, delay: 1900, easing: "ease-in-out", fill: "both" });
    animations.push(exit);
    void exit.finished.then(finish, finish);
  } catch {
    finish();
  }
  return complete;
}
