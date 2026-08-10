# Checklist PRÉ → PÓS

O que precisa estar resolvido **antes** de virar `LAUNCH_PHASE=post`.

## Contexto

O projeto tem duas fases, controladas por uma flag única em `proxy.ts`:

```ts
const LAUNCH_PHASE = process.env.LAUNCH_PHASE === "post" ? "post" : "pre";
```

**PRÉ (default, e o valor atual em `.env.local`)** — só a waitlist é pública:

```
/            → rewrite interno para /waitlist (a URL continua /)
/waitlist/*  → passa
todo o resto → redirect para /
```

**PÓS** — o produto completo. `/waitlist/*` é desativada e as rotas de
`PROTEGIDAS` passam a exigir sessão.

Consequência: **nada dos itens abaixo está exposto hoje.** Todos passam a
valer no mesmo instante em que a flag virar. Esta lista existe para que o flip
não seja o momento da descoberta.

---

## 1. Afirmações falsas na interface

Seis textos afirmam que um pagamento foi processado ou que um e-mail foi
enviado. **Nenhuma das duas coisas acontece:** não existe gateway de pagamento
no código, e o `resend` está nas dependências mas sem uma única chamada.

Nenhuma pode estar no ar sem o comportamento correspondente existir.

| Arquivo | Linha | Texto |
|---|---|---|
| `components/ConfirmacaoFlow.tsx` | **148** | "Seu pagamento foi processado e a sessão está agendada. Você receberá os detalhes por e-mail." |
| `components/ConfirmacaoFlow.tsx` | 227 | "Enviamos os detalhes completos e o link da videochamada para você." |
| `components/CheckoutFlow.tsx` | 135 | "100% seguro — processado via Pagar.me" |
| `components/CheckoutFlow.tsx` | 134 | "Você recebe confirmação por e-mail em segundos" |
| `components/BookingFlow.tsx` | 954 | "Enviamos a confirmação e o link da reunião para o seu e-mail." |
| `app/dashboard/pagamentos/page.tsx` | 146 | "O pagamento é processado via Pagar.me." |

**A mais grave é `ConfirmacaoFlow:148`** — afirma *no passado* que o pagamento
foi processado.

Saídas possíveis: trocar a copy, ou manter as rotas bloqueadas até o
comportamento existir.

## 2. Rotas do fluxo de agendamento fora de `PROTEGIDAS`

`proxy.ts` protege hoje:

```
/conta  /criar  /dashboard  /agenda  /sala  /avaliar  /confirmacao
```

**`/agendar/*` e `/checkout/*` não estão na lista.** No flip, ficam públicas
para qualquer visitante, sem login — e são exatamente as telas do fluxo
mockado. Os 49 slugs de `lib/mockExperts` são pré-gerados por
`generateStaticParams`, então as páginas existem no build.

Decidir: públicas, exigem login, ou continuam bloqueadas.

## 3. Corrente de agendamento — elos mockados

A corrente está partida em dois pedaços que não se falam. Elos 1–4 são
protótipo de UI sobre `lib/mockExperts`; o elo 5 (sala) é infraestrutura real.
**Nada nos elos 1–4 cria a linha `sessions` que a sala precisa.**

`POST /api/sessions` é real e completo (insere em `sessions`, cria a sala no
Daily) — e **nenhuma tela do produto o chama**. É o fio solto no meio.

| Elo | Estado | O que falta |
|---|---|---|
| **1. PDP** `app/(site)/[slug]/page.tsx` | Perfil real funciona (lê `profiles`, `session_types`, `social_links` por `username`). CTA desabilitado de propósito | Habilitar o CTA quando o elo 2 aceitar perfis reais; buscar reviews de `public.reviews` (hoje `avaliacoesMock` no arquivo) |
| **2. Agendar** `app/agendar/[slug]` + `BookingFlow` | **Mock-only.** `experts.find(...)` + `notFound()` | Resolver slug por `profiles.username`; ler `session_types` (duração/preço) e `availability_blocks` (slots — hoje `gerarSlots` algorítmico); login real via `supabase.auth` (hoje `setTimeout` devolvendo `"Vanessa M."` hardcoded); **chamar `POST /api/sessions`** e redirecionar para o UUID retornado |
| **3. Checkout** `/checkout/[bookingId]` | **Mock-only e rota órfã** — ninguém linka para ela. O id só é parseado como `{slug}-{timestamp13}`; um UUID real cai em "Agendamento não encontrado" | Buscar `sessions` por UUID; integrar gateway (ver abaixo) |
| **4. Confirmação** `/confirmacao/[bookingId]` | **Mock-only.** Data = hoje+3, hora = `"15:00"` sempre. Comentado no código: `// Mock: data/hora fixos pois não temos backend ainda` | Buscar `sessions` + `profiles` por UUID; disparar e-mail; usar o `daily_room_url` real no `.ics` e no link do Google Calendar |
| **5. Sala** `/sala/[bookingId]` | **Real.** Query em `sessions` com joins, auth, checagem de participante, janela de tempo, 7 API routes, Realtime | Só configuração (ver item 4) |

O `BookingFlow` **nunca navega para `/checkout`** — termina em `step === 4` na
própria página. É por isso que o checkout está órfão.

## 4. Chaves do Daily

`DAILY_CO_API_KEY` e `DAILY_WEBHOOK_SECRET` **não existem** em `.env.example`
nem `.env.local`. O `lib/daily.ts` está escrito para a API real
(`https://api.daily.co/v1/rooms`, `/meeting-tokens`), e o `POST /api/sessions`
engole a falha em silêncio:

```ts
// Room creation is best-effort in dev when DAILY_CO_API_KEY is absent
```

Sem elas, a sala não tem sala.

---

## Fora desta lista

**Gateway de pagamento.** `PAGARME_API_KEY` está no `.env`, mas não há SDK,
fetch, rota nem webhook de pagamento em lugar nenhum — Pix, boleto e cartão
são UI com `setTimeout`. É a maior peça que falta no produto e está sendo
tratada como projeto separado, não como pendência do redesign.

---

## Não verificado

- Se `PAGARME_API_KEY` no `.env.local` tem valor real (só os nomes das chaves
  foram lidos, não o conteúdo).
- Se `availability_blocks` tem dados populados por hosts reais — a tabela e o
  onboarding existem, mas nenhum consumidor no fluxo de agendamento.
