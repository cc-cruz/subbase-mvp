import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AgentSummaryCardsProps {
  highPriorityCount: number;
  draftsReadyCount: number;
  totalOutstanding: number;
  complianceIssues: number;
}

export function AgentSummaryCards({
  highPriorityCount,
  draftsReadyCount,
  totalOutstanding,
  complianceIssues,
}: AgentSummaryCardsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="border-4 border-border bg-primary/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-primary" />
            High Priority
          </CardDescription>
          <CardTitle className="text-4xl">{highPriorityCount}</CardTitle>
          <p className="text-sm text-muted-foreground">items need attention</p>
        </CardHeader>
      </Card>

      <Card className="border-4 border-border bg-accent/5">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-accent" />
            Drafts Ready
          </CardDescription>
          <CardTitle className="text-4xl">{draftsReadyCount}</CardTitle>
          <p className="text-sm text-muted-foreground">
            one-click send available
          </p>
        </CardHeader>
      </Card>

      <Card className="border-4 border-border">
        <CardHeader>
          <CardDescription>Outstanding AR</CardDescription>
          <CardTitle className="text-3xl">
            {formatCurrency(totalOutstanding)}
          </CardTitle>
          <p className="text-sm text-muted-foreground">across all invoices</p>
        </CardHeader>
      </Card>

      <Card className="border-4 border-border bg-secondary/10">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            <span className="inline-block h-2 w-2 bg-secondary" />
            Compliance Issues
          </CardDescription>
          <CardTitle className="text-4xl">{complianceIssues}</CardTitle>
          <p className="text-sm text-muted-foreground">docs missing or expired</p>
        </CardHeader>
      </Card>
    </section>
  );
}
