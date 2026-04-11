import { redirect } from "next/navigation";

import { SignInForm } from "@/components/workspace/sign-in-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/session";

export default async function WorkspaceSignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [currentUser, params] = await Promise.all([getCurrentUser(), searchParams]);

  if (currentUser) {
    redirect("/workspace");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <Card className="w-full max-w-xl border-4 border-border shadow-xl">
        <CardHeader>
          <CardTitle className="text-3xl">Sign In To SubBase</CardTitle>
          <CardDescription className="max-w-lg text-sm">
            Use Neon Auth email verification to get into the internal workspace.
            This keeps the landing page public while the product app stays behind
            auth.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm nextPath={params.next ?? "/workspace"} />
        </CardContent>
      </Card>
    </div>
  );
}
