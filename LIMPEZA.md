# Lista de limpeza

Itens levantados durante a limpeza de tokens de cor. **Nada aqui deve ser
consertado sem decisão explícita** — a lista existe para não perder o achado,
não para autorizar a correção.

---

## O padrão que se repete

Cinco casos, todos a mesma causa: **duas fontes de verdade sem nada que as
reconcilie**. Vale tratar como um problema só, não como cinco.

| # | Caso | Forma da duplicação |
|---|------|---------------------|
| 1 | `Logo` | um arquivo por cor, em vez de `currentColor` |
| 2 | `createClient` | função duplicada entre `SalaClient` e `lib/supabase/client` |
| 3 | Três tokens em `#272518` | três nomes, um valor |
| 4 | Cinco nomes para `#FCFBF8` | escala + semântico sobrepostos |
| 5 | `ExpertGlassCard` | a PDP tem **cópia inline** do card em vez de importar o componente |

Os casos 1–4 já foram resolvidos. O caso 5 continua aberto.

### Caso 5 — detalhe

`components/ExpertGlassCard.tsx` só é importado por
`components/home/CreatorsSection.tsx`. A PDP (`app/(site)/[slug]/page.tsx`),
de onde o componente foi extraído, nunca passou a consumi-lo — mantém a versão
inline.

Consequência hoje: a variante `light` do componente é código morto. Ela **não é
supérflua** — é a casa da PDP quando a migração acontecer. Não deletar.

---

## Arquivo parcialmente morto

`components/home/HowItWorksSection.tsx` não renderiza em lugar nenhum, mas
`ExpertSection` importa as **ilustrações** dele. Resolver junto:

- extrair as ilustrações para módulo próprio;
- matar o resto do arquivo;
- com isso caem também 6 das 26 cores fora da paleta, que são a mini-paleta
  local deste arquivo (`#F2F0E8`, `#3E3B12`, `#DEDBC6`, `#4A4834`, `#EDEBDD`,
  `#F3F1E6`).

---

## Arquivos mortos

`app/waitlist/WaitlistForm.tsx` — zero referências em todo o projeto, e o
código não usa `dynamic()` nem `React.lazy()`, então não há como ser montado.
É o **sétimo** arquivo morto encontrado.

Decisão: **não deletar avulso.** Juntar todos num único commit de exclusão,
depois que os lotes de cor fecharem.

---

## Cores sem token

26 ocorrências fora da paleta no grupo (a), reportadas no fecho do Lote A.
Não criar token para nenhuma delas agora. 6 delas morrem com o
`HowItWorksSection` (acima).

`#181D27` — sai do projeto. Vai para o relatório do passo 7, uso a uso.
Uma das ocorrências é `ExpertGlassCard:32`, o `text` da variante `light`.

---

## Tokens

- `tokens.glassDark = "#514F41"` (`components/ui/tokens.ts:27`) é o **mesmo
  valor** de `--color-gray-700`. A limpeza "um nome por valor" não pegou porque
  este nome vive no objeto JS, não no `globals.css`. Vale varrer `tokens.ts`
  com o mesmo critério.
- Renomear `--color-lime` → `--color-brand`. Candidato registrado, sem data.

---

## Fora de escopo permanente

Os `#000` dentro de `mask-image` / `WebkitMaskImage` **não são cor** — numa
máscara só o canal alpha é lido, e `#000` quer dizer "opaco". Já estão
comentados no código para ninguém re-sinalizar.
