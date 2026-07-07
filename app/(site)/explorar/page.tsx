"use client";

import { useState } from "react";
import { experts, categorias, Categoria } from "@/lib/mockExperts";
import { ExpertCard } from "@/components/ExpertCard";
import Link from "next/link";
import {
  IconSearch,
  IconCategoriaCarreira,
  IconCategoriaSaude,
  IconCategoriaCasa,
  IconCategoriaModa,
  IconCategoriaArte,
  IconCategoriaGastronomia,
} from "@/components/icons";
import type { ReactNode } from "react";

const categoriaIcones: Record<string, ReactNode> = {
  "Carreira e Negócios": <IconCategoriaCarreira className="w-5 h-5 flex-shrink-0" />,
  "Saúde e Bem estar":   <IconCategoriaSaude    className="w-5 h-5 flex-shrink-0" />,
  "Criatividade":        <IconCategoriaArte     className="w-5 h-5 flex-shrink-0" />,
  "Gastronomia":         <IconCategoriaGastronomia className="w-5 h-5 flex-shrink-0" />,
  "Estilo de Vida":      <IconCategoriaModa     className="w-5 h-5 flex-shrink-0" />,
  "Tecnologia":          <IconCategoriaCasa     className="w-5 h-5 flex-shrink-0" />,
};

export default function Explorar() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | null>(null);

  const modoFiltrado = busca !== "" || categoriaAtiva !== null;

  const expertsFiltrados = experts.filter((e) => {
    const buscaOk =
      busca === "" ||
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.bio.toLowerCase().includes(busca.toLowerCase()) ||
      e.categoria.toLowerCase().includes(busca.toLowerCase());
    const categoriaOk = categoriaAtiva === null || e.categoria === categoriaAtiva;
    return buscaOk && categoriaOk;
  });

  const categoriasFiltradas = categoriaAtiva ? [categoriaAtiva] : categorias;

  return (
    <div className="min-h-screen" style={{ background: "#FCFBF8" }}>

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section className="pt-28 pb-12 px-6">
        <div className="max-w-[1194px] mx-auto flex flex-col items-center gap-10">

          {/* Headline + subtítulo */}
          <div className="flex flex-col items-center gap-4 max-w-[581px] text-center">
            <h1
              className="font-normal leading-tight"
              style={{ fontSize: 36, lineHeight: "44px", color: "#272518" }}
            >
              Fale com quem sabe. Agora.
            </h1>
            <p className="text-base" style={{ color: "#373525" }}>
              Especialistas que mudam negócios, vidas e histórias a um clique de você.
            </p>
          </div>

          {/* Barra de busca */}
          <form
            className="flex items-center gap-4"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative" style={{ width: 320 }}>
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: "#807F71" }} />
              <input
                type="text"
                placeholder="Buscar mentor"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full h-11 pl-9 pr-4 rounded border text-sm focus:outline-none focus:ring-2"
                style={{
                  background: "#FFFFFF",
                  borderColor: "#E9EAEB",
                  color: "#272518",
                  focusRingColor: "#EAEA68",
                }}
              />
            </div>
            <button
              type="submit"
              className="h-11 px-5 rounded flex items-center gap-2 text-sm font-semibold transition-opacity hover:opacity-80"
              style={{ background: "#EAEA68", color: "#272518" }}
            >
              <IconSearch className="w-4 h-4" />
              Buscar
            </button>
          </form>

        </div>
      </section>

      {/* ── CATEGORY FILTER BAR ───────────────────────────────── */}
      <section className="pb-12 px-6">
        <div className="max-w-[1194px] mx-auto flex items-center justify-center gap-4 flex-wrap">
          {categorias.map((cat) => {
            const ativo = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat === categoriaAtiva ? null : cat)}
                className="flex items-center gap-2 px-4 py-2.5 rounded text-sm font-semibold backdrop-blur-[20px]"
                style={{
                  background: ativo ? "#272518" : "rgba(255,255,255,0.40)",
                  color: ativo ? "#FDFDFD" : "#272518",
                  transition: "background 0.25s cubic-bezier(0.22,1,0.36,1), color 0.25s cubic-bezier(0.22,1,0.36,1)",
                }}
                onMouseEnter={(e) => {
                  if (!ativo) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.72)";
                  } else {
                    e.currentTarget.style.background = "#2a2926";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ativo ? "#272518" : "rgba(255,255,255,0.40)";
                }}
              >
                {categoriaIcones[cat]}
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── RESULTADOS FILTRADOS ──────────────────────────────── */}
      {modoFiltrado && (
        <section className="px-6 pb-12">
          <div className="max-w-[1194px] mx-auto">
            <p className="text-sm mb-6" style={{ color: "#626053" }}>
              {expertsFiltrados.length} resultado{expertsFiltrados.length !== 1 ? "s" : ""}
              {busca && ` para "${busca}"`}
            </p>
            {expertsFiltrados.length === 0 ? (
              <p className="text-center py-16" style={{ color: "#807F71" }}>
                Nenhum creator encontrado.
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {expertsFiltrados.map((e) => (
                  <ExpertCard key={e.id} expert={e} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── SEÇÕES POR CATEGORIA ─────────────────────────────── */}
      {!modoFiltrado &&
        categoriasFiltradas.map((cat) => {
          const lista = experts.filter((e) => e.categoria === cat);
          if (lista.length === 0) return null;
          return (
            <section key={cat} className="pb-14 px-6">
              <div className="max-w-[1194px] mx-auto">

                {/* Header da seção */}
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="font-normal"
                    style={{ fontSize: 24, color: "#272518" }}
                  >
                    {cat}
                  </h2>
                  <button
                    onClick={() => setCategoriaAtiva(cat)}
                    className="flex items-center gap-1.5 text-sm font-semibold transition-opacity hover:opacity-60"
                    style={{ color: "#272518" }}
                  >
                    Ver todas
                    <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2.5}>
                      <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                {/* Cards em scroll horizontal */}
                <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-6 px-6">
                  {lista.map((e) => (
                    <ExpertCard key={e.id} expert={e} fixedWidth />
                  ))}
                </div>

              </div>
            </section>
          );
        })}

      {/* ── CTA BANNER ───────────────────────────────────────── */}
      <section className="px-6 py-16">
        <div className="max-w-[1194px] mx-auto">
          <div
            className="flex flex-col md:flex-row items-center justify-between gap-10 rounded-xl px-12 py-12"
            style={{ background: "#E0DDC1" }}
          >
            <div className="flex-1">
              <h2
                className="font-normal leading-tight mb-2"
                style={{ fontSize: 36, color: "#272518" }}
              >
                Seja um mentor e inspire pessoas
              </h2>
              <p className="text-sm" style={{ color: "#514F41" }}>
                Conecte-se virtualmente, aconselhe e ganhe até R$ 100.000 em um mês.
              </p>
            </div>
            <Link
              href="/cadastro"
              className="flex-shrink-0 inline-flex items-center justify-center px-4 py-2 rounded font-semibold text-sm whitespace-nowrap transition-opacity hover:opacity-80"
              style={{
                background: "#EAEA68",
                color: "#272518",
                outline: "1px solid #EAEA68",
                boxShadow: "0px 1px 2px rgba(10, 13, 18, 0.05)",
              }}
            >
              Criar perfil
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
