export const metadata = { title: "Avaliações — Loop.Talk" };

export default function AvaliacoesPage() {
  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 500,
          color: "var(--color-gray-900)",
          marginBottom: 32,
          fontFamily: "var(--font-host-grotesk)",
        }}
      >
        Avaliações
      </h1>

      <div
        style={{
          textAlign: "center",
          padding: "80px 0",
          color: "var(--color-gray-400)",
        }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ margin: "0 auto 16px", display: "block" }}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <p style={{ fontSize: 16, marginBottom: 8 }}>Nenhuma avaliação ainda</p>
        <p style={{ fontSize: 14, color: "#C4C2B9" }}>
          Avaliações das suas sessões aparecerão aqui.
        </p>
      </div>
    </div>
  );
}
