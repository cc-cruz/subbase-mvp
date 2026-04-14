import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ComplianceItem {
  id: string;
  gcName: string;
  project: string;
  missing: string[];
  status: "urgent" | "warning" | "complete";
}

interface AgentCompliancePanelProps {
  items: ComplianceItem[];
}

export function AgentCompliancePanel({ items }: AgentCompliancePanelProps) {
  const statusStyles = {
    urgent: "bg-primary text-primary-foreground",
    warning: "bg-secondary text-secondary-foreground",
    complete: "bg-muted text-muted-foreground",
  };

  const statusLabels = {
    urgent: "Action Required",
    warning: "Missing Docs",
    complete: "Complete",
  };

  return (
    <Card className="border-4 border-border">
      <CardHeader className="border-b-2 border-border">
        <CardTitle>Compliance Packages</CardTitle>
        <CardDescription>
          Document status by GC/Project
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y-2 divide-border">
          {items.map((item) => (
            <div key={item.id} className="p-4 transition hover:bg-muted/30">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <p className="font-semibold">{item.gcName}</p>
                  <p className="text-sm text-muted-foreground">{item.project}</p>
                </div>
                <Badge
                  className={`border-2 border-border ${statusStyles[item.status]}`}
                >
                  {statusLabels[item.status]}
                </Badge>
              </div>

              {item.missing.length > 0 && (
                <div className="mt-3 space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Missing Documents
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {item.missing.map((doc) => (
                      <Badge
                        key={doc}
                        variant="outline"
                        className="border-2 border-border text-xs"
                      >
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {item.status !== "complete" && (
                <div className="mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-2 border-border"
                  >
                    {item.status === "urgent"
                      ? "Send Package Request"
                      : "Request Missing Docs"}
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="border-t-2 border-border p-4">
          <Button variant="outline" className="w-full border-2 border-border">
            View All Compliance Status
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
