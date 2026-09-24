"use client";

// Route-level error boundary. Wraps every page under the root layout, so the
// header, fonts and global styles are still there when this renders. Errors
// thrown in Server Components arrive with their message replaced by a generic
// one and a `digest`; the digest is what matches the server log and the Sentry
// event, so it is shown to the user to quote back.
import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";

export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, { tags: { boundary: "app/error" } });
  }, [error]);

  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16"
      style={{ background: "var(--color-bg-subtle)", color: "var(--color-dark)" }}
    >
      <p className="text-sm uppercase tracking-widest" style={{ color: "var(--color-error)" }}>
        Algo deu errado
      </p>
      <h1 className="mt-3 text-3xl md:text-4xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
        Não conseguimos carregar esta página
      </h1>
      <p className="mt-4 max-w-md" style={{ color: "var(--color-gray-600)" }}>
        Você pode tentar de novo ou voltar para o início.{error.digest ? " Se continuar acontecendo, informe o código abaixo." : null}
      </p>
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <button
          type="button"
          onClick={() => unstable_retry()}
          className="rounded-full px-6 py-3 font-medium"
          style={{ background: "var(--color-lime)", color: "var(--color-dark)" }}
        >
          Tentar de novo
        </button>
        <Link
          href="/"
          className="rounded-full px-6 py-3 font-medium border"
          style={{ borderColor: "var(--color-gray-300)", color: "var(--color-dark)" }}
        >
          Ir para o início
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-10 text-xs" style={{ color: "var(--color-gray-500)" }}>
          Código do erro: <code>{error.digest}</code>
        </p>
      ) : null}
    </main>
  );
}
