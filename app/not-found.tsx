import Link from "next/link";

// Rendered for notFound() and for unmatched URLs. A 404 is not an incident, so
// nothing is reported from here.
export default function NotFound() {
  return (
    <main
      className="min-h-[70vh] flex flex-col items-center justify-center text-center px-6 py-16"
      style={{ background: "var(--color-bg-subtle)", color: "var(--color-dark)" }}
    >
      <p className="text-sm uppercase tracking-widest" style={{ color: "var(--color-gray-500)" }}>
        Erro 404
      </p>
      <h1 className="mt-3 text-3xl md:text-4xl font-medium" style={{ fontFamily: "var(--font-display)" }}>
        Essa página não existe
      </h1>
      <p className="mt-4 max-w-md" style={{ color: "var(--color-gray-600)" }}>
        O link pode estar errado ou a página foi movida.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full px-6 py-3 font-medium"
        style={{ background: "var(--color-lime)", color: "var(--color-dark)" }}
      >
        Ir para o início
      </Link>
    </main>
  );
}
