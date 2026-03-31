import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="border-b-2 border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <div className="inline-flex w-fit items-center gap-2 border-2 border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              Built by contractors, for contractors
            </div>
            <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              The Operating System for{" "}
              <span className="bg-primary px-2 text-primary-foreground">
                Subcontractors
              </span>
            </h1>
            <p className="max-w-xl text-pretty text-lg text-muted-foreground md:text-xl">
              The first all-in-one platform built exclusively for subs. Crew
              scheduling, materials tracking, payment visibility, and more — at
              a price you can actually afford.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="gap-2">
                Start Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="relative">
            <div className="border-4 border-border bg-card p-4 shadow-xl">
              <div className="flex items-center justify-between border-b-2 border-border pb-3">
                <span className="font-mono text-sm font-medium">
                  Dashboard Overview
                </span>
                <div className="flex gap-2">
                  <div className="h-3 w-3 border-2 border-border bg-destructive" />
                  <div className="h-3 w-3 border-2 border-border bg-secondary" />
                  <div className="h-3 w-3 border-2 border-border bg-primary" />
                </div>
              </div>
              <div className="mt-4 grid gap-3">
                <div className="flex items-center justify-between border-2 border-border bg-muted p-3">
                  <span className="text-sm font-medium">Active Jobs</span>
                  <span className="font-mono text-2xl font-bold text-primary">
                    12
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-border bg-muted p-3">
                  <span className="text-sm font-medium">Crew on Site</span>
                  <span className="font-mono text-2xl font-bold text-primary">
                    34
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-border bg-muted p-3">
                  <span className="text-sm font-medium">Pending Payments</span>
                  <span className="font-mono text-2xl font-bold text-accent">
                    $47.2K
                  </span>
                </div>
                <div className="flex items-center justify-between border-2 border-border bg-muted p-3">
                  <span className="text-sm font-medium">Materials Due</span>
                  <span className="font-mono text-2xl font-bold text-secondary">
                    3 orders
                  </span>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full border-4 border-border bg-primary" />
          </div>
        </div>
      </div>
    </section>
  );
}
