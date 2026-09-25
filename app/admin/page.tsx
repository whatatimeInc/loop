import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { requireAdminPage } from "@/lib/admin-guard";
import { APP_TZ } from "@/lib/slots";
import { tokens } from "@/components/ui/tokens";
import { CancelSessionButton } from "./CancelSessionButton";

export const metadata = { title: "Admin — Loop.Talk", robots: { index: false, follow: false } };

// Newest first, capped: this is an operations view, not an export.
const LIMIT = 200;

const STATUS_LABEL: Record<string, string> = {
  agendada: "Agendada",
  "concluída": "Concluída",
  cancelada: "Cancelada",
  mentor_no_show: "Mentor faltou",
  guest_no_show: "Convidado faltou",
};

type Person = { name: string | null; last_name: string | null; email: string | null } | null;
type SessionRow = {
  id: string;
  starts_at: string;
  duration: number;
  status: string;
  mentor: Person;
  guest: Person;
};
type UserRow = {
  id: string;
  name: string | null;
  last_name: string | null;
  email: string;
  is_mentor: boolean;
  created_at: string;
};

const when = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { timeZone: APP_TZ, dateStyle: "short", timeStyle: "short" });
const fullName = (p: Person) => [p?.name, p?.last_name].filter(Boolean).join(" ") || "—";

const th: React.CSSProperties = { textAlign: "left", padding: "8px 12px", fontSize: 12, color: tokens.muted, fontWeight: 600, borderBottom: `1px solid ${tokens.border}` };
const td: React.CSSProperties = { padding: "10px 12px", fontSize: 14, color: tokens.dark, borderBottom: `1px solid ${tokens.border}`, verticalAlign: "top" };
const sub: React.CSSProperties = { display: "block", fontSize: 12, color: tokens.muted };

function Count({ n }: { n: number }) {
  return (
    <p style={{ fontSize: 13, color: tokens.muted, margin: "0 0 12px" }}>
      Mostrando {n}{n === LIMIT ? ` (lista cortada nos ${LIMIT} mais recentes)` : ""}.
    </p>
  );
}

function Failed({ what }: { what: string }) {
  // A failed read must never look like an empty list.
  return <p role="alert" style={{ fontSize: 14, color: tokens.red }}>Não foi possível carregar {what}. Recarregue a página.</p>;
}

type Props = { searchParams: Promise<{ tab?: string }> };

export default async function AdminPage({ searchParams }: Props) {
  const admin = await requireAdminPage();
  const { tab } = await searchParams;
  const current = tab === "usuarios" ? "usuarios" : "sessoes";

  // Service-role client: RLS does not apply; access was decided by requireAdminPage.
  const supabase = createServiceClient();

  let body: React.ReactNode;
  if (current === "sessoes") {
    const { data, error } = await supabase
      .from("sessions")
      .select(`
        id, starts_at, duration, status,
        mentor:profiles!sessions_mentor_id_fkey(name, last_name, email),
        guest:profiles!sessions_guest_id_fkey(name, last_name, email)
      `)
      .order("starts_at", { ascending: false })
      .limit(LIMIT);
    const rows = (data ?? []) as unknown as SessionRow[];
    body = error ? <Failed what="as sessões" /> : (
      <>
        <Count n={rows.length} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: tokens.card }}>
            <thead>
              <tr>
                <th style={th}>Horário</th><th style={th}>Status</th><th style={th}>Mentor</th><th style={th}>Convidado</th><th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id}>
                  <td style={td}>{when(s.starts_at)}<span style={sub}>{s.duration} min</span></td>
                  <td style={td}>{STATUS_LABEL[s.status] ?? s.status}</td>
                  <td style={td}>{fullName(s.mentor)}<span style={sub}>{s.mentor?.email ?? ""}</span></td>
                  <td style={td}>{fullName(s.guest)}<span style={sub}>{s.guest?.email ?? ""}</span></td>
                  <td style={td}>{s.status === "agendada" ? <CancelSessionButton sessionId={s.id} /> : null}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  } else {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, last_name, email, is_mentor, created_at")
      .order("created_at", { ascending: false })
      .limit(LIMIT);
    const rows = (data ?? []) as UserRow[];
    body = error ? <Failed what="os usuários" /> : (
      <>
        <Count n={rows.length} />
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: tokens.card }}>
            <thead>
              <tr><th style={th}>Nome</th><th style={th}>E-mail</th><th style={th}>Mentor</th><th style={th}>Cadastro</th></tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id}>
                  <td style={td}>{fullName(u)}</td>
                  <td style={td}>{u.email || "—"}</td>
                  <td style={td}>{u.is_mentor ? "Sim" : "Não"}</td>
                  <td style={td}>{when(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: "8px 14px", borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: "none",
    color: tokens.dark, background: active ? tokens.lime : "transparent", border: `1px solid ${active ? tokens.lime : tokens.border}`,
  });

  return (
    <main style={{ minHeight: "100vh", background: tokens.beige, padding: "32px 24px", fontFamily: "Inter, sans-serif" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
          <h1 style={{ fontSize: 22, color: tokens.dark, margin: 0 }}>Área interna</h1>
          <span style={{ fontSize: 13, color: tokens.muted }}>{admin.email}</span>
        </header>
        <nav style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <Link href="/admin?tab=sessoes" style={tabStyle(current === "sessoes")}>Sessões</Link>
          <Link href="/admin?tab=usuarios" style={tabStyle(current === "usuarios")}>Usuários</Link>
        </nav>
        {body}
      </div>
    </main>
  );
}
