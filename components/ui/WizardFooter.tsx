import { tokens } from "./tokens";

interface WizardFooterProps {
  step: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  canAdvance: boolean;
  nextLabel?: string;
  backLabel?: string;
  saving?: boolean;
  error?: string | null;
}

function IcoArrowLeft() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}

function IcoArrowRight() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}

export function WizardFooter({
  step,
  totalSteps,
  onBack,
  onNext,
  canAdvance,
  nextLabel = "Próximo",
  backLabel = "Voltar",
  saving = false,
  error,
}: WizardFooterProps) {
  const showBack = step > 0;
  const active   = canAdvance && !saving;

  return (
    <footer style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50,
      display: "flex", flexDirection: "column",
    }}>
      {/* Progress bar — full width, flush */}
      <div style={{ display: "flex", height: 4 }}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: i <= step ? tokens.lime : tokens.borderSubtle,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>

      {/* Nav row */}
      <div style={{
        display: "flex", alignItems: "center",
        justifyContent: showBack ? "space-between" : "flex-end",
        padding: "16px 20px 20px",
        background: "color-mix(in srgb, var(--color-bg-white) 50%, transparent)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}>
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: 0, border: "none", background: "none",
              color: tokens.dark, fontSize: 16, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            <IcoArrowLeft />
            {backLabel}
          </button>
        )}

        <button
          type="button"
          onClick={onNext}
          disabled={!active}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "12px 20px", borderRadius: 8, border: "none",
            background: active ? tokens.dark : tokens.borderSubtle,
            color: active ? "var(--color-cream)" : tokens.faint,
            fontSize: 16, fontWeight: 600,
            cursor: active ? "pointer" : "not-allowed",
            fontFamily: "inherit", transition: "all 0.2s",
          }}
        >
          {saving ? "Aguarde..." : nextLabel}
          {!saving && <IcoArrowRight />}
        </button>
      </div>

      {error && (
        <p style={{
          fontSize: 12, color: tokens.red,
          textAlign: "center", margin: "0 0 8px",
        }}>
          {error}
        </p>
      )}
    </footer>
  );
}
