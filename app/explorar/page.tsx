"use client";

import { useState } from "react";
import { experts, categorias, Categoria } from "@/lib/mockExperts";
import { ExpertCard } from "@/components/ExpertCard";
import { LinkButton } from "@/components/ui/Button";
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
  "Carreira e Negócios": <IconCategoriaCarreira    className="w-5 h-5 flex-shrink-0" />,
  "Saúde e Bem estar":   <IconCategoriaSaude       className="w-5 h-5 flex-shrink-0" />,
  "Criatividade":        <IconCategoriaArte        className="w-5 h-5 flex-shrink-0" />,
  "Gastronomia":         <IconCategoriaGastronomia className="w-5 h-5 flex-shrink-0" />,
  "Estilo de Vida":      <IconCategoriaModa        className="w-5 h-5 flex-shrink-0" />,
  "Tecnologia":          <IconCategoriaCasa        className="w-5 h-5 flex-shrink-0" />,
};

export default function Explorar() {
  const [busca, setBusca] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<Categoria | null>(null);

  const expertsFiltrados = experts.filter((e) => {
    const buscaOk =
      busca === "" ||
      e.nome.toLowerCase().includes(busca.toLowerCase()) ||
      e.bio.toLowerCase().includes(busca.toLowerCase()) ||
      e.categoria.toLowerCase().includes(busca.toLowerCase());
    const categoriaOk = categoriaAtiva === null || e.categoria === categoriaAtiva;
    return buscaOk && categoriaOk;
  });

  // Quando há filtro ativo (busca ou categoria), exibe resultado flat
  const modoFiltrado = busca !== "" || categoriaAtiva !== null;

  const categoriasFiltradas = categoriaAtiva ? [categoriaAtiva] : categorias;

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20">

      {/* ======== HERO ======== */}
      <section className="text-center px-6 pb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Fale com quem sabe. Agora.
        </h1>
        <p className="text-gray-500 text-base max-w-md mx-auto mb-8">
          Especialistas que mudam negócios, vidas e histórias a um clique de você.
        </p>

        {/* Barra de busca */}
        <form
          className="flex items-center gap-2 max-w-md mx-auto"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="relative flex-1">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar mentor"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full h-11 pl-9 pr-4 rounded-full border border-gray-300 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-lime"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-5 bg-lime text-dark font-semibold text-sm rounded-full flex items-center gap-2 hover:bg-lime-dark transition-colors"
          >
            <IconSearch className="w-4 h-4" />
            Buscar
          </button>
        </form>
      </section>

      {/* ======== PILLS DE CATEGORIA ======== */}
      <section className="px-6 pb-10">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {categorias.map((cat) => {
            const ativo = categoriaAtiva === cat;
            return (
              <button
                key={cat}
                onClick={() => setCategoriaAtiva(cat === categoriaAtiva ? null : cat)}
                className={`
                  flex-shrink-0 flex items-center gap-2.5
                  h-12 px-5 rounded-lg border text-sm font-medium
                  transition-colors backdrop-blur-[20px]
                  ${ativo
                    ? "bg-gray-900 text-gray-25 border-gray-900"
                    : "bg-white/40 text-gray-700 border-gray-200 hover:bg-white/70"
                  }
                `}
              >
                {categoriaIcones[cat]}
                {cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* ======== RESULTADO DE BUSCA (modo filtrado) ======== */}
      {modoFiltrado && (
        <section className="px-6 pb-10">
          <p className="text-sm text-gray-500 mb-6">
            {expertsFiltrados.length} resultado{expertsFiltrados.length !== 1 ? "s" : ""}
            {busca && ` para "${busca}"`}
          </p>
          {expertsFiltrados.length === 0 ? (
            <p className="text-gray-400 text-center py-16">
              Nenhum expert encontrado.
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {expertsFiltrados.map((e) => (
                <ExpertCard key={e.id} expert={e} />
              ))}
            </div>
          )}
        </section>
      )}

      {/* ======== SEÇÕES POR CATEGORIA (modo padrão) ======== */}
      {!modoFiltrado &&
        categoriasFiltradas.map((cat) => {
          const lista = experts.filter((e) => e.categoria === cat);
          if (lista.length === 0) return null;
          return (
            <section key={cat} className="px-6 mb-12">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold text-gray-900">{cat}</h2>
                <button
                  onClick={() => setCategoriaAtiva(cat)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Ver todos
                  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
                {lista.map((e) => (
                  <ExpertCard key={e.id} expert={e} fixedWidth />
                ))}
              </div>
            </section>
          );
        })}

      {/* ======== BANNER CTA ======== */}
      <section className="px-6 mt-8">
        <div className="bg-tan rounded-3xl px-8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">
              Seja um mentor e inspire pessoas
            </h2>
            <p className="text-gray-600 text-sm">
              Conecte-se virtualmente, aconselhe e ganhe até R$ 100.000 em um mês.
            </p>
          </div>
          <LinkButton href="/seja-mentor" variant="primary" size="md" className="flex-shrink-0">
            Seja um mentor
          </LinkButton>
        </div>
      </section>

    </div>
  );
}
