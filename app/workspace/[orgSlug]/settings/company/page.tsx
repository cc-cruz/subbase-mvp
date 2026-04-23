import { redirect } from "next/navigation";

import { CompanyProfileForm } from "@/components/workspace/company-profile-form";
import { QuickBooksIntegrationCard } from "@/components/workspace/quickbooks-integration-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { getQuickBooksIntegration } from "@/lib/domain/integrations/quickbooks";
import { getCompanyProfile } from "@/lib/domain/profiles/queries";

export default async function WorkspaceCompanySettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ orgSlug: string }>;
  searchParams: Promise<{
    qbo?: string;
    reason?: string;
  }>;
}) {
  const { orgSlug } = await params;
  const query = await searchParams;
  const context = await requireOrgRouteContext({
    orgSlug,
    permission: "company_profile:manage",
  }).catch(() => redirect("/workspace"));
  const [profile, quickBooksIntegration] = await Promise.all([
    getCompanyProfile(context.organization.id),
    getQuickBooksIntegration(context.organization.id),
  ]);
  const canManageIntegrations = context.permissions.includes("integrations:manage");

  return (
    <div className="space-y-6">
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Company Profile</CardTitle>
          <CardDescription>
            This is the canonical company record. Internal settings and future
            marketplace output should both come from here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CompanyProfileForm
            orgSlug={orgSlug}
            initialProfile={profile}
            organizationName={context.organization.name}
          />
        </CardContent>
      </Card>

      <QuickBooksIntegrationCard
        canManage={canManageIntegrations}
        integration={quickBooksIntegration}
        orgSlug={orgSlug}
        statusReason={query.reason ?? null}
        statusResult={query.qbo ?? null}
      />
    </div>
  );
}
