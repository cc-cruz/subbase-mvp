import { created, ok } from "@/lib/api/response";
import { requireOrgRouteContext, withRouteErrorHandling } from "@/lib/api/route-guard";
import {
  createComplianceDocument,
  createComplianceDocumentSchema,
  listComplianceDocuments,
  listComplianceProjects,
} from "@/lib/domain/compliance";

export const GET = withRouteErrorHandling(
  async (_request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "compliance:manage",
    });
    const [items, projects] = await Promise.all([
      listComplianceDocuments(context.organization.id),
      listComplianceProjects(context.organization.id),
    ]);

    return ok({
      items,
      projects,
    });
  },
);

export const POST = withRouteErrorHandling(
  async (request: Request, { params }: { params: Promise<{ orgSlug: string }> }) => {
    const { orgSlug } = await params;
    const context = await requireOrgRouteContext({
      orgSlug,
      permission: "compliance:manage",
    });
    const input = createComplianceDocumentSchema.parse(await request.json());
    const document = await createComplianceDocument({
      organizationId: context.organization.id,
      createdByUserId: context.currentUser.user.id,
      input,
    });

    return created({
      document,
    });
  },
);
