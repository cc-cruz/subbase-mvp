import { AlertTriangle, Ban, DollarSign, Puzzle } from "lucide-react";

const painPoints = [
  {
    icon: Ban,
    title: "Built for GCs, Not You",
    description:
      "Procore, Buildertrend, CoConstruct — they are all built for General Contractors. You get limited access to documents, RFIs, and submittals. Nothing else.",
  },
  {
    icon: Puzzle,
    title: "Fragmented Tools",
    description:
      "Scheduling in one app, payments in another, compliance in a spreadsheet. You are juggling 4+ tools just to run your business.",
  },
  {
    icon: DollarSign,
    title: "Hidden Costs",
    description:
      "TRUE advertises $99/month but charges $800-$1,000/month for add-ons to match what SubBase includes at one flat rate.",
  },
  {
    icon: AlertTriangle,
    title: "No Visibility",
    description:
      "No scheduling, no bid tracking, no payment visibility, and no compliance tools of your own. You are flying blind.",
  },
];

export function Problem() {
  return (
    <section id="problem" className="border-b-2 border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block border-2 border-border bg-destructive px-4 py-2 font-mono text-sm font-bold text-destructive-foreground">
            THE PROBLEM
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Construction software forgot about subcontractors
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            There are over 1 million subcontractors in the United States. Every
            major platform is built for someone else.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {painPoints.map((point) => (
            <div
              key={point.title}
              className="group border-2 border-border bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center border-2 border-border bg-primary text-primary-foreground">
                <point.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-bold">{point.title}</h3>
              <p className="text-muted-foreground">{point.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
