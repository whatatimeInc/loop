"use client";

import { useId, useRef, type ChangeEvent } from "react";
import { tokens } from "@/components/ui/tokens";

/**
 * FolderFrame — avatar "pasta" do onboarding do Mentor (Loop.Talk)
 *
 * Camadas (de baixo para cima), todas sobre o mesmo canvas 193×234:
 *   1. Decoration (cartões amarelo + bege, atrás/à direita)
 *   2. Foto do mentor  ↔  Placeholder branco com câmera (um OU outro, conforme estado)
 *   3. Pasta preta (capa chanfrada da frente, cobre a base)
 *   4. Nome manuscrito (fonte "Nerfos") sobre a capa
 *   5. Botão de ação (+ quando vazio, lápis quando preenchido)
 *
 * Geometria do slot da foto (lida do 2-Foto-Placeholder / 4-Foto-Slot):
 *   x=26.834  y=0  w=137  h=169  rx=24  — num canvas de 193×234.
 * A foto entra exatamente nesse retângulo com object-fit: cover.
 *
 * O componente escala mantendo a proporção 193:234. Defina a largura via a
 * prop `width` (ou por CSS no elemento pai); a altura acompanha sozinha.
 */

const CANVAS_W = 193;
const CANVAS_H = 234;

// Slot da foto em porcentagem do canvas (para escalar junto com o container)
const SLOT = {
  left: (26.834 / CANVAS_W) * 100,
  top: 0,
  width: (137 / CANVAS_W) * 100,
  height: (169 / CANVAS_H) * 100,
  // raio proporcional à largura do container (24 num canvas de 193 de largura)
  radius: (24 / CANVAS_W) * 100,
};

export interface FolderFrameProps {
  /** URL da foto do mentor. Se ausente, mostra o placeholder com câmera. */
  photoUrl?: string | null;
  /** Nome do mentor (renderizado sobre a capa, em Nerfos). */
  firstName?: string;
  /** Sobrenome do mentor. */
  lastName?: string;
  /** Chamado quando o usuário escolhe um arquivo de imagem. */
  onPhotoSelect?: (file: File) => void;
  /** Largura em px do frame (a altura é derivada pela proporção). Default 193. */
  width?: number;
  /** Classe extra para o container externo. */
  className?: string;
}

