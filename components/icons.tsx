// Ícones SVG inline — não usar libs externas
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

export function IconSearch(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

export function IconHeart(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

export function IconArrow(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function IconCheck(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function IconCalendar(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

export function IconVideo(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 10l4.553-2.277A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
    </svg>
  );
}

export function IconStar(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ——— Ícones de categoria (SVGs do Figma) ———

export function IconCategoriaCarreira(p: P) {
  return (
    <svg {...p} viewBox="0 0 50.1 50" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="cat-carreira-0">
          <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" />
        </clipPath>
        <clipPath id="cat-carreira-1">
          <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" />
        </clipPath>
        <clipPath id="cat-carreira-2">
          <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" />
        </clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-carreira-0)">
          <path d="M1.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M29.5,16.9L1.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-carreira-1)">
          <path d="M11.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M39.5,16.9L11.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-carreira-2)">
          <path d="M21.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M49.5,16.9L21.2.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
    </svg>
  );
}

export function IconCategoriaSaude(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <line x1="12" y1="2" x2="12" y2="5" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="4.93" x2="7.05" y2="7.05" />
      <line x1="16.95" y1="16.95" x2="19.07" y2="19.07" />
      <line x1="19.07" y1="4.93" x2="16.95" y2="7.05" />
      <line x1="7.05" y1="16.95" x2="4.93" y2="19.07" />
    </svg>
  );
}

export function IconCategoriaCasa(p: P) {
  return (
    <svg {...p} viewBox="0 0 58.5 51.8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="cat-casa-0">
          <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" />
        </clipPath>
        <clipPath id="cat-casa-1">
          <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" />
        </clipPath>
        <clipPath id="cat-casa-2">
          <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" />
        </clipPath>
      </defs>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-casa-0)">
          <path d="M1.9,34.5l27.5-16,27.7,16-27.5,16L1.9,34.5M58.5,34.5l-29.1-16.8L.5,34.5l29.1,16.8,28.9-16.8" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-casa-1)">
          <path d="M1.9,25.9l27.5-16,27.7,16-27.5,16L1.9,25.9M58.5,25.9L29.4,9.1.5,25.9l29.1,16.8,28.9-16.8" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
      <g style={{ isolation: "isolate" }}>
        <g clipPath="url(#cat-casa-2)">
          <path d="M1.9,17.3L29.4,1.3l27.7,16-27.5,16L1.9,17.3M58.5,17.3L29.4.5.5,17.3l29.1,16.8,28.9-16.8" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} fill="currentColor" />
        </g>
        <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} />
      </g>
    </svg>
  );
}

export function IconCategoriaModa(p: P) {
  return (
    <svg {...p} viewBox="0 0 48.9 48.5" fill="none" stroke="currentColor" strokeMiterlimit={10} strokeWidth={0.5} xmlns="http://www.w3.org/2000/svg">
      <path d="M24.7,2.8l21.4,21.4-21.4,21.4L3.3,24.2,24.7,2.8M24.7,0L.5,24.2l24.2,24.2,24.2-24.2L24.7,0h0Z" fill="currentColor" />
      <path d="M34.8,14.1v20.2H14.6V14.1h20.2M36.8,12.1H12.6v24.2h24.2V12.1h0Z" fill="currentColor" />
      <path d="M24.7,14.9l9.3,9.3-9.3,9.3-9.3-9.3,9.3-9.3M24.7,12.1l-12.1,12.1,12.1,12.1,12.1-12.1-12.1-12.1h0Z" fill="currentColor" />
    </svg>
  );
}

export function IconCategoriaArte(p: P) {
  return (
    <svg {...p} viewBox="0 0 40.5 40" fill="currentColor" stroke="currentColor" strokeWidth={0.5} strokeMiterlimit={10} xmlns="http://www.w3.org/2000/svg">
      <path d="M20.5,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2.5,29.9,2.5,20,10.5,2,20.5,2M20.5,0C9.4,0,.5,8.9.5,20s9,20,20,20,20-9,20-20S31.5,0,20.5,0h0Z" />
      <path d="M20.5,18c5.5,0,10,4.5,10,10s-4.5,10-10,10-10-4.5-10-10,4.5-10,10-10M20.5,16c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12-5.4-12-12-12h0Z" />
      <path d="M20.5,26c3.3,0,6,2.7,6,6s-2.7,6-6,6-6-2.7-6-6,2.7-6,6-6M20.5,24c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8-3.6-8-8-8h0Z" />
    </svg>
  );
}

export function IconCategoriaGastronomia(p: P) {
  return (
    <svg {...p} viewBox="0 0 60 40" fill="currentColor" stroke="currentColor" strokeWidth={0.5} strokeMiterlimit={10} xmlns="http://www.w3.org/2000/svg">
      <path d="M20,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2,29.9,2,20,10.1,2,20,2M20,0C9,0,0,9,0,20s9,20,20,20,20-9,20-20S31,0,20,0h0Z" />
      <path d="M40,2c9.9,0,18,8.1,18,18s-8.1,18-18,18-18-8.1-18-18S30.1,2,40,2M40,0c-11,0-20,9-20,20s9,20,20,20,20-9,20-20S51,0,40,0h0Z" />
    </svg>
  );
}

export function IconCopy(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconShare(p: P) {
  return (
    <svg {...p} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}
