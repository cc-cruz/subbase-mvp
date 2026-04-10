import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/workspace/sign-out-button";

export function WorkspaceHeader({
  organizationName,
  currentUser,
}: {
  orgSlug: string;
  organizationName: string;
  currentUser: {
    email: string;
    firstName: string | null;
  };
}) {
  return (
    <header className="flex flex-col gap-4 border-4 border-border bg-card px-5 py-4 shadow-xl md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold">{organizationName}</h1>
          <Badge variant="secondary">internal workspace</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Signed in as {currentUser.firstName ?? currentUser.email}
        </p>
      </div>
      <SignOutButton />
    </header>
  );
}
