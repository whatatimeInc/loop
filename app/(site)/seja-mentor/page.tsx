import { LinkButton } from "@/components/ui/Button";
import { IconCheck, IconArrow } from "@/components/icons";

const beneficios = [
  {
    titulo: "Você define o preço",
    desc: "Cobre o quanto seu tempo vale. Sem teto. Sem negociação.",
  },
  {
    titulo: "80% é seu",
    desc: "A plataforma fica com 20%. O resto cai na sua conta toda sexta via Pix.",
  },
  {
    titulo: "Zero setup técnico",
    desc: "Perfil no ar em 2 minutos. Vídeo, pagamento e agenda: tudo incluso.",
  },
  {
    titulo: "Seus seguidores, sua audiência",
    desc: "Compartilha o link. Quem te segue já confia em você — só precisa de um canal pra pagar.",
  },
  {
    titulo: "Pix-only disponível",
    desc: "Ative o modo Pix-only e elimine 100% do risco de chargeback.",
  },
  {
    titulo: "Você escolhe quando trabalha",
    desc: "Define sua disponibilidade, duração das sessões e buffer entre calls.",
  },
];

const steps = [
  { n: "01", titulo: "Crie seu perfil", desc: "Nome, foto, bio e preço. Leva 2 minutos." },
  { n: "02", titulo: "Compartilhe o link", desc: "loop.talk/seu-nome vai direto para seus seguidores." },
  { n: "03", titulo: "Receba e converse", desc: "O cliente paga, você confirma, a call acontece no navegador." },
];

const depoimentos = [
  {
    nome: "Estevan Sartoreli",
    cargo: "CEO da Dengo Chocolates",
    texto: "Em duas semanas já tinha recuperado o investimento em tempo. Minha audiência queria acesso — eu só precisava de um jeito simples de oferecer.",
  },
  {
    nome: "Manuela Cit",
    cargo: "Cofundadora da Guday",
    texto: "Nunca pensei que seria tão direto. Postei no Stories, o link bombou e já fiz R$ 4.800 no primeiro mês.",
  },
  {
    nome: "Mauricio Arruda",
    cargo: "Diretor criativo da MAU",
    texto: "Eu já dava conselhos de graça. Agora cobro R$ 300 por 30 minutos e tenho fila de espera.",
  },
];

export default function SejaMentor() {
  return (
    <div className="theme-dark min-h-screen bg-dark text-gray-25">

      {/* ======== HERO ======== */}
      <section className="min-h-[90vh] flex flex-col items-center justify-center text-center px-6 pt-28 pb-20">
        <span className="inline-block bg-lime/10 text-lime text-xs font-semibold px-3 py-1 rounded-full mb-6 border border-lime/20">
          Para creators, founders e especialistas
        </span>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight max-w-3xl mb-6">
          Seu tempo vale mais<br />do que você cobra.
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Monetize o acesso a você. Sem agência, sem intermediário, sem complicação.
          Só você, seus seguidores e uma conversa que vale dinheiro.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <LinkButton href="/criar" variant="primary" size="lg">
            Criar meu perfil grátis
          </LinkButton>
          <LinkButton href="/explorar" variant="outline" size="lg">
            Ver exemplos de perfis
          </LinkButton>
        </div>

        {/* Número social proof */}
        <div className="mt-16 flex flex-col sm:flex-row gap-8 sm:gap-16 text-center">
          {[
            { num: "R$ 2.400", label: "média mensal por mentor ativo" },
            { num: "80%", label: "do valor vai direto pra você" },
            { num: "2 min", label: "pra ter o perfil no ar" },
          ].map((item) => (
            <div key={item.label}>
              <p className="text-3xl font-bold text-lime">{item.num}</p>
              <p className="text-gray-400 text-sm mt-1">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== COMO FUNCIONA ======== */}
      <section className="px-6 py-20 max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-14">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {steps.map((s) => (
            <div key={s.n} className="text-center">
              <div className="w-12 h-12 rounded-full bg-lime text-dark font-bold text-lg flex items-center justify-center mx-auto mb-4">
                {s.n}
              </div>
              <h3 className="font-semibold text-lg mb-2">{s.titulo}</h3>
              <p className="text-gray-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ======== BENEFÍCIOS ======== */}
      <section className="px-6 py-20 bg-gray-900/40">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Feito pra quem já tem audiência
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {beneficios.map((b) => (
              <div key={b.titulo} className="bg-gray-800/60 rounded-lg p-6">
                <div className="w-6 h-6 rounded-full bg-lime flex items-center justify-center mb-4">
                  <IconCheck className="w-3.5 h-3.5 text-dark" />
                </div>
                <h3 className="font-semibold mb-2">{b.titulo}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== SIMULADOR ======== */}
      <section className="px-6 py-20 max-w-2xl mx-auto text-center">
        <h2 className="text-2xl font-bold mb-4">Quanto você pode ganhar?</h2>
        <p className="text-gray-400 mb-10">
          Com R$ 300 por sessão e 10 sessões por mês, você recebe{" "}
          <span className="text-lime font-bold text-2xl">R$ 2.400</span>{" "}
          líquidos.
        </p>
        <div className="bg-gray-800 rounded-lg p-8 text-left space-y-4">
          {[
            { label: "Preço por sessão", valor: "R$ 300", cor: "" },
            { label: "Sessões por mês", valor: "10", cor: "" },
            { label: "Comissão plataforma (20%)", valor: "— R$ 600", cor: "text-red-400" },
          ].map((row) => (
            <div key={row.label} className="flex justify-between text-sm">
              <span className="text-gray-400">{row.label}</span>
              <span className={`font-semibold ${row.cor}`}>{row.valor}</span>
            </div>
          ))}
          <div className="border-t border-gray-700 pt-4 flex justify-between font-bold text-lg">
            <span>Você recebe</span>
            <span className="text-lime">R$ 2.400 / mês</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Repasse toda sexta-feira via Pix. Sem burocracia.
        </p>
      </section>

      {/* ======== DEPOIMENTOS ======== */}
      <section className="px-6 py-20 bg-gray-900/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">
            Quem já monetiza
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {depoimentos.map((d) => (
              <div key={d.nome} className="bg-gray-800/60 rounded-lg p-6">
                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                  &ldquo;{d.texto}&rdquo;
                </p>
                <div>
                  <p className="font-semibold text-sm">{d.nome}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{d.cargo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ======== CTA FINAL ======== */}
      <section className="px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">
          Pronto pra monetizar seu acesso?
        </h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto">
          Grátis pra criar. Você só paga quando recebe. Sem mensalidade, sem contrato.
        </p>
        <LinkButton href="/criar" variant="primary" size="lg">
          Criar meu perfil agora
          <IconArrow className="w-4 h-4 ml-2" />
        </LinkButton>
        <p className="text-gray-500 text-xs mt-4">
          Leva menos de 2 minutos. Sem cartão de crédito.
        </p>
      </section>

    </div>
  );
}
