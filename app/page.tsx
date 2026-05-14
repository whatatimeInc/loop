import { HeroSection } from "@/components/home/HeroSection";
import { CarouselSection } from "@/components/home/CarouselSection";
import { CategoriesSection } from "@/components/home/CategoriesSection";
import { BentoSection, CTASection } from "@/components/home/BentoSection";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <CarouselSection />
      <CategoriesSection />
      <BentoSection />
      <CTASection />
    </main>
  );
}
