import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteCanvas } from "@/components/SiteCanvas";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteCanvas>
      <Header />
      <main>{children}</main>
      <Footer />
    </SiteCanvas>
  );
}
