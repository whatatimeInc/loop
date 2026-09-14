# Demo runbook — Loop.Talk happy path

## Production (Vercel + Supabase)

| What | Where |
|---|---|
| App | https://loop-three-brown.vercel.app |
| Vercel project | team `thiagofgf-4428s-projects`, project `loop` (Hobby plan: no Git integration for an org-private repo; deploy with `vercel deploy --prod` from `loop/`) |
| Supabase | project `looptalk` (`qrogcumktoficaqsrxee`, sa-east-1) in thiagofgf@gmail.com's org |
| GitHub | https://github.com/whatatimeInc/loop (PR #1 = this branch) |

Same demo accounts as below. Env vars live on the Vercel project: `LAUNCH_PHASE`,
`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`
(the service_role JWT: the new `sb_secret_…` format is rejected by this project's
PostgREST/GoTrue), `DAILY_CO_API_KEY`, `NEXT_PUBLIC_SITE_URL`, `SALA_EARLY_ENTRY_MINUTES=10`.
Seed prod again with `NEXT_PUBLIC_SUPABASE_URL=… SUPABASE_SECRET_KEY=… NEXT_PUBLIC_SITE_URL=… npx tsx scripts/seed-demo.ts`.

## Local

Branch `feat/demo-happy-path`. Everything below runs on this machine; nothing touches production.

## From the Mac: open the tunnel first

The app and Supabase run on the nuc. Browsers only allow camera/microphone on
`localhost` or HTTPS, so do NOT use the LAN IP: forward the two ports and browse
`localhost` instead. In a Mac terminal, leave this running during the demo:

```sh
ssh -N -L 3100:localhost:3100 -L 55321:localhost:55321 devbox@192.168.68.105
```

Then open http://localhost:3100 on the Mac. Without the tunnel, signup and login
fail with "Failed to fetch" (the browser tries to reach Supabase on the Mac itself).

## Start

```sh
cd loop
./scripts/demo-start.sh          # dev server, hot reload
./scripts/demo-start.sh prod     # production build, what the demo should use
```

The script starts the local Supabase stack (project `loop`, API on :55321), applies the
migrations, seeds the catalogue and demo accounts (idempotent), and starts Next on **:3100**.

| What | URL |
|---|---|
| App | http://localhost:3100 (through the tunnel) |
| Supabase Studio | http://127.0.0.1:55323 |
| Mail catcher (magic links, if used) | http://127.0.0.1:55324 |

| Account | Login | Password |
|---|---|---|
| Guest (books) | `guest@looptalk.demo` | `looptalk-demo-2026` |
| Mentor (hosts) | `mentor@looptalk.demo` | `looptalk-demo-2026` → creator page `/vanessa-m` |

The 48 catalogue creators are real users too (`<slug>@looptalk.demo`, same password).

## The flow to show

1. `/explorar` — creators come from Postgres (search + category filters work).
2. `/vanessa-m` — offers (30/45/60 min), 4.7 from three real reviews, **Agendar** is live.
3. `/agendar/vanessa-m?duracao=45` — calendar dots and hours come from the mentor's
   availability minus existing bookings. Pick a day and time → **Próximo**.
4. Login step — sign in as the guest (or type a new e-mail + password + name to create an
   account on the spot; no e-mail confirmation locally).
5. Message → **Revisar e confirmar** → **Confirmar agendamento**. This calls
   `POST /api/sessions`: price resolved server-side, slot re-validated, row inserted.
6. `/confirmacao/<uuid>` — real session, calendar buttons, no payment/e-mail claims.
7. `/agenda` — the guest sees the booking with **Entrar**.
8. Log out, log in as the mentor → `/dashboard/agenda` — the booking, the guest's message,
   **Entrar** → `/sala/<uuid>`.

Vanessa's availability is 24 × 7 so any time today works; `SALA_EARLY_ENTRY_MINUTES=1440`
in `.env.local` lets you open the room page for a session booked later today.

## Video call

The room runs on Daily.co (account domain `lptalk`, key in `.env.local`). The UI is ours:
Daily only carries the audio/video tracks (call-object mode), so there is no Daily
branding, prejoin screen or default layout. Controls: mute, camera, screen share, chat
(button in the bottom bar; it fades after 3 s without mouse movement, move the mouse to
bring it back), end call, time extension. Rooms are private: the raw daily.co URL does not
open without a token minted by the app.

To rehearse with two people: book with the guest, then open `/sala/<id>` as the guest in
one browser and as the mentor in a private window. Verified 2026-09-14 with two headless
browsers: both see and hear each other, chat messages arrive, nobody is dropped.

## What is NOT there

- **Payment**: out of scope by decision. There is no payment step and no copy claiming one.
- **E-mail**: nothing is sent. The confirmation page is the "receipt".

## If something looks off

- "Failed to fetch" on login/signup from the Mac → the tunnel is not running.
- Auth returns 502 after a Supabase restart → `docker restart supabase_kong_loop`.
- Reset everything: `supabase db reset && npx tsx scripts/seed-demo.ts`.
- Browser check of the whole path: `../.claude/demo/run-e2e.sh` (needs the dev server up).
