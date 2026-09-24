"use client";

// Last-resort boundary: replaces the root layout when the layout itself
// throws, so it must bring its own <html>/<body> and styles. Fonts are not
// loaded here on purpose — this page must render even when everything else
// failed, and the system font stack needs nothing.
import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { boundary: "app/global-error" } });
  }, [error]);

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "4rem 1.5rem",
          background: "var(--color-bg-subtle)",
          color: "var(--color-dark)",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
        }}
      >
        <title>Algo deu errado — Loop.Talk</title>
        <div>
          <p style={{ fontSize: "0.875rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-error)" }}>
            Algo deu errado
          </p>
          <h1 style={{ marginTop: "0.75rem", fontSize: "2rem", fontWeight: 500 }}>
            O Loop.Talk não conseguiu carregar
          </h1>
          <p style={{ marginTop: "1rem", maxWidth: "28rem", color: "var(--color-gray-600)" }}>
            Tente recarregar a página em instantes.{error.digest ? " Se continuar acontecendo, informe o código abaixo." : null}
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            style={{
              marginTop: "2rem",
              border: 0,
              borderRadius: "9999px",
              padding: "0.75rem 1.5rem",
              fontWeight: 500,
              cursor: "pointer",
              background: "var(--color-lime)",
              color: "var(--color-dark)",
            }}
          >
            Recarregar
          </button>
          {error.digest ? (
            <p style={{ marginTop: "2.5rem", fontSize: "0.75rem", color: "var(--color-gray-500)" }}>
              Código do erro: <code>{error.digest}</code>
            </p>
          ) : null}
        </div>
      </body>
    </html>
  );
}
