# Demo runbook — Loop.Talk happy path (local)

Branch `feat/demo-happy-path`. Everything below runs on this machine; nothing touches production.

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
| App | http://localhost:3100 (LAN: http://192.168.68.105:3100) |
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

## What is NOT there

- **Video call**: `DAILY_CO_API_KEY` is empty in `.env.local`. The session is created, the
  room page loads, but the button says the room is not provisioned. Put a key from
  https://dashboard.daily.co in `.env.local`, restart, and the next booking gets a room.
- **Payment**: out of scope by decision. There is no payment step and no copy claiming one.
- **E-mail**: nothing is sent. The confirmation page is the "receipt".

## If something looks off

- Auth returns 502 after a Supabase restart → `docker restart supabase_kong_loop`.
- Reset everything: `supabase db reset && npx tsx scripts/seed-demo.ts`.
- Browser check of the whole path: `../.claude/demo/run-e2e.sh` (needs the dev server up).
