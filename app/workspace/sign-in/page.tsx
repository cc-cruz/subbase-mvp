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
          <CardTitle className="text-3xl">Log in or create your account</CardTitle>
          <CardDescription className="max-w-lg text-sm">
            Use a one-time email code to enter SubBase. New emails create an
            account after verification and continue into workspace setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SignInForm nextPath={params.next ?? "/workspace"} />
        </CardContent>
      </Card>
    </div>
  );
}