export function FolderFrame({
  photoUrl,
  firstName = "",
  lastName = "",
  onPhotoSelect,
  width = CANVAS_W,
  className,
}: FolderFrameProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  // IDs únicos por instância — evita colisão do clip-path do Decoration no DOM.
  const uid = useId().replace(/:/g, "");
  const decoClipId = `folder-deco-clip-${uid}`;

  const hasPhoto = Boolean(photoUrl);
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();

  function openPicker() {
    inputRef.current?.click();
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onPhotoSelect?.(file);
    // permite re-selecionar o mesmo arquivo depois
    e.target.value = "";
  }

  const height = (width * CANVAS_H) / CANVAS_W;

  return (
    <div
      className={className}
      style={{ position: "relative", width, height }}
    >
      {/* ---------- Camada 1: Decoration (amarelo + bege) ---------- */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ position: "absolute", inset: 0, zIndex: 1 }}
        aria-hidden="true"
      >
        <g clipPath={`url(#${decoClipId})`}>
          <path
            d="M165.525 55.3413L108.388 47.6067C101.833 46.7193 95.7992 51.3063 94.9106 57.852L84.4432 134.959C83.5546 141.505 88.148 147.531 94.7029 148.418L151.84 156.152C158.394 157.04 164.429 152.453 165.317 145.907L175.785 68.7999C176.673 62.2542 172.08 56.2286 165.525 55.3413Z"
            fill={tokens.lime}
          />
          <path
            d="M180.669 89.2264L117.691 70.884C111.341 69.0345 104.692 72.6758 102.84 79.0171L80.5429 155.357C78.6907 161.698 82.3372 168.338 88.6874 170.188L151.665 188.53C158.015 190.38 164.665 186.739 166.517 180.397L188.814 104.057C190.666 97.716 187.019 91.076 180.669 89.2264Z"
            fill="#E0DDC1"
          />
        </g>
        <defs>
          <clipPath id={decoClipId}>
            <rect width="192.166" height="234" fill="white" />
          </clipPath>
        </defs>
      </svg>

      {/* ---------- Camada 2: Foto OU Placeholder ---------- */}
      {hasPhoto ? (
        <img
          src={photoUrl as string}
          alt={fullName ? `Foto de ${fullName}` : "Foto do perfil"}
          style={{
            position: "absolute",
            left: `${SLOT.left}%`,
            top: `${SLOT.top}%`,
            width: `${SLOT.width}%`,
            height: `${SLOT.height}%`,
            objectFit: "cover",
            borderRadius: `${SLOT.radius}%`,
            zIndex: 2,
          }}
        />
      ) : (
        <svg
          width={width}
          height={height}
          viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0, zIndex: 2 }}
          aria-hidden="true"
        >
          <rect x="26.834" width="137" height="169" rx="24" fill="white" />
          <path
            d="M110.5 68.3333C110.5 69.0406 110.219 69.7189 109.719 70.219C109.219 70.719 108.541 71 107.834 71H83.8337C83.1264 71 82.4481 70.719 81.948 70.219C81.4479 69.7189 81.167 69.0406 81.167 68.3333V53.6667C81.167 52.9594 81.4479 52.2811 81.948 51.781C82.4481 51.281 83.1264 51 83.8337 51H89.167L91.8337 47H99.8337L102.5 51H107.834C108.541 51 109.219 51.281 109.719 51.781C110.219 52.2811 110.5 52.9594 110.5 53.6667V68.3333Z"
            stroke="#AEADA4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M95.8337 65.6667C98.7792 65.6667 101.167 63.2789 101.167 60.3333C101.167 57.3878 98.7792 55 95.8337 55C92.8881 55 90.5003 57.3878 90.5003 60.3333C90.5003 63.2789 92.8881 65.6667 95.8337 65.6667Z"
            stroke="#AEADA4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}

      {/* ---------- Camada 3: Pasta preta (capa chanfrada) ---------- */}
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${CANVAS_W} ${CANVAS_H}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 3,
          pointerEvents: "none",
        }}
        aria-hidden="true"
      >
        <path
          d="M162.236 233.998H10.4345C5.13181 233.998 0.833984 229.719 0.833984 224.44V85.5577C0.833984 80.2786 5.13181 76 10.4345 76H51.4857C54.9235 76 58.251 77.2042 60.8839 79.4041C74.2235 90.5459 116.682 125.219 116.682 125.219L168.635 171.494C170.67 173.307 171.834 175.899 171.834 178.618V224.442C171.834 229.721 167.536 234 162.233 234L162.236 233.998Z"
          fill="#272618"
        />
      </svg>

      {/* ---------- Camada 4: Nome manuscrito (Nerfos) ---------- */}
      {fullName && (
        <span
          style={{
            position: "absolute",
            // valores lidos do SVG de referência (baseline ~x16 / y197 no canvas 193x234)
            left: `${(16 / CANVAS_W) * 100}%`,
            top: `${(188 / CANVAS_H) * 100}%`,
            zIndex: 4,
            fontFamily: "Nerfos, cursive",
            color: "#FCFBF8",
            fontSize: `${width * (20 / 220)}px`,
            lineHeight: 1,
            pointerEvents: "none",
            maxWidth: "68%",
            whiteSpace: "nowrap",
          }}
        >
          {fullName}
        </span>
      )}

      {/* ---------- Camada 5: Botão de ação (+ / lápis) ---------- */}
      <button
        type="button"
        onClick={openPicker}
        aria-label={hasPhoto ? "Editar foto" : "Adicionar foto"}
        style={{
          position: "absolute",
          // valores lidos do SVG de referência: 32x32, rx16, x129 y4 no canvas 193x234
          top: `${(4 / CANVAS_H) * 100}%`,
          left: `${(129 / CANVAS_W) * 100}%`,
          zIndex: 5,
          width: `${(32 / CANVAS_W) * width}px`,
          height: `${(32 / CANVAS_W) * width}px`,
          borderRadius: "9999px",
          background: "#FCFBF8",
          border: `1px solid #8E8857`,
          boxShadow: "0 1px 2px rgba(10,13,18,0.05)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          padding: 0,
        }}
      >
        {hasPhoto ? (
          // lápis (editar)
          <svg
            width="55%"
            height="55%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#272618"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
        ) : (
          // + (adicionar)
          <svg
            width="55%"
            height="55%"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#6B6A5E"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
        )}
      </button>

      {/* input de arquivo escondido */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{ display: "none" }}
      />
    </div>
  );
}

export default FolderFrame;
