import { redirect } from "next/navigation";

import { CreateOrganizationForm } from "@/components/workspace/create-organization-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDefaultWorkspaceSlug } from "@/lib/auth/memberships";
import { getCurrentUser } from "@/lib/auth/session";

export default async function WorkspaceOnboardingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/workspace/sign-in?next=/workspace/onboarding");
  }

  const defaultWorkspaceSlug = await getDefaultWorkspaceSlug(currentUser.user.id);

  if (defaultWorkspaceSlug) {
    redirect(`/workspace/${defaultWorkspaceSlug}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-2xl border-4 border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Create Your Workspace</CardTitle>
          <CardDescription>
            Start with the company shell. You can fill out profile details and add
            projects right after this.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CreateOrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
}
