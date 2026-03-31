import { Header } from "@/components/header";
import { Hero } from "@/components/hero";
import { Stats } from "@/components/stats";
import { Problem } from "@/components/problem";
import { Solution } from "@/components/solution";
import { Comparison } from "@/components/comparison";
import { Pricing } from "@/components/pricing";
import { Advantages } from "@/components/advantages";
import { CTA } from "@/components/cta";
import { Footer } from "@/components/footer";

export default function Page() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Stats />
      <Problem />
      <Solution />
      <Comparison />
      <Pricing />
      <Advantages />
      <CTA />
      <Footer />
    </main>
  );
}
