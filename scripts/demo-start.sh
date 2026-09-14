#!/usr/bin/env bash
# Starts everything the local demo needs and prints the URLs + logins.
#   ./scripts/demo-start.sh          # dev server on :3100 (hot reload)
#   ./scripts/demo-start.sh prod     # production build + `next start` on :3100
set -euo pipefail
cd "$(dirname "$0")/.."
MODE="${1:-dev}"

echo "▶ Supabase (project 'loop', ports 553xx)"
if ! curl -s -m 3 -o /dev/null http://127.0.0.1:55321/rest/v1/; then
  supabase start -x vector,logflare,edge-runtime,pgadmin-schema-diff,supavisor >/dev/null
  # Kong caches container IPs; a restart after (re)start avoids 502s from auth
  docker restart supabase_kong_loop >/dev/null; sleep 4
fi
curl -s -m 5 -o /dev/null -w "  rest: %{http_code}\n" http://127.0.0.1:55321/rest/v1/

echo "▶ Seed (idempotent)"
npx tsx scripts/seed-demo.ts | sed 's/^/  /'

if ! grep -q "^DAILY_CO_API_KEY=.\+" .env.local; then
  echo "⚠ DAILY_CO_API_KEY is empty in .env.local — bookings work, the video room will not open."
fi

cat <<TXT

  App:        http://localhost:3100  (from the Mac: open the SSH tunnel first, see DEMO.md)
  Studio:     http://127.0.0.1:55323
  Mail (OTP): http://127.0.0.1:55324

  Guest:   guest@looptalk.demo   / looptalk-demo-2026
  Mentor:  mentor@looptalk.demo  / looptalk-demo-2026   → creator page /vanessa-m

  Happy path: /explorar → /vanessa-m → Agendar → pick slot → login as guest → confirm
              → /confirmacao/<id> → /agenda → (as mentor) /dashboard → Entrar → /sala/<id>

TXT

if [ "$MODE" = "prod" ]; then
  echo "▶ next build"; npx next build
  echo "▶ next start -p 3100"; exec npx next start -p 3100 -H 0.0.0.0
else
  echo "▶ next dev -p 3100"; exec npx next dev -p 3100 -H 0.0.0.0
fi
