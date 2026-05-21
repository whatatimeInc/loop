import { Logo } from "@/components/Logo";
import { LinkButton } from "@/components/ui/Button";

export function Footer() {
  return (
    <footer className="bg-dark text-gray-25">

      {/* Banner CTA */}
      <div className="bg-lime text-dark px-6 py-12 text-center">
        <h2 className="text-3xl font-bold mb-2">Pronto para monetizar seu acesso?</h2>
        <p className="text-dark/70 mb-6">Crie seu perfil em 2 minutos. Sem taxas de adesão.</p>
        <LinkButton href="/criar" variant="secondary" size="lg">
          Criar meu perfil
        </LinkButton>
      </div>

      {/* Corpo */}
      <div className="max-w-5xl mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <Logo size="footer" light />
          <p className="text-sm text-gray-400 mt-3">
            Monetize seu acesso.<br />Transforme seguidores em clientes.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Plataforma</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="/explorar" className="hover:text-gray-25 transition-colors">Explorar</a></li>
            <li><a href="/seja-mentor" className="hover:text-gray-25 transition-colors">Seja um mentor</a></li>
            <li><a href="/criar" className="hover:text-gray-25 transition-colors">Criar perfil</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Suporte</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="#" className="hover:text-gray-25 transition-colors">Central de ajuda</a></li>
            <li><a href="#" className="hover:text-gray-25 transition-colors">Termos de uso</a></li>
            <li><a href="#" className="hover:text-gray-25 transition-colors">Privacidade</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Contato</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li><a href="mailto:oi@face.talk" className="hover:text-gray-25 transition-colors">oi@face.talk</a></li>
            <li><a href="#" className="hover:text-gray-25 transition-colors">Instagram</a></li>
            <li><a href="#" className="hover:text-gray-25 transition-colors">LinkedIn</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 px-6 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} face.Talk. Todos os direitos reservados.
      </div>

    </footer>
  );
}