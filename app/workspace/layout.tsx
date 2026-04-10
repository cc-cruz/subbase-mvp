import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

export default function WorkspaceRootLayout({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {children}
    </main>
  );
}
