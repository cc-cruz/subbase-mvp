"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Package,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HERO_STATES = [
  {
    label: "Crew dispatch",
    progressWidth: "28%",
    summary: "Assigning crews and closing callout gaps before wheels roll.",
    crewStatus: "Dispatching",
    crewNote: "12 assigned across 3 active jobs.",
    crewWidth: "78%",
    crewRows: ["Ready", "Travel set"],
    materialsStatus: "Watching",
    materialsNote: "3 supplier confirmations due today.",
    materialsWidth: "34%",
    paymentStatus: "Monitoring",
    paymentNote: "$47.2K pending and sorted.",
    paymentWidth: "18%",
  },
  {
    label: "Materials check",
    progressWidth: "56%",
    summary: "Catching delivery risk before it turns into lost labor.",
    crewStatus: "Rolling",
    crewNote: "2 crews moving, 1 on standby.",
    crewWidth: "88%",
    crewRows: ["Rolling", "Loaded"],
    materialsStatus: "Flagged",
    materialsNote: "Drywall order 1842 needs a callback.",
    materialsWidth: "72%",
    paymentStatus: "Monitoring",
    paymentNote: "Pending invoices sorted by GC.",
    paymentWidth: "34%",
  },
  {
    label: "Payment follow-up",
    progressWidth: "82%",
    summary: "Surfacing late cash before payroll pressure starts the panic.",
    crewStatus: "On site",
    crewNote: "Crews are on site and unloading.",
    crewWidth: "100%",
    crewRows: ["On site", "Unloading"],
    materialsStatus: "Confirmed",
    materialsNote: "Vendors locked with delivery windows.",
    materialsWidth: "100%",
    paymentStatus: "Follow-up queued",
    paymentNote: "2 overdue invoices need nudges.",
    paymentWidth: "78%",
  },
  {
    label: "Board ready",
    progressWidth: "100%",
    summary: "Crews, deliveries, and cash risk are visible in one place.",
    crewStatus: "Live",
    crewNote: "The field is staffed and moving.",
    crewWidth: "100%",
    crewRows: ["On site", "Unloading"],
    materialsStatus: "Confirmed",
    materialsNote: "Materials board is clear and trusted.",
    materialsWidth: "100%",
    paymentStatus: "Cash board live",
    paymentNote: "Collections list is prioritized.",
    paymentWidth: "100%",
  },
] as const;

const HERO_FEED_ITEMS = [
  {
    stage: 0,
    tag: "crew",
    text: "12 installers routed across 3 active jobs.",
  },
  {
    stage: 1,
    tag: "materials",
    text: "Drywall order 1842 flagged before it burns labor.",
  },
  {
    stage: 2,
    tag: "payments",
    text: "2 overdue invoices surfaced by GC and age bucket.",
  },
  {
    stage: 3,
    tag: "ready",
    text: "The office and field are finally reading the same board.",
  },
] as const;

const HERO_STEPS = ["crew", "materials", "payments", "ready"] as const;
const HERO_STEP_INTERVAL_MS = 1700;
const CREW_ROWS = [
  { crew: "Crew A", job: "Riverside Tower", time: "7:00 AM" },
  { crew: "Crew B", job: "Mercer School", time: "7:30 AM" },
] as const;

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches);

    handleChange();

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

function useHeroSequence({ enabled }: { enabled: boolean }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const reduceMotion = usePrefersReducedMotion();
  const [isInView, setIsInView] = useState(true);
  const [step, setStep] = useState(reduceMotion ? HERO_STATES.length - 1 : 0);
  const wasActiveRef = useRef(false);
  const canAnimate = enabled && isInView && !reduceMotion;

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) {
      return;
    }

    const node = ref.current;

    if (!node || typeof IntersectionObserver === "undefined") {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.45 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [reduceMotion]);

  useEffect(() => {
    const wasActive = wasActiveRef.current;
    wasActiveRef.current = canAnimate;

    if (reduceMotion) {
      return;
    }

    if (canAnimate && !wasActive) {
      const resetId = window.setTimeout(() => {
        setStep(0);
      }, 0);

      return () => window.clearTimeout(resetId);
    }
  }, [canAnimate, reduceMotion]);

  useEffect(() => {
    if (!canAnimate || reduceMotion) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setStep((currentStep) => (currentStep + 1) % HERO_STATES.length);
    }, HERO_STEP_INTERVAL_MS);

    return () => window.clearTimeout(timeoutId);
  }, [canAnimate, reduceMotion, step]);

  return { ref, reduceMotion, step };
}

