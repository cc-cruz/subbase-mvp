import { Check, Minus, X } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const features = [
  {
    name: "Daily crew scheduling",
    subbase: "full",
    procore: "none",
    true: "full",
    knowify: "full",
  },
  {
    name: "Materials & lead time tracking",
    subbase: "full",
    procore: "none",
    true: "none",
    knowify: "none",
  },
  {
    name: "Payment status & GC ping",
    subbase: "full",
    procore: "none",
    true: "none",
    knowify: "none",
  },
  {
    name: "Bid win/loss tracker",
    subbase: "full",
    procore: "none",
    true: "none",
    knowify: "partial",
  },
  {
    name: "Compliance & cert auto-send",
    subbase: "full",
    procore: "none",
    true: "full",
    knowify: "full",
  },
  {
    name: "Attendance tracking (GPS)",
    subbase: "full",
    procore: "none",
    true: "full",
    knowify: "full",
  },
  {
    name: "Document file storage",
    subbase: "full",
    procore: "none",
    true: "none",
    knowify: "full",
  },
  {
    name: "Job cost & profit tracker",
    subbase: "full",
    procore: "none",
    true: "full",
    knowify: "full",
  },
  {
    name: "Free public sub marketplace",
    subbase: "full",
    procore: "none",
    true: "none",
    knowify: "none",
  },
  {
    name: "Built for subcontractors",
    subbase: "full",
    procore: "none",
    true: "full",
    knowify: "full",
  },
];

function FeatureIcon({ status }: { status: string }) {
  if (status === "full") {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center border-2 border-border bg-primary">
          <Check className="h-4 w-4 text-primary-foreground" />
        </div>
      </div>
    );
  }
  if (status === "partial") {
    return (
      <div className="flex items-center justify-center">
        <div className="flex h-6 w-6 items-center justify-center border-2 border-border bg-secondary">
          <Minus className="h-4 w-4 text-secondary-foreground" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center">
      <div className="flex h-6 w-6 items-center justify-center border-2 border-border bg-muted">
        <X className="h-4 w-4 text-muted-foreground" />
      </div>
    </div>
  );
}

export function Comparison() {
  return (
    <section id="comparison" className="border-b-2 border-border bg-muted/30">
      <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-block border-2 border-border bg-accent px-4 py-2 font-mono text-sm font-bold text-accent-foreground">
            COMPARE
          </div>
          <h2 className="mx-auto max-w-3xl text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            See how SubBase stacks up
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-lg text-muted-foreground">
            Procore reflects sub-facing access only — verified by an active GC.
          </p>
        </div>

        <div className="overflow-x-auto">
          <div className="border-2 border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow className="border-b-2 border-border hover:bg-transparent">
                  <TableHead className="w-[280px] font-bold">Feature</TableHead>
                  <TableHead className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="border-2 border-border bg-primary px-2 py-1 font-bold text-primary-foreground">
                        SubBase
                      </span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-medium">
                    Procore
                  </TableHead>
                  <TableHead className="text-center font-medium">
                    TRUE
                  </TableHead>
                  <TableHead className="text-center font-medium">
                    Knowify
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {features.map((feature) => (
                  <TableRow
                    key={feature.name}
                    className="border-b border-border/50"
                  >
                    <TableCell className="font-medium">
                      {feature.name}
                    </TableCell>
                    <TableCell>
                      <FeatureIcon status={feature.subbase} />
                    </TableCell>
                    <TableCell>
                      <FeatureIcon status={feature.procore} />
                    </TableCell>
                    <TableCell>
                      <FeatureIcon status={feature.true} />
                    </TableCell>
                    <TableCell>
                      <FeatureIcon status={feature.knowify} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <span className="font-mono">Legend:</span> Full feature = green check
          | Partial/limited = yellow dash | Not available = gray X
        </div>
      </div>
    </section>
  );
}
