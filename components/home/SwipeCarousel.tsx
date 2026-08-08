"use client";

/**
 * Horizontal swipe carousel built on native CSS scroll-snap — no JS, no
 * indicator. Extracted from the expert section (Fatia 4) so the creators
 * section can share the same behaviour.
 *
 * Geometry notes worth keeping:
 * - `mandatory` is what guarantees a swipe always lands on a whole card, and
 *   `scroll-snap-stop: always` stops a fast flick from skipping one.
 * - Slides need `min-width: 0`, or a slide whose content has a wide intrinsic
 *   width (a long flex row, for instance) stretches past the viewport and
 *   breaks the snap rhythm.
 * - Sizing the rail in vw rather than % is what lets a centre-aligned first and
 *   last card reach a true centred snap instead of clamping at the edges.
 */
export function SwipeCarousel({
  name,
  align = "center",
  slideBasis,
  padStart,
  padEnd,
  slidePadding = 0,
  gap = 0,
  style,
  children,
}: {
  /** Unique per usage — scopes the generated CSS to this carousel. */
  name:         string;
  align?:       "start" | "center";
  /** Flex-basis of each slide, e.g. "82vw". */
  slideBasis:   string;
  /** Leading rail padding; also the scroll-padding, so `start` snaps land here. */
  padStart:     string;
  padEnd:       string;
  /** Inner padding on each slide (gutter lives inside the slide). */
  slidePadding?: number;
  /** Gutter between slides (alternative to slidePadding). */
  gap?:          number;
  style?:        React.CSSProperties;
  children:      React.ReactNode;
}) {
  const cls = `swipe-${name}`;

  const css = `
    .${cls} {
      display: flex;
      overflow-x: auto;
      overflow-y: hidden;
      scroll-snap-type: x mandatory;
      -webkit-overflow-scrolling: touch;
      overscroll-behavior-x: contain;
      scrollbar-width: none;
      padding-left: ${padStart};
      padding-right: ${padEnd};
      scroll-padding-left: ${padStart};
      scroll-padding-right: ${padEnd};
      ${gap ? `gap: ${gap}px;` : ""}
    }
    .${cls}::-webkit-scrollbar { display: none; }
    .${cls} > * {
      flex: 0 0 ${slideBasis};
      min-width: 0;
      box-sizing: border-box;
      ${slidePadding ? `padding-inline: ${slidePadding}px;` : ""}
      scroll-snap-align: ${align};
      scroll-snap-stop: always;
    }
    /* Safari/Chrome drop a scroll container's trailing padding; this restores
       it so the last card can settle without hugging the screen edge. The
       negative margin cancels the gap it would otherwise inherit, which would
       push the last card away from the trailing margin. */
    .${cls}::after {
      content: "";
      flex: 0 0 1px;
      ${gap ? `margin-left: -${gap}px;` : ""}
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      <div className={cls} style={style}>
        {children}
      </div>
    </>
  );
}
