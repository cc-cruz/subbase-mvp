"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QueueItem {
  id: string;
  type: "ar" | "compliance";
  priority: "high" | "medium" | "low";
  title: string;
  subtitle: string;
  amount?: number;
  lastContact?: string;
  dueDate?: string;
  suggestedAction: string;
  draftReady: boolean;
}

interface AgentQueueItemProps {
  item: QueueItem;
}

export function AgentQueueItem({ item }: AgentQueueItemProps) {
  const [expanded, setExpanded] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const priorityStyles = {
    high: "bg-primary text-primary-foreground",
    medium: "bg-secondary text-secondary-foreground",
    low: "bg-muted text-muted-foreground",
  };

  return (
    <div
      className="group cursor-pointer px-6 py-4 transition hover:bg-muted/30"
      onClick={() => setExpanded(!expanded)}
    >
      {/* Main Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Priority Indicator */}
          <div
            className={`mt-1 h-3 w-3 shrink-0 border-2 border-border ${
              item.priority === "high"
                ? "bg-primary"
                : item.priority === "medium"
                ? "bg-secondary"
                : "bg-muted"
            }`}
          />

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{item.title}</span>
              <Badge
                variant="outline"
                className="border-2 border-border text-xs"
              >
                {item.type === "ar" ? "AR" : "Compliance"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{item.subtitle}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              {item.amount && <span>{formatCurrency(item.amount)}</span>}
              {item.lastContact && (
                <span>Last contact: {item.lastContact}</span>
              )}
              {item.dueDate && <span>{item.dueDate}</span>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {item.draftReady && (
            <Badge
              variant="secondary"
              className="border-2 border-border bg-accent/10 text-accent"
            >
              Draft Ready
            </Badge>
          )}
          <span className="text-muted-foreground transition group-hover:translate-x-1">
            {expanded ? "−" : "+"}
          </span>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="mt-4 space-y-4 border-t-2 border-dashed border-border pt-4">
          {/* Suggested Action */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Suggested Next Step
            </p>
            <p className="text-sm">{item.suggestedAction}</p>
          </div>

          {/* Draft Preview (mock) */}
          {item.draftReady && (
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Draft Message
              </p>
              <div className="border-2 border-border bg-background p-4 text-sm">
                <p className="text-muted-foreground">
                  Hi [Contact Name],
                  <br />
                  <br />
                  I wanted to follow up on Invoice #{item.id.padStart(4, "0")}{" "}
                  for the {item.subtitle.split(" - ")[1] || "project"}. Our
                  records show this invoice is currently outstanding.
                  <br />
                  <br />
                  Could you please provide an update on the payment status?
                  <br />
                  <br />
                  Thank you,
                  <br />
                  [Your Name]
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            {item.draftReady && (
              <Button className="border-2 border-border">
                Review & Send
              </Button>
            )}
            <Button variant="outline" className="border-2 border-border">
              Edit Draft
            </Button>
            <Button variant="outline" className="border-2 border-border">
              Mark as Contacted
            </Button>
            <Button variant="outline" className="border-2 border-border">
              Snooze 3 Days
            </Button>
            {item.type === "ar" && (
              <Button variant="outline" className="border-2 border-border">
                Mark Disputed
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
