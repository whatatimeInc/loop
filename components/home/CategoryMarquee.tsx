"use client";

const CATEGORIES: { label: string; icon: React.ReactNode }[] = [
  {
    label: "Carreira e Negócios",
    icon: (
      <svg width="24" height="24" viewBox="0 0 50.1 50" fill="none">
        <defs>
          <clipPath id="mq-car-cp0"><polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1"/></clipPath>
          <clipPath id="mq-car-cp1"><polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1"/></clipPath>
          <clipPath id="mq-car-cp2"><polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1"/></clipPath>
        </defs>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp0)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M29.5,16.9L1.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="1 33.1 1.1 .5 29.5 16.9 29.4 49.5 1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp1)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M11.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M39.5,16.9L11.1.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="11.1 33.1 11.1 .5 39.5 16.9 39.4 49.5 11.1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-car-cp2)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M21.8,32.7V1.7c0,0,27,15.6,27,15.6v31c0,0-27-15.6-27-15.6M49.5,16.9L21.2.5v32.6c0,0,28.3,16.4,28.3,16.4V16.9"/></g>
          <polygon points="21.1 33.1 21.2 .5 49.5 16.9 49.4 49.5 21.1 33.1" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Saúde e Bem-Estar",
    icon: (
      <svg width="24" height="24" viewBox="0 0 42.8 43.5" fill="none">
        <g stroke="#272618" strokeWidth="2" strokeMiterlimit="10">
          <line x1="21.3" y1="0" x2="21.3" y2="12"/>
          <line x1="8.6" y1="4.2" x2="15.6" y2="13.9"/>
          <line x1=".7" y1="15.1" x2="12.1" y2="18.8"/>
          <line x1=".7" y1="28.5" x2="12.1" y2="24.8"/>
          <line x1="8.7" y1="39.4" x2="15.7" y2="29.7"/>
          <line x1="21.5" y1="43.5" x2="21.5" y2="31.5"/>
          <line x1="34.2" y1="39.3" x2="27.2" y2="29.6"/>
          <line x1="42.1" y1="28.4" x2="30.7" y2="24.7"/>
          <line x1="42" y1="15" x2="30.6" y2="18.7"/>
          <line x1="34.1" y1="4.2" x2="27.1" y2="13.9"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Tecnologia",
    icon: (
      <svg width="24" height="24" viewBox="0 0 58.5 51.8" fill="none">
        <defs>
          <clipPath id="mq-tec-cp0"><polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5"/></clipPath>
          <clipPath id="mq-tec-cp1"><polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9"/></clipPath>
          <clipPath id="mq-tec-cp2"><polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3"/></clipPath>
        </defs>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp0)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,34.5l27.5-16,27.7,16-27.5,16L1.9,34.5M58.5,34.5l-29.1-16.8L.5,34.5l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 34.5 29.4 17.7 58.5 34.5 29.6 51.3 .5 34.5" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp1)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,25.9l27.5-16,27.7,16-27.5,16L1.9,25.9M58.5,25.9L29.4,9.1.5,25.9l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 25.9 29.4 9.1 58.5 25.9 29.6 42.7 .5 25.9" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
        <g style={{ isolation: "isolate" as const }}>
          <g clipPath="url(#mq-tec-cp2)"><path stroke="#272618" strokeWidth=".5" strokeMiterlimit="10" d="M1.9,17.3L29.4,1.3l27.7,16-27.5,16L1.9,17.3M58.5,17.3L29.4.5.5,17.3l29.1,16.8,28.9-16.8"/></g>
          <polygon points=".5 17.3 29.4 .5 58.5 17.3 29.6 34.1 .5 17.3" fill="none" stroke="#272618" strokeWidth=".5" strokeMiterlimit="10"/>
        </g>
      </svg>
    ),
  },
  {
    label: "Moda e Lifestyle",
    icon: (
      <svg width="24" height="24" viewBox="0 0 48.9 48.5" fill="#272618">
        <path d="M24.7,2.8l21.4,21.4-21.4,21.4L3.3,24.2,24.7,2.8M24.7,0L.5,24.2l24.2,24.2,24.2-24.2L24.7,0h0Z"/>
        <path d="M34.8,14.1v20.2H14.6V14.1h20.2M36.8,12.1H12.6v24.2h24.2V12.1h0Z"/>
        <path d="M24.7,14.9l9.3,9.3-9.3,9.3-9.3-9.3,9.3-9.3M24.7,12.1l-12.1,12.1,12.1,12.1,12.1-12.1-12.1-12.1h0Z"/>
      </svg>
    ),
  },
  {
    label: "Criatividade",
    icon: (
      <svg width="24" height="24" viewBox="0 0 40.5 40" fill="#272618">
        <path d="M20.5,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2.5,29.9,2.5,20,10.5,2,20.5,2M20.5,0C9.4,0,.5,8.9.5,20s9,20,20,20,20-9,20-20S31.5,0,20.5,0h0Z"/>
        <path d="M20.5,18c5.5,0,10,4.5,10,10s-4.5,10-10,10-10-4.5-10-10,4.5-10,10-10M20.5,16c-6.6,0-12,5.4-12,12s5.4,12,12,12,12-5.4,12-12-5.4-12-12-12h0Z"/>
        <path d="M20.5,26c3.3,0,6,2.7,6,6s-2.7,6-6,6-6-2.7-6-6,2.7-6,6-6M20.5,24c-4.4,0-8,3.6-8,8s3.6,8,8,8,8-3.6,8-8-3.6-8-8-8h0Z"/>
      </svg>
    ),
  },
  {
    label: "Gastronomia",
    icon: (
      <svg width="24" height="24" viewBox="0 0 60 40" fill="#272618">
        <path d="M20,2c9.9,0,18,8.1,18,18s-8.1,18-18,18S2,29.9,2,20,10.1,2,20,2M20,0C9,0,0,9,0,20s9,20,20,20,20-9,20-20S31,0,20,0h0Z"/>
        <path d="M40,2c9.9,0,18,8.1,18,18s-8.1,18-18,18-18-8.1-18-18S30.1,2,40,2M40,0c-11,0-20,9-20,20s9,20,20,20,20-9,20-20S51,0,40,0h0Z"/>
      </svg>
    ),
  },
  {
    label: "Casa e Arquitetura",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 21h18M5 21V9l7-6 7 6v12" stroke="#272618" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <rect x="10" y="14" width="4" height="7" rx="0.5" stroke="#272618" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    label: "Arte e Design",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="#272618" strokeWidth="1.5"/>
        <circle cx="12" cy="12" r="3" fill="#272618"/>
      </svg>
    ),
  },
];

function Pill({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div
      style={{
        height: 64,
        padding: "0 24px",
        background: "#fff",
        borderRadius: 4,
        display: "flex",
        alignItems: "center",
        gap: 16,
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</div>
      <span style={{ color: "#272518", fontSize: 20, fontWeight: 400, lineHeight: "24px" }}>
        {label}
      </span>
    </div>
  );
}

export function CategoryMarquee() {
  const items = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  return (
    <div style={{ width: "100%", overflow: "hidden", marginTop: 48 }}>
      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-33.333%); }
        }
        .marquee-track {
          display: flex;
          gap: 12px;
          animation: marquee 28s linear infinite;
          width: max-content;
        }
        .marquee-track:hover { animation-play-state: paused; }
      `}</style>
      <div className="marquee-track">
        {items.map((cat, i) => (
          <Pill key={i} label={cat.label} icon={cat.icon} />
        ))}
      </div>
    </div>
  );
}
