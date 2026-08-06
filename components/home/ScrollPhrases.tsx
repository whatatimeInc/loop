"use client";

import { useEffect, useRef } from "react";

// Kick off GSAP loading at module-parse time (before any component mounts),
// so the import is resolved by the time the user scrolls to this section.
const gsapReady =
  typeof window !== "undefined"
    ? Promise.all([import("gsap"), import("gsap/ScrollTrigger")])
    : null;

const PHRASES = [
  "Você tem algo que vale a pena ouvir.",
  "Sua audiência quer acesso a você.",
] as const;

const phraseStyle: React.CSSProperties = {
  fontSize: "clamp(28px, 4vw, 52px)",
  fontWeight: 300,
  color: "#272518",
  textAlign: "center",
  maxWidth: 700,
  margin: 0,
  lineHeight: 1.2,
  fontFamily: "var(--font-host-grotesk)",
};

export function ScrollPhrases() {
  const sectionRef = useRef<HTMLElement>(null);
  const wrapRefs = useRef<(HTMLDivElement | null)[]>([null, null]);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;

    (async () => {
      const [{ gsap }, { ScrollTrigger }] = await (gsapReady ?? Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]));

      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const section = sectionRef.current;
      const [w0, w1] = wrapRefs.current;
      if (!section || !w0 || !w1) return;

      gsap.set(w0, { opacity: 1, y: 0 });
      gsap.set(w1, { opacity: 0, y: 20 });

      ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add("(min-width: 768px)", () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                pin: true,
                start: "top top",
                end: "+=150vh",
                scrub: 1,
              },
            })
            .to({}, { duration: 2.5 })
            .to(w0, { opacity: 0, y: -20, ease: "power2.inOut", duration: 0.5 })
            .to(w1, { opacity: 1, y: 0, ease: "power2.inOut", duration: 0.5 })
            .to({}, { duration: 3 });
        });

        mm.add("(max-width: 767px)", () => {
          gsap
            .timeline({
              scrollTrigger: {
                trigger: section,
                pin: true,
                start: "top top",
                end: "+=100vh",
                scrub: 1,
              },
            })
            .to({}, { duration: 2.5 })
            .to(w0, { opacity: 0, y: -20, ease: "power2.inOut", duration: 0.5 })
            .to(w1, { opacity: 1, y: 0, ease: "power2.inOut", duration: 0.5 })
            .to({}, { duration: 3 });
        });
      }, section);
    })();

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        height: "100vh",
        background: "#F4F2EB",
        position: "relative",
      }}
    >
      {PHRASES.map((phrase, i) => (
        <div
          key={phrase}
          ref={el => { wrapRefs.current[i] = el; }}
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 24px",
            boxSizing: "border-box",
            opacity: i === 0 ? 1 : 0,
          }}
        >
          <p style={phraseStyle}>{phrase}</p>
        </div>
      ))}
    </section>
  );
}
