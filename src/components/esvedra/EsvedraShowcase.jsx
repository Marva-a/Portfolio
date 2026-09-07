import { useEffect, useRef } from "react";
import { useInView, useReducedMotion } from "framer-motion";

/**
 * Esvedra's project card. Same headset-reveal intro as the case study hero
 * (public/case-studies/esvedra/index.html): a VR headset icon turns face-on
 * and pushes toward the viewer, its two lenses already playing the real
 * footage, until it dissolves into the same clip at full size. Re-implemented
 * here (rather than reusing the static page directly) since this card runs
 * inside the React app and needs to pause when scrolled out of view, the
 * same contract as PersustainShowcase/AwemeShowcase.
 */

const HERO_SRC = `${import.meta.env.BASE_URL}case-studies/esvedra/assets/esvedra-hero.mp4`;

export default function EsvedraShowcase({ variant = "featured" }) {
  const rootRef = useRef(null);
  const videoRef = useRef(null);
  const lensRefs = useRef([]);
  const overlayRef = useRef(null);
  const iconRef = useRef(null);
  const frameRef = useRef(null);
  const reduced = useReducedMotion();
  const inView = useInView(rootRef, { amount: 0.35 });

  useEffect(() => {
    const video = videoRef.current;
    const overlay = overlayRef.current;
    const icon = iconRef.current;
    const frame = frameRef.current;
    if (!video || !overlay || !icon || !frame) return;
    const allVideos = [video, ...lensRefs.current.filter(Boolean)];

    if (reduced) {
      overlay.style.display = "none";
      if (inView) video.play().catch(() => {});
      else video.pause();
      return;
    }

    if (!inView) {
      allVideos.forEach((v) => v.pause());
      return;
    }

    function playIntro() {
      overlay.style.display = "flex";
      [overlay, icon, frame].forEach((el) => el.classList.remove("esvc-play"));
      void overlay.offsetWidth; // restart the CSS animations
      [overlay, icon, frame].forEach((el) => el.classList.add("esvc-play"));
    }
    function restartAll() {
      allVideos.forEach((v) => {
        v.currentTime = 0;
        v.play().catch(() => {});
      });
    }
    function handleOverlayEnd(e) {
      if (e.animationName === "esvc-overlay-fade") overlay.style.display = "none";
    }
    function handleVideoEnded() {
      playIntro();
      restartAll();
    }

    overlay.addEventListener("animationend", handleOverlayEnd);
    video.addEventListener("ended", handleVideoEnded);
    playIntro();
    restartAll();

    return () => {
      overlay.removeEventListener("animationend", handleOverlayEnd);
      video.removeEventListener("ended", handleVideoEnded);
    };
  }, [inView, reduced]);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl bg-[#1c1833]"
    >
      <video
        ref={videoRef}
        muted
        playsInline
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src={HERO_SRC} type="video/mp4" />
      </video>

      <div
        ref={overlayRef}
        className="esvc-overlay absolute inset-0 flex items-center justify-center bg-[#1c1833]"
        style={{ perspective: 900 }}
      >
        <div
          ref={iconRef}
          className="esvc-icon relative"
          style={{ width: variant === "compact" ? "42%" : "34%", aspectRatio: "120 / 72" }}
        >
          <svg
            ref={frameRef}
            className="esvc-frame absolute inset-0"
            viewBox="0 0 120 72"
            fill="none"
            style={{ overflow: "visible" }}
          >
            <rect x="4" y="4" width="112" height="64" rx="24" stroke="#fff7e8" strokeWidth="3" />
            <path d="M4 30 C -8 30 -8 46 4 46" stroke="#fff7e8" strokeWidth="3" strokeLinecap="round" />
            <path d="M116 30 C 128 30 128 46 116 46" stroke="#fff7e8" strokeWidth="3" strokeLinecap="round" />
          </svg>
          {[0, 1].map((i) => (
            <div
              key={i}
              className="absolute overflow-hidden rounded-full border-[3px] border-[#8f74ff]"
              style={{ left: i === 0 ? "19.17%" : "55.83%", top: "29.17%", width: "25%", aspectRatio: "1" }}
            >
              <video
                ref={(el) => (lensRefs.current[i] = el)}
                muted
                playsInline
                className="absolute left-1/2 top-1/2 h-[230%] w-[230%] -translate-x-1/2 -translate-y-1/2 object-cover"
              >
                <source src={HERO_SRC} type="video/mp4" />
              </video>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
