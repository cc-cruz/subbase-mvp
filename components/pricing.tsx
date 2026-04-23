import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "$149",
    description: "For small sub crews getting organized",
    features: [
      "Up to 10 crew members",
      "Crew scheduling",
      "Payment tracking",
      "Document storage",
      "Basic compliance",
      "Email support",
    ],
    featured: false,
  },
  {
    name: "Professional",
    price: "$249",
    description: "For growing subs running multiple jobs",
    features: [
      "Up to 30 crew members",
      "Everything in Starter",
      "Materials tracking",
      "Bid win/loss tracker",
      "Job profitability",
      "GPS attendance",
      "Priority support",
    ],
    featured: true,
  },
  {
    name: "Business",
    price: "$399",
    description: "For established subs scaling operations",
    features: [
      "Unlimited crew members",
      "Everything in Professional",
      "Advanced analytics",
      "Custom integrations",
      "Dedicated success manager",
      "Phone support",
    ],
    featured: false,
  },
];

const trueAddons = [
  { name: "Base Platform", cost: "$99/mo" },
  { name: "Field Mobile App", cost: "$99/mo" },
  { name: "HR & Time App (GPS)", cost: "$99/mo" },
  { name: "Contracts & Pay Apps", cost: "$149/mo" },
  { name: "Procurement", cost: "$99/mo" },
  { name: "Inventory", cost: "$199/mo" },
  { name: "QuickBooks Integration", cost: "$19–74/mo" },
  { name: "Messaging", cost: "$49/mo" },
];

export function Pricing() {
  return (
    <section id="pricing" className="border-b-2 border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block border-2 border-border bg-secondary px-4 py-2 font-mono text-sm font-bold text-secondary-foreground">
            PRICING
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            One flat monthly fee. No per-seat charges. No hidden add-ons.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative border-2 border-border bg-card p-6 ${
                plan.featured ? "ring-4 ring-primary" : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 border-2 border-border bg-primary px-4 py-1 font-mono text-xs font-bold text-primary-foreground">
                  MOST POPULAR
                </div>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>
              <div className="mb-6">
                <span className="font-mono text-4xl font-bold">
                  {plan.price}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="mb-6 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center border border-border bg-primary">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                <Link href="/workspace">Start Free Trial</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-16 border-2 border-border bg-card p-8">
          <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h3 className="text-xl font-bold">
                TRUE Construction: The Hidden Cost Problem
              </h3>
              <p className="text-muted-foreground">
                TRUE advertises $99/month. Here is what it actually costs to
                match SubBase:
              </p>
            </div>
            <div className="border-2 border-border bg-destructive px-4 py-2 font-mono text-lg font-bold text-destructive-foreground">
              $800–$1,000+/mo
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {trueAddons.map((addon) => (
              <div
                key={addon.name}
                className="flex items-center justify-between border border-border/50 bg-muted p-3"
              >
                <span className="text-sm">{addon.name}</span>
                <span className="font-mono text-sm font-medium text-primary">
                  {addon.cost}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-lg">
            <span className="font-bold">SubBase delivers the same</span> at{" "}
            <span className="border-2 border-border bg-primary px-2 font-mono font-bold text-primary-foreground">
              $149–$399/month
            </span>{" "}
            — saving you{" "}
            <span className="font-bold text-primary">$600–$800/month</span>.
          </p>
        </div>
      </div>
    </section>
  );
}
