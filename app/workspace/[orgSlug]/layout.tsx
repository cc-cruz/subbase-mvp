import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { WorkspaceHeader } from "@/components/workspace/header";
import { WorkspaceSidebar } from "@/components/workspace/sidebar";
import { requireOrgRouteContext } from "@/lib/api/route-guard";

export default async function WorkspaceOrgLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({ orgSlug }).catch(() => null);

  if (!context) {
    redirect("/workspace");
  }

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-4 py-6 lg:px-6">
        <WorkspaceSidebar orgSlug={orgSlug} organizationName={context.organization.name} />
        <div className="flex min-w-0 flex-1 flex-col gap-6">
          <WorkspaceHeader
            orgSlug={orgSlug}
            organizationName={context.organization.name}
            currentUser={context.currentUser.user}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
