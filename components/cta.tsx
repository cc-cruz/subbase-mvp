import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function CTA() {
  return (
    <section className="border-b-2 border-border bg-foreground text-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="flex flex-col items-center text-center">
          <h2 className="max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Procore is built for GCs.
            <br />
            TRUE charges $1,000/month in add-ons.
            <br />
            <span className="text-secondary">
              Nobody built the right tool for subcontractors — until now.
            </span>
          </h2>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="gap-2 border-2 border-background"
            >
              <Link href="/workspace">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-background bg-transparent text-background hover:bg-background hover:text-foreground"
            >
              Book a Demo
            </Button>
          </div>
          <p className="mt-6 text-sm text-background/80">
            No credit card required. 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </section>
  );
}
