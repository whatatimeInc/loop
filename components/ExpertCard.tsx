import Image from "next/image";
import Link from "next/link";
import { Expert } from "@/lib/mockExperts";
import { Check } from "iconoir-react";

function formatPrice(preco: number) {
  return preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function BookmarkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
  );
}

interface ExpertCardProps {
  expert: Expert;
  /** Largura fixa para scroll horizontal. Omita para adaptar ao grid. */
  fixedWidth?: boolean;
}

export function ExpertCard({ expert, fixedWidth = false }: ExpertCardProps) {
  return (
    <div className={fixedWidth ? "flex-shrink-0 w-[260px]" : "w-full"}>
      <Link
        href={`/${expert.slug}`}
        className="block relative rounded-xl overflow-hidden group"
        style={{ height: "400px" }}
      >
        {/* Foto ocupa o card inteiro */}
        <Image
          src={expert.foto}
          alt={expert.nome}
          fill
          className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 50vw, 280px"
        />

        {/* Overlay blur + gradiente branco na parte inferior */}
        <div
          className="absolute inset-0 backdrop-blur-[20px]"
          style={{
            background: "linear-gradient(180deg, rgb(from var(--color-bg-white) r g b / 0) 53%, color-mix(in srgb, var(--color-bg-white) 43%, transparent) 67%, color-mix(in srgb, var(--color-bg-white) 90%, transparent) 100%)",
            maskImage: "linear-gradient(180deg, transparent 45%, black 72%)",
          }}
        />

        {/* Badge Popular */}
        <div className="absolute top-4 left-4 z-20">
          <span className="bg-white/80 backdrop-blur-sm text-gray-900 text-xs font-semibold px-3 py-1 rounded-full">
            Popular
          </span>
        </div>

        {/* Bookmark */}
        <button
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/20 hover:bg-white/40 transition-colors text-white"
          onClick={(e) => e.preventDefault()}
          aria-label="Salvar"
        >
          <BookmarkIcon />
        </button>

        {/* Conteúdo no rodapé */}
        <div className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-6 pt-2">
          {/* Nome + badge verificado */}
          <div className="flex items-center gap-2 mb-1">
            <p className="text-gray-900 font-normal text-base truncate leading-tight">
              {expert.nome}
            </p>
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-lime flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-dark" />
            </span>
          </div>

          {/* Preço */}
          <p className="text-gray-900 text-sm mb-1">
            R$ {formatPrice(expert.preco)}
            <span className="text-gray-500"> / sessão</span>
          </p>

          {/* Bio */}
          <p className="text-gray-600 text-xs leading-relaxed line-clamp-2 mb-1.5">
            {expert.bio}
          </p>

          {/* Categoria */}
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
            <span className="text-gray-600 text-xs truncate">{expert.categoria}</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
