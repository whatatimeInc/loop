import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
      <nav className="flex items-center justify-between gap-6 px-4 py-2 rounded-full bg-white/70 backdrop-blur-md border border-white/40 shadow-soft w-full max-w-3xl">

        {/* Logo */}
        <a href="/" aria-label="Ir para a Home">
          <Logo size="header" />
        </a>

        {/* Links centrais */}
        <div className="hidden md:flex items-center gap-6">
          <a href="/explorar" className="text-sm font-medium hover:opacity-70 transition-opacity">
            Explorar
          </a>
          <a href="/seja-mentor" className="text-sm font-medium hover:opacity-70 transition-opacity">
            Seja um mentor
          </a>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <LinkButton href="/agenda" variant="ghost" size="sm">
                Agenda
              </LinkButton>
              <LinkButton href="/dashboard" variant="ghost" size="sm">
                Dashboard
              </LinkButton>
              <LogoutButton />
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Entrar
              </LinkButton>
              <LinkButton href="/signup" variant="primary" size="sm">
                Começar
              </LinkButton>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
