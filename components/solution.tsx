import {
  Calendar,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  FileText,
  Package,
  Search,
  TrendingUp,
} from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Crew Scheduling",
    description: "Daily crew scheduling with drag-and-drop simplicity",
  },
  {
    icon: Package,
    title: "Materials Tracking",
    description: "Order-by dates and lead time alerts to prevent delays",
  },
  {
    icon: CreditCard,
    title: "Payment Visibility",
    description: "Track payment status and ping GCs for overdue invoices",
  },
  {
    icon: ClipboardList,
    title: "Bid Management",
    description: "Win/loss tracker to improve your bidding strategy",
  },
  {
    icon: CheckCircle2,
    title: "Compliance & Certs",
    description: "Auto-send compliance docs and certifications to GCs",
  },
  {
    icon: FileText,
    title: "Document Storage",
    description: "All your project files in one organized place",
  },
  {
    icon: TrendingUp,
    title: "Job Profitability",
    description: "Track costs and profit on every job in real-time",
  },
  {
    icon: Search,
    title: "Free Marketplace",
    description: "Get discovered by GCs without paying a dime",
  },
];

export function Solution() {
  return (
    <section id="solution" className="border-b-2 border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block border-2 border-border bg-primary px-4 py-2 font-mono text-sm font-bold text-primary-foreground">
            THE SOLUTION
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Everything you need in one flat monthly fee
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            SubBase is the first all-in-one operating system built exclusively
            for subcontractors — at a price you can actually afford.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group border-2 border-border bg-card p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center border-2 border-border bg-secondary text-secondary-foreground">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 font-bold">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
