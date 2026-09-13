// Demo seed: turns the mockExperts catalogue into REAL rows (auth.users +
// profiles + session_types + availability_blocks + social_links) and creates
// two known demo accounts. Idempotent: re-running updates in place.
//
//   npx tsx scripts/seed-demo.ts
//
// Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY and NEXT_PUBLIC_SITE_URL
// in .env.local (loaded below without extra dependencies).
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { experts, type Categoria } from "../lib/mockExperts";

// ── tiny .env.local loader ───────────────────────────────────────────────────
for (const line of readFileSync(new URL("../.env.local", import.meta.url), "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SECRET = process.env.SUPABASE_SECRET_KEY!;
const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";
if (!URL_ || !SECRET) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY");

const sb = createClient(URL_, SECRET, { auth: { persistSession: false, autoRefreshToken: false } });

export const DEMO_PASSWORD = "looptalk-demo-2026";
export const DEMO_MENTOR = { email: "mentor@looptalk.demo", slug: "vanessa-m", name: "Vanessa", last_name: "Martins" };
export const DEMO_GUEST  = { email: "guest@looptalk.demo",  name: "Tiago", last_name: "Ferraz" };

const CATEGORIA_AREA: Record<Categoria, string> = {
  "Carreira e Negócios": "career_business",
  "Estilo de Vida":      "lifestyle_fashion",
  "Saúde e Bem Estar":   "health_wellness",
  "Tecnologia":          "technology",
  "Criatividade":        "creativity",
  "Gastronomia":         "gastronomy",
};

async function upsertUser(email: string, password: string, meta: Record<string, string>): Promise<string> {
  // listUsers is paginated; the catalogue is ~50 users so one page is enough.
  const { data: list, error: listErr } = await sb.auth.admin.listUsers({ perPage: 1000 });
  if (listErr) throw listErr;
  const existing = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  if (existing) {
    const { error } = await sb.auth.admin.updateUserById(existing.id, { password, user_metadata: meta, email_confirm: true });
    if (error) throw error;
    return existing.id;
  }
  const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: meta });
  if (error) throw error;
  return data.user.id;
}

async function seedCreator(opts: {
  email: string; password: string; slug: string; name: string; last_name: string;
  headline: string; bio: string; area: string; photo_url: string | null;
  hourly_price_cents: number; durations: number[]; social: Record<string, string | undefined>;
  availability: { start_time: string; end_time: string; days: number[] }[];
}) {
  const id = await upsertUser(opts.email, opts.password, { name: opts.name, last_name: opts.last_name });

  const { error: pErr } = await sb.from("profiles").upsert({
    id, email: opts.email, name: opts.name, last_name: opts.last_name,
    username: opts.slug, headline: opts.headline, bio: opts.bio,
    area: opts.area, photo_url: opts.photo_url,
    hourly_price: opts.hourly_price_cents,
    host_profile_activated: true, host_activated_at: new Date().toISOString(),
    onboarding_completed: true, onboarding_step: "done", has_password: true,
    pix_key: `${opts.slug}@pix.demo`,
  }, { onConflict: "id" });
  if (pErr) throw new Error(`profiles ${opts.slug}: ${pErr.message}`);

  await sb.from("session_types").delete().eq("host_id", id);
  const types = opts.durations.filter((d) => [30, 45, 60].includes(d)).map((d) => ({
    host_id: id, label: null, duration_minutes: d,
    price_brl: Math.round((opts.hourly_price_cents * d) / 60), active: true,
  }));
  if (types.length) {
    const { error } = await sb.from("session_types").insert(types);
    if (error) throw new Error(`session_types ${opts.slug}: ${error.message}`);
  }

  await sb.from("availability_blocks").delete().eq("profile_id", id);
  const { error: aErr } = await sb.from("availability_blocks").insert(
    opts.availability.map((b) => ({ profile_id: id, ...b })),
  );
  if (aErr) throw new Error(`availability ${opts.slug}: ${aErr.message}`);

  await sb.from("social_links").delete().eq("profile_id", id);
  const links = Object.entries(opts.social)
    .filter(([, url]) => !!url)
    .map(([platform, url], i) => ({ profile_id: id, platform, url: url!, sort_order: i }));
  if (links.length) {
    const { error } = await sb.from("social_links").insert(links);
    if (error) throw new Error(`social_links ${opts.slug}: ${error.message}`);
  }
  return id;
}

