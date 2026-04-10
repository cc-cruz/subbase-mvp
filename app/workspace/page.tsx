import { redirect } from "next/navigation";

import { getDefaultWorkspaceSlug } from "@/lib/auth/memberships";
import { getCurrentUser } from "@/lib/auth/session";

export default async function WorkspaceIndexPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/workspace/sign-in");
  }

  const defaultWorkspaceSlug = await getDefaultWorkspaceSlug(currentUser.user.id);

  if (!defaultWorkspaceSlug) {
    redirect("/workspace/onboarding");
  }

  redirect(`/workspace/${defaultWorkspaceSlug}`);
}
