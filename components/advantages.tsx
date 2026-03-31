import { HardHat, Package, Search, Shield } from "lucide-react";

const advantages = [
  {
    icon: HardHat,
    title: "Built by an Active GC",
    description:
      "Founded by a San Diego general contractor who uses Procore daily and knows exactly what subs are missing. Not a software team guessing at the problem.",
    color: "bg-primary",
  },
  {
    icon: Search,
    title: "Free Public Marketplace",
    description:
      "Every sub gets a free discoverable profile — no paywall, no signup required to browse. A permanent growth engine competitors cannot replicate.",
    color: "bg-secondary",
  },
  {
    icon: Package,
    title: "Materials Intelligence",
    description:
      "Order-by dates and lead time alerts prevent project delays before they happen. No other sub tool has this — it is completely unserved today.",
    color: "bg-accent",
  },
  {
    icon: Shield,
    title: "Delay Attribution",
    description:
      "Track whether delays are GC-caused or sub-caused with a timestamped paper trail. Legal protection built directly into the daily workflow.",
    color: "bg-primary",
  },
];

export function Advantages() {
  return (
    <section className="border-b-2 border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block border-2 border-border bg-foreground px-4 py-2 font-mono text-sm font-bold text-background">
            WHY SUBBASE
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Our Unfair Advantages
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            We are not just another software company. We are contractors who
            built the tool we wished we had.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {advantages.map((advantage, index) => (
            <div
              key={advantage.title}
              className="group relative border-2 border-border bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="absolute -right-1 -top-1 font-mono text-6xl font-bold text-muted/50">
                {String(index + 1).padStart(2, "0")}
              </div>
              <div
                className={`mb-4 flex h-14 w-14 items-center justify-center border-2 border-border ${advantage.color}`}
              >
                <advantage.icon
                  className={`h-7 w-7 ${
                    advantage.color === "bg-secondary"
                      ? "text-secondary-foreground"
                      : "text-primary-foreground"
                  }`}
                />
              </div>
              <h3 className="mb-3 text-xl font-bold">{advantage.title}</h3>
              <p className="text-muted-foreground">{advantage.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
