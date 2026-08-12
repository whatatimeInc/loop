import { Header } from "@/components/Header";
import { FooterReveal } from "@/components/FooterReveal";
import { SiteCanvas } from "@/components/SiteCanvas";
import { WaitlistModalProvider } from "@/components/WaitlistModalProvider";
import { LAUNCH_PHASE } from "@/lib/launch";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SiteCanvas>
      <WaitlistModalProvider>
        <Header phase={LAUNCH_PHASE} />
        <main>{children}</main>
        <FooterReveal phase={LAUNCH_PHASE} />
      </WaitlistModalProvider>
    </SiteCanvas>
  );
}
