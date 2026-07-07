import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/LogoutButton";

export async function Header() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 md:top-4 left-0 right-0 z-50 flex justify-center md:px-4">
      <nav className="flex items-center justify-between gap-4 px-4 h-16 md:h-auto md:py-2 md:rounded-xl bg-white/50 backdrop-blur-md md:bg-white/70 md:border md:border-white/40 md:shadow-soft w-full md:max-w-3xl">

        {/* Logo */}
        <a href="/" aria-label="Ir para a Home">
          <Logo size="header" />
        </a>

        {/* Auth */}
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <LinkButton href="/conta" variant="ghost" size="sm">
                Minha conta
              </LinkButton>
              <LogoutButton />
            </>
          ) : (
            <>
              <LinkButton href="/login" variant="ghost" size="sm">
                Entrar
              </LinkButton>
              <span className="hidden md:inline-flex">
                <LinkButton href="/cadastro" variant="primary" size="sm">
                  Criar perfil
                </LinkButton>
              </span>
            </>
          )}
        </div>

      </nav>
    </header>
  );
}
