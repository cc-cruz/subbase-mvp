import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AgentQueueItem } from "@/components/workspace/agent/queue-item";
import { AgentSummaryCards } from "@/components/workspace/agent/summary-cards";
import { AgentCompliancePanel } from "@/components/workspace/agent/compliance-panel";

// Mock data - in production this would come from the database
const mockQueueItems = [
  {
    id: "1",
    type: "ar" as const,
    priority: "high" as const,
    title: "Invoice #4521 - Overdue 14 days",
    subtitle: "Turner Construction - Downtown Tower Project",
    amount: 47500,
    lastContact: "6 days ago",
    suggestedAction: "Send payment reminder to GC PM",
    draftReady: true,
  },
  {
    id: "2",
    type: "ar" as const,
    priority: "high" as const,
    title: "Invoice #4498 - Overdue 21 days",
    subtitle: "Hensel Phelps - Medical Center Phase 2",
    amount: 32000,
    lastContact: "12 days ago",
    suggestedAction: "Escalate to project manager",
    draftReady: true,
  },
  {
    id: "3",
    type: "ar" as const,
    priority: "medium" as const,
    title: "Invoice #4533 - Due in 3 days",
    subtitle: "McCarthy Building - Airport Terminal B",
    amount: 28750,
    lastContact: "Never",
    suggestedAction: "Send courtesy reminder",
    draftReady: false,
  },
  {
    id: "4",
    type: "compliance" as const,
    priority: "high" as const,
    title: "COI Expired - Turner Construction",
    subtitle: "Certificate of Insurance expired 5 days ago",
    dueDate: "5 days overdue",
    suggestedAction: "Request updated COI from broker",
    draftReady: true,
  },
  {
    id: "5",
    type: "compliance" as const,
    priority: "medium" as const,
    title: "W-9 Missing - New Vendor",
    subtitle: "ABC Electrical Supply needs W-9 on file",
    dueDate: "Required before payment",
    suggestedAction: "Send W-9 request email",
    draftReady: true,
  },
];

const mockComplianceItems = [
  {
    id: "1",
    gcName: "Turner Construction",
    project: "Downtown Tower",
    missing: ["COI (expired)", "Signed Subcontract"],
    status: "urgent" as const,
  },
  {
    id: "2",
    gcName: "Hensel Phelps",
    project: "Medical Center Phase 2",
    missing: ["W-9"],
    status: "warning" as const,
  },
  {
    id: "3",
    gcName: "McCarthy Building",
    project: "Airport Terminal B",
    missing: [],
    status: "complete" as const,
  },
];

export default function AgentDashboardPage() {
  const highPriorityCount = mockQueueItems.filter(
    (item) => item.priority === "high"
  ).length;
  const draftsReadyCount = mockQueueItems.filter(
    (item) => item.draftReady
  ).length;
  const totalOutstanding = mockQueueItems
    .filter((item) => item.type === "ar")
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">Follow-Up Agent</h1>
            <Badge className="border-2 border-border bg-accent text-accent-foreground">
              Beta
            </Badge>
          </div>
          <p className="mt-1 text-muted-foreground">
            Your office follow-up queue with drafts and reminders built in.
          </p>
        </div>
        <Button variant="outline" className="border-2 border-border">
          Agent Settings
        </Button>
      </div>

      {/* Summary Cards */}
      <AgentSummaryCards
        highPriorityCount={highPriorityCount}
        draftsReadyCount={draftsReadyCount}
        totalOutstanding={totalOutstanding}
        complianceIssues={
          mockComplianceItems.filter((i) => i.status !== "complete").length
        }
      />

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Follow-Up Queue - Takes 2 columns */}
        <Card className="border-4 border-border lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4 border-b-2 border-border">
            <div>
              <CardTitle>Needs Follow-Up</CardTitle>
              <CardDescription>
                Ranked by urgency, amount, and days silent
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-2 border-border">
                AR Only
              </Button>
              <Button variant="outline" size="sm" className="border-2 border-border">
                Compliance Only
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y-2 divide-border">
              {mockQueueItems.map((item) => (
                <AgentQueueItem key={item.id} item={item} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Compliance Panel - Takes 1 column */}
        <AgentCompliancePanel items={mockComplianceItems} />
      </div>
    </div>
  );
}