function HeroVisual() {
  const { ref, reduceMotion, step } = useHeroSequence({ enabled: true });
  const effectiveStep = reduceMotion ? HERO_STATES.length - 1 : step;
  const state = HERO_STATES[effectiveStep];
  const isCrewFocus = effectiveStep === 0;
  const isMaterialsFocus = effectiveStep === 1;
  const isPaymentsFocus = effectiveStep === 2;
  const isReadyFocus = effectiveStep === 3;

  return (
    <div className="relative mx-auto w-full max-w-[35.5rem] lg:ml-auto">
      <div className="pointer-events-none absolute -left-4 top-5 -z-10 h-16 w-16 border-4 border-border bg-secondary" />
      <div className="pointer-events-none absolute -bottom-3 -right-3 -z-10 h-32 w-32 border-4 border-border bg-primary" />

      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden border-4 border-border bg-card p-3.5 shadow-xl transition-transform duration-500 sm:p-4",
          isReadyFocus && !reduceMotion ? "-translate-y-1" : "translate-y-0",
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(0,0,0,0.02)_0%,transparent_30%,rgba(0,0,0,0.06)_100%)]" />

        <div className="relative flex flex-wrap items-start justify-between gap-3 border-b-2 border-border pb-3">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              SubBase dayboard
            </p>
            <h3 className="mt-1 text-base font-bold sm:text-lg">
              What your morning should look like
            </h3>
          </div>

          <div className="shrink-0 border-2 border-border bg-secondary px-2.5 py-2 text-right">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-secondary-foreground">
              {state.label}
            </p>
            <p className="mt-1 text-xs text-secondary-foreground/80">Riverside Tower</p>
          </div>
        </div>

        <div className="relative mt-3 grid gap-2.5 sm:grid-cols-3">
          <div
            className={cn(
              "flex min-h-[11.5rem] flex-col border-2 border-border bg-background p-3 transition-transform duration-300",
              (isCrewFocus || isReadyFocus) && !reduceMotion
                ? "-translate-y-1"
                : "translate-y-0",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
                <Users className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "min-h-7 max-w-[6.75rem] shrink-0 border-2 border-border px-2 py-1 text-center font-mono text-[9px] font-bold uppercase leading-3 tracking-[0.1em]",
                  isCrewFocus || isReadyFocus
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {state.crewStatus}
              </span>
            </div>
            <div className="mt-2 min-w-0">
              <p className="text-sm font-bold leading-5">Crew Scheduling</p>
              <p className="text-xs leading-5 text-muted-foreground">12 assigned</p>
            </div>
            <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
              {state.crewNote}
            </p>
            <div className="mt-auto pt-3">
              <div className="h-3 overflow-hidden border-2 border-border bg-muted">
                <div
                  className="h-full bg-secondary transition-[width] duration-500"
                  style={{ width: state.crewWidth }}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-[11.5rem] flex-col border-2 border-border bg-background p-3 transition-transform duration-300",
              (isMaterialsFocus || isReadyFocus) && !reduceMotion
                ? "-translate-y-1"
                : "translate-y-0",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border bg-accent text-accent-foreground">
                <Package className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "min-h-7 max-w-[6.75rem] shrink-0 border-2 border-border px-2 py-1 text-center font-mono text-[9px] font-bold uppercase leading-3 tracking-[0.1em]",
                  isMaterialsFocus || isReadyFocus
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {state.materialsStatus}
              </span>
            </div>
            <div className="mt-2 min-w-0">
              <p className="text-sm font-bold leading-5">Materials Tracking</p>
              <p className="text-xs leading-5 text-muted-foreground">3 due today</p>
            </div>
            <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
              {state.materialsNote}
            </p>
            <div className="mt-auto pt-3">
              <div className="h-3 overflow-hidden border-2 border-border bg-muted">
                <div
                  className="h-full bg-accent transition-[width] duration-500"
                  style={{ width: state.materialsWidth }}
                />
              </div>
            </div>
          </div>

          <div
            className={cn(
              "flex min-h-[11.5rem] flex-col border-2 border-border bg-background p-3 transition-transform duration-300",
              (isPaymentsFocus || isReadyFocus) && !reduceMotion
                ? "-translate-y-1"
                : "translate-y-0",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-border bg-primary text-primary-foreground">
                <CreditCard className="h-4 w-4" />
              </div>
              <span
                className={cn(
                  "min-h-7 max-w-[7rem] shrink-0 border-2 border-border px-2 py-1 text-center font-mono text-[9px] font-bold uppercase leading-3 tracking-[0.1em]",
                  isPaymentsFocus || isReadyFocus
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {state.paymentStatus}
              </span>
            </div>
            <div className="mt-2 min-w-0">
              <p className="text-sm font-bold leading-5">Payment Visibility</p>
              <p className="text-xs leading-5 text-muted-foreground">$47.2K pending</p>
            </div>
            <p className="mt-2 min-h-[2.5rem] text-xs leading-5 text-muted-foreground">
              {state.paymentNote}
            </p>
            <div className="mt-auto pt-3">
              <div className="h-3 overflow-hidden border-2 border-border bg-muted">
                <div
                  className="h-full bg-primary transition-[width] duration-500"
                  style={{ width: state.paymentWidth }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative mt-2.5 border-2 border-border bg-muted p-3">
          <div className="grid gap-2.5 sm:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
            <div className="border-2 border-border bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                  Live crew board
                </p>
                <span className="border-2 border-border bg-muted px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  6:42 AM
                </span>
              </div>

              <div className="mt-3 space-y-2">
                {CREW_ROWS.map((row, index) => (
                  <div
                    key={row.crew}
                    className="grid grid-cols-[2rem_minmax(0,1fr)_auto] items-center gap-2 border-2 border-border bg-card px-2.5 py-2"
                  >
                    <div className="flex h-8 w-8 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
                      <CalendarDays className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold">{row.crew}</p>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {row.job} • {row.time}
                      </p>
                    </div>
                    <span className="max-w-[6rem] shrink-0 border-2 border-border bg-muted px-2 py-1 text-right text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
                      {state.crewRows[index]}
                    </span>
                  </div>
                ))}

                <div className="flex items-center justify-between gap-2 border-2 border-border bg-card px-2.5 py-2 text-xs">
                  <span className="font-medium">Crew C • North Lot TI</span>
                  <span className="font-mono uppercase tracking-[0.12em] text-muted-foreground">
                    {effectiveStep < 2 ? "Standby" : "Ready next"}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-2 border-border bg-background p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em]">
                    Morning board
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {state.summary}
                  </p>
                </div>
                <span className="shrink-0 border-2 border-border bg-muted px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                  {effectiveStep + 1}/4
                </span>
              </div>

              <div className="mt-3 h-3 overflow-hidden border-2 border-border bg-muted">
                <div
                  className="h-full transition-[width] duration-500"
                  style={{
                    width: state.progressWidth,
                    backgroundImage:
                      "linear-gradient(90deg,var(--color-secondary) 0%,var(--color-accent) 58%,var(--color-primary) 100%)",
                  }}
                />
              </div>

              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {HERO_STEPS.map((label, index) => {
                  const isActive = index <= effectiveStep;
                  const isCurrent = index === effectiveStep;

                  return (
                    <div key={label} className="space-y-1">
                      <div
                        className={cn(
                          "h-1.5",
                          isActive ? "bg-foreground" : "bg-border",
                        )}
                      />
                      <p
                        className={cn(
                          "font-mono text-[10px] uppercase tracking-[0.15em]",
                          isCurrent
                            ? "text-foreground"
                            : isActive
                              ? "text-foreground/70"
                              : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </p>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 space-y-1.5">
                {HERO_FEED_ITEMS.map((item) => {
                  const isVisible = effectiveStep >= item.stage;

                  return (
                    <div
                      key={item.text}
                      className={cn(
                        "flex items-start gap-2 text-xs leading-5 transition-all duration-300",
                        isVisible ? "translate-x-0 opacity-100" : "-translate-x-1 opacity-35",
                      )}
                    >
                      <span className="mt-1.5 h-2 w-2 shrink-0 border border-border bg-primary" />
                      <span className="shrink-0 border-2 border-border bg-muted px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.15em]">
                        {item.tag}
                      </span>
                      <span className="text-muted-foreground">{item.text}</span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex items-start gap-2 border-t-2 border-border pt-3 text-xs leading-5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span className="text-muted-foreground">
                  One board for the office and the field beats four disconnected apps.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b-2 border-border bg-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[linear-gradient(180deg,rgba(0,0,0,0.04)_0%,transparent_100%)]" />

      <div className="mx-auto max-w-6xl px-6 py-10 md:py-12 lg:py-14">
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,35.5rem)] lg:gap-10">
          <div className="max-w-2xl">
            <div className="inline-flex w-fit items-center gap-2 border-2 border-border bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground">
              Built by contractors, for contractors
            </div>

            <h1 className="mt-6 text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              The Operating System for{" "}
              <span className="bg-primary px-2 text-primary-foreground">
                Subcontractors
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg text-muted-foreground md:text-xl">
              The first all-in-one platform built exclusively for subs. Crew
              scheduling, materials tracking, payment visibility, and more at a
              price you can actually afford.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {["Crew scheduling", "Materials tracking", "Payment visibility"].map(
                (item) => (
                  <span
                    key={item}
                    className="border-2 border-border bg-muted px-3 py-2 font-mono text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
                  >
                    {item}
                  </span>
                ),
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button asChild size="lg" className="gap-2">
                <Link href="/workspace">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline">
                Book a Demo
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required. Cancel anytime.
            </p>
          </div>

          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