async function main() {
  console.log(`Seeding against ${URL_}`);

  // ── Catalogue creators ────────────────────────────────────────────────────
  // Weekly availability varies by index so the calendar looks alive.
  const patterns = [
    [{ start_time: "09:00", end_time: "12:00", days: [1, 2, 3, 4, 5] }, { start_time: "14:00", end_time: "18:00", days: [1, 3, 5] }],
    [{ start_time: "10:00", end_time: "16:00", days: [1, 2, 3, 4, 5] }],
    [{ start_time: "08:00", end_time: "11:00", days: [2, 4] }, { start_time: "13:00", end_time: "17:00", days: [1, 2, 3, 4, 5, 6] }],
    [{ start_time: "09:00", end_time: "18:00", days: [1, 2, 3, 4, 5] }],
  ];
  let n = 0;
  for (const [i, e] of experts.entries()) {
    const [first, ...rest] = e.nome.split(" ");
    await seedCreator({
      email: `${e.slug}@looptalk.demo`, password: DEMO_PASSWORD, slug: e.slug,
      name: first, last_name: rest.join(" "),
      headline: e.bio.split(". ")[0], bio: e.bio,
      area: CATEGORIA_AREA[e.categoria], photo_url: `${SITE}${e.foto}`,
      hourly_price_cents: e.preco * 100, durations: e.duracoes,
      social: { instagram: e.social.instagram, linkedin: e.social.linkedin, twitter: e.social.twitter },
      availability: patterns[i % patterns.length],
    });
    n++;
  }
  console.log(`catalogue: ${n} creators`);

  // ── Demo mentor (the one you log in as during the demo) ───────────────────
  const mentorId = await seedCreator({
    email: DEMO_MENTOR.email, password: DEMO_PASSWORD, slug: DEMO_MENTOR.slug,
    name: DEMO_MENTOR.name, last_name: DEMO_MENTOR.last_name,
    headline: "Designer de produto e mentora de carreira",
    bio: "Dez anos desenhando produtos digitais. Ajudo designers e fundadores a transformar ideias em produtos que as pessoas usam.",
    area: "creativity", photo_url: null,
    hourly_price_cents: 20000, durations: [30, 45, 60],
    social: { instagram: "https://instagram.com/looptalk", linkedin: "https://linkedin.com/company/looptalk" },
    availability: [{ start_time: "00:00", end_time: "23:30", days: [0, 1, 2, 3, 4, 5, 6] }],
  });
  console.log(`demo mentor: ${DEMO_MENTOR.email} / ${DEMO_PASSWORD} → /${DEMO_MENTOR.slug} (${mentorId})`);

  // ── Demo guest ────────────────────────────────────────────────────────────
  const guestId = await upsertUser(DEMO_GUEST.email, DEMO_PASSWORD, { name: DEMO_GUEST.name, last_name: DEMO_GUEST.last_name });
  const { error: gErr } = await sb.from("profiles").upsert({
    id: guestId, email: DEMO_GUEST.email, name: DEMO_GUEST.name, last_name: DEMO_GUEST.last_name, has_password: true,
  }, { onConflict: "id" });
  if (gErr) throw new Error(`guest profile: ${gErr.message}`);
  console.log(`demo guest:  ${DEMO_GUEST.email} / ${DEMO_PASSWORD} (${guestId})`);

  // ── A few completed sessions + public reviews so the profile has real stars ─
  const reviewers = [
    { email: "ana.reviewer@looptalk.demo", name: "Ana", last_name: "Lima", rating: 5, text: "Direta ao ponto e muito generosa com o tempo. Saí com um plano claro." },
    { email: "bruno.reviewer@looptalk.demo", name: "Bruno", last_name: "Costa", rating: 5, text: "Melhor investimento do mês. Recomendo para quem está começando em produto." },
    { email: "carla.reviewer@looptalk.demo", name: "Carla", last_name: "Souza", rating: 4, text: "Ótimos insights sobre portfólio. Queria mais tempo!" },
  ];
  // Idempotent per reviewer: each demo reviewer gets exactly one concluded
  // session + review with vanessa-m; re-running repairs a partial seed.
  let created = 0;
  for (const [i, r] of reviewers.entries()) {
    const rid = await upsertUser(r.email, DEMO_PASSWORD, { name: r.name, last_name: r.last_name });
    await sb.from("profiles").upsert({ id: rid, email: r.email, name: r.name, last_name: r.last_name }, { onConflict: "id" });
    const { data: existing } = await sb.from("sessions").select("id").eq("guest_id", rid).eq("mentor_id", mentorId).limit(1).maybeSingle();
    let sessionId = existing?.id as string | undefined;
    if (!sessionId) {
      const startsAt = new Date(Date.now() - (i + 2) * 7 * 24 * 3600_000);
      const { data: s, error: sErr } = await sb.from("sessions").insert({
        guest_id: rid, mentor_id: mentorId, starts_at: startsAt.toISOString(), duration: 45, price: 15000,
        status: "concluída", session_started_at: startsAt.toISOString(),
        session_ended_at: new Date(startsAt.getTime() + 45 * 60_000).toISOString(), actual_duration_minutes: 45,
      }).select("id").single();
      if (sErr) throw new Error(`review session: ${sErr.message}`);
      sessionId = s.id;
    }
    const { error: rErr } = await sb.from("reviews").upsert(
      { session_id: sessionId, reviewer_id: rid, rating: r.rating, text: r.text, anonymous: false },
      { onConflict: "session_id,reviewer_id" },
    );
    if (rErr) throw new Error(`review: ${rErr.message}`);
    created++;
  }
  console.log(`reviews: ${created} on ${DEMO_MENTOR.slug}`);

  console.log("done");
}

main().catch((e) => { console.error(e); process.exit(1); });
