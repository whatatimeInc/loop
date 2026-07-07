"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { experts } from "@/lib/mockExperts";
import { IconCopy, IconCheck } from "@/components/icons";
import { Button } from "@/components/ui/Button";

// ─── helpers ──────────────────────────────────────────────────────────────────

function formatPreco(n: number) {
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
}

function slugFromBookingId(id: string) {
  // formato: {slug}-{13 dígitos timestamp}
  const m = id.match(/^(.+)-\d{13}$/);
  return m?.[1] ?? null;
}

// ─── QR Code mock ─────────────────────────────────────────────────────────────

function MockQRCode() {
  // grade 10×10 com padrão visual aleatório fixo (seed visual)
  const pattern = [
    "1111111011011111111",
    "1000001010101000001",
    "1011101001101011101",
    "1011101010001011101",
    "1011101011101011101",
    "1000001001001000001",
    "1111111010101111111",
    "0000000001000000000",
    "1011010110101101001",
    "0100101001010010110",
    "1101110100111011010",
    "0010001011000100101",
    "1111111011011111111",
    "1000001010101000001",
    "1011101001101011101",
    "1011101010001011101",
    "1011101011101011101",
    "1000001001001000001",
    "1111111010101111111",
  ];
  return (
    <div className="inline-block bg-white p-3 rounded-md border border-gray-200">
      {pattern.map((row, i) => (
        <div key={i} className="flex">
          {row.split("").map((cell, j) => (
            <div
              key={j}
              className={`w-2.5 h-2.5 ${cell === "1" ? "bg-gray-900" : "bg-white"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ segundos }: { segundos: number }) {
  const [restante, setRestante] = useState(segundos);

  useEffect(() => {
    const id = setInterval(() => setRestante((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const min = String(Math.floor(restante / 60)).padStart(2, "0");
  const seg = String(restante % 60).padStart(2, "0");

  return (
    <span className={restante < 120 ? "text-red-500" : "text-amber-600"}>
      {min}:{seg}
    </span>
  );
}

// ─── Pix ──────────────────────────────────────────────────────────────────────

const PIX_CODIGO =
  "00020126580014BR.GOV.BCB.PIX0136facetalk@pagamentos.com.br5204000053039865802BR5925FACE TALK TECNOLOGIA62140510facetalk016304A2B7";

function PainelPix({ preco }: { preco: number }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(PIX_CODIGO).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div className="space-y-6">
      <div className="bg-lime/10 border border-lime/30 rounded-lg px-4 py-3 flex items-center justify-between text-sm">
        <span className="text-gray-700">Código expira em</span>
        <span className="font-bold text-base">
          <Countdown segundos={30 * 60} />
        </span>
      </div>

      <div className="flex flex-col items-center gap-4">
        <MockQRCode />
        <p className="text-xs text-gray-400 text-center">
          Abra o app do seu banco e escaneie o QR Code
        </p>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Ou copie o código Pix</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <p className="flex-1 text-xs text-gray-500 font-mono truncate">
            {PIX_CODIGO.slice(0, 48)}...
          </p>
          <button
            onClick={copiar}
            className="flex-shrink-0 flex items-center gap-1.5 bg-lime hover:bg-lime-dark text-dark text-xs font-semibold px-3 py-1.5 rounded transition-colors"
          >
            {copiado ? (
              <><IconCheck className="w-3.5 h-3.5" /> Copiado</>
            ) : (
              <><IconCopy className="w-3.5 h-3.5" /> Copiar</>
            )}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 rounded-md px-4 py-3 text-xs text-gray-500 space-y-1">
        <p className="flex items-center gap-2"><IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" /> Confirmação instantânea após o pagamento</p>
        <p className="flex items-center gap-2"><IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" /> Você recebe confirmação por e-mail em segundos</p>
        <p className="flex items-center gap-2"><IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" /> 100% seguro — processado via Pagar.me</p>
      </div>

      <p className="text-center text-xs text-gray-400">
        Total a pagar:{" "}
        <span className="font-bold text-gray-900">R$ {formatPreco(preco)}</span>
      </p>
    </div>
  );
}

// ─── Cartão ───────────────────────────────────────────────────────────────────

function PainelCartao({ preco }: { preco: number }) {
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");
  const [validade, setValidade] = useState("");
  const [cvv, setCvv] = useState("");

  function formatNumero(v: string) {
    return v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  }
  function formatValidade(v: string) {
    return v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");
  }

  const completo = numero.replace(/\s/g, "").length === 16 && nome.length > 3 && validade.length === 5 && cvv.length === 3;

  const inputCls = "w-full border border-gray-200 rounded-md px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-lime transition-colors";

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Número do cartão</label>
        <input
          className={inputCls}
          placeholder="0000 0000 0000 0000"
          value={numero}
          onChange={(e) => setNumero(formatNumero(e.target.value))}
          inputMode="numeric"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-600 mb-1.5 block">Nome no cartão</label>
        <input
          className={inputCls}
          placeholder="NOME SOBRENOME"
          value={nome}
          onChange={(e) => setNome(e.target.value.toUpperCase())}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">Validade</label>
          <input
            className={inputCls}
            placeholder="MM/AA"
            value={validade}
            onChange={(e) => setValidade(formatValidade(e.target.value))}
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">CVV</label>
          <input
            className={inputCls}
            placeholder="000"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            inputMode="numeric"
          />
        </div>
      </div>
      <Button
        variant="primary"
        size="lg"
        disabled={!completo}
        className="w-full justify-center mt-2"
      >
        Pagar R$ {formatPreco(preco)}
      </Button>
      <p className="text-center text-xs text-gray-400">
        Seus dados são criptografados via SSL
      </p>
    </div>
  );
}

// ─── Boleto ───────────────────────────────────────────────────────────────────

const BOLETO_CODIGO = "34191.09008 63521.590001 81007.727022 6 00010000015000";

function PainelBoleto({ preco }: { preco: number }) {
  const [copiado, setCopiado] = useState(false);

  function copiar() {
    navigator.clipboard.writeText(BOLETO_CODIGO).catch(() => {});
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  return (
    <div className="space-y-6">
      {/* Código de barras visual */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-center">
        <div className="flex items-end gap-px h-14">
          {Array.from({ length: 60 }).map((_, i) => {
            const largura = [1, 1, 2, 1, 3, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 3, 1, 1, 2, 1][i % 20];
            return (
              <div
                key={i}
                className="bg-gray-900"
                style={{ width: largura * 3, height: i % 5 === 0 ? 56 : 40 }}
              />
            );
          })}
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2 font-medium">Linha digitável</p>
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
          <p className="flex-1 text-xs text-gray-600 font-mono">{BOLETO_CODIGO}</p>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={copiar}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
          >
            {copiado ? <><IconCheck className="w-3.5 h-3.5 text-lime" /> Copiado</> : <><IconCopy className="w-3.5 h-3.5" /> Copiar código</>}
          </button>
          <button className="flex items-center gap-1.5 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded hover:bg-gray-800 transition-colors">
            Baixar boleto
          </button>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-md px-4 py-3 text-xs text-amber-700 space-y-1">
        <p className="font-semibold">Atenção</p>
        <p>Vence em <strong>3 dias úteis</strong>. Confirmação em até 2 dias úteis após o pagamento.</p>
        <p>Boleto não disponível para agendamentos com menos de 4 dias de antecedência.</p>
      </div>

      <p className="text-center text-xs text-gray-400">
        Total: <span className="font-bold text-gray-900">R$ {formatPreco(preco)}</span>
      </p>
    </div>
  );
}

// ─── CheckoutFlow principal ───────────────────────────────────────────────────

type MetodoPagamento = "pix" | "cartao" | "boleto";

export function CheckoutFlow() {
  const params = useParams<{ bookingId: string }>();
  const router = useRouter();
  const [metodo, setMetodo] = useState<MetodoPagamento>("pix");

  const bookingId = params.bookingId ?? "";
  const slug = slugFromBookingId(bookingId);
  const expert = experts.find((e) => e.slug === slug);

  // duracao mock: primeira opção do mentor (sem sessão persistida ainda)
  const duracao = expert?.duracoes?.[0] ?? 30;
  const preco = expert ? Math.round((expert.preco * duracao) / 60) : 0;

  function handlePixConfirm() {
    router.push(`/confirmacao/${bookingId}`);
  }

  if (!expert) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-gray-400">Agendamento não encontrado.</p>
      </div>
    );
  }

  const tabs: { id: MetodoPagamento; label: string }[] = [
    { id: "pix", label: "Pix" },
    { id: "cartao", label: "Cartão" },
    { id: "boleto", label: "Boleto" },
  ];

  return (
    <div className="min-h-screen bg-cream pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Finalizar agendamento</h1>

        <div className="grid md:grid-cols-[1fr_420px] gap-8 items-start">

          {/* ——— RESUMO ——— */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
            <h2 className="font-semibold text-gray-900">Resumo</h2>

            {/* Expert */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={`/mentors/${expert.slug}/profile.webp`}
                  alt={expert.nome}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{expert.nome}</p>
                <p className="text-xs text-gray-400">{expert.categoria}</p>
              </div>
            </div>

            {/* Detalhes */}
            <div className="space-y-2 text-sm">
              {[
                { label: "Tipo", valor: "Sessão 1:1 por vídeo" },
                { label: "Duração", valor: `${duracao} minutos` },
                { label: "Data", valor: "A confirmar" },
                { label: "Horário", valor: "A confirmar" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between">
                  <span className="text-gray-400">{row.label}</span>
                  <span className="text-gray-700 font-medium">{row.valor}</span>
                </div>
              ))}
            </div>

            {/* Preço */}
            <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Subtotal</span>
                <span className="text-gray-700">R$ {formatPreco(preco)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Taxa de serviço</span>
                <span className="text-lime font-semibold">Grátis</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-100">
                <span className="text-gray-900">Total</span>
                <span className="text-gray-900">R$ {formatPreco(preco)}</span>
              </div>
            </div>

            {/* Garantia */}
            <div className="bg-gray-50 rounded-md px-4 py-3 text-xs text-gray-500 space-y-1">
              <p className="flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" />
                Se o mentor cancelar, reembolso 100% imediato
              </p>
              <p className="flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" />
                Cancelamento grátis até 12h antes
              </p>
              <p className="flex items-center gap-2">
                <IconCheck className="w-3.5 h-3.5 text-lime flex-shrink-0" />
                Suporte humano disponível
              </p>
            </div>
          </div>

          {/* ——— PAGAMENTO ——— */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">

            {/* Tabs */}
            <div className="flex gap-1 bg-gray-100 rounded-md p-1 mb-6">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setMetodo(t.id)}
                  className={`flex-1 py-2 rounded text-sm font-medium transition-colors ${
                    metodo === t.id
                      ? "bg-white text-gray-900 shadow-soft"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {t.id === "pix" && (
                    <span className={`inline-block w-2 h-2 rounded-full mr-1.5 ${metodo === "pix" ? "bg-lime" : "bg-gray-300"}`} />
                  )}
                  {t.label}
                  {t.id === "pix" && (
                    <span className="ml-1.5 text-[10px] text-lime font-bold">Instantâneo</span>
                  )}
                </button>
              ))}
            </div>

            {/* Painel ativo */}
            {metodo === "pix" && (
              <div>
                <PainelPix preco={preco} />
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full justify-center mt-6"
                  onClick={handlePixConfirm}
                >
                  Já paguei — confirmar
                </Button>
              </div>
            )}
            {metodo === "cartao" && <PainelCartao preco={preco} />}
            {metodo === "boleto" && <PainelBoleto preco={preco} />}
          </div>

        </div>
      </div>
    </div>
  );
}
