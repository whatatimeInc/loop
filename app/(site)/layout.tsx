import { Header } from "@/components/Header";
import { FooterReveal } from "@/components/FooterReveal";
import { SiteCanvas } from "@/components/SiteCanvas";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteCanvas>
      <Header />
      <main>{children}</main>
      <FooterReveal />
    </SiteCanvas>
  );
}
