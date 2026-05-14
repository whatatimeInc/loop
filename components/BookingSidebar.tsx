"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui/Button";
import { Expert } from "@/lib/mockExperts";

interface Props {
  expert: Expert;
}

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

export function BookingSidebar({ expert }: Props) {
  const [duracaoSelecionada, setDuracaoSelecionada] = useState(
    expert.duracoes[0]
  );

  const precoFinal = Math.round(
    (expert.preco * duracaoSelecionada) / 60
  );

  return (
    <div className="bg-white rounded-3xl shadow-soft border border-gray-200 p-6 flex flex-col gap-5">

      {/* Preço */}
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
          A partir de
        </p>
        <p className="text-3xl font-bold text-gray-900">
          R$ {formatPrice(precoFinal)}
          <span className="text-base font-normal text-gray-400 ml-1">
            / sessão
          </span>
        </p>
      </div>

      {/* Duração */}
      <div>
        <p className="text-sm font-medium text-gray-700 mb-3">
          Duração da sessão
        </p>
        <div className="grid grid-cols-2 gap-2">
          {expert.duracoes.map((min) => {
            const preco = Math.round((expert.preco * min) / 60);
            const ativo = min === duracaoSelecionada;
            return (
              <button
                key={min}
                onClick={() => setDuracaoSelecionada(min)}
                className={`rounded-xl border p-3 text-left transition-colors ${
                  ativo
                    ? "border-lime bg-lime/10 text-gray-900"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }`}
              >
                <p className="font-semibold text-sm">{min} min</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  R$ {formatPrice(preco)}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scarcity */}
      {expert.scarcity && (
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-center">
          {expert.scarcity}
        </p>
      )}

      {/* CTA */}
      <LinkButton
        href={`/agendar/${expert.slug}`}
        variant="primary"
        size="lg"
        className="w-full justify-center"
      >
        Agendar agora
      </LinkButton>

      <p className="text-xs text-gray-400 text-center">
        Pagamento somente após confirmação da sessão
      </p>
    </div>
  );
}
