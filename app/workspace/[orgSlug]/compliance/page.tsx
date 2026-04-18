import { ComplianceDocumentManager } from "@/components/compliance/compliance-document-manager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { listComplianceDocuments, listComplianceProjects } from "@/lib/domain/compliance";

export default async function WorkspaceCompliancePage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({
    orgSlug,
    permission: "compliance:manage",
  });
  const [items, projects] = await Promise.all([
    listComplianceDocuments(context.organization.id),
    listComplianceProjects(context.organization.id),
  ]);

  return (
    <div className="space-y-6">
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Compliance</CardTitle>
          <CardDescription>
            Start the compliance module with clean internal document records first.
            This slice captures file metadata, category, dates, and whether the
            record hangs off the company or a specific project.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border-2 border-dashed border-border bg-background px-4 py-4 text-sm text-muted-foreground">
            Binary upload and explicit GC sharing are intentionally not in this first
            slice. Each record below is stored as compliance metadata on top of the
            frozen file primitives.
          </div>
        </CardContent>
      </Card>

      <ComplianceDocumentManager orgSlug={orgSlug} items={items} projects={projects} />
    </div>
  );
}
