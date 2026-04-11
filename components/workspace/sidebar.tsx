"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const navItems = [
  { label: "Overview", path: "" },
  { label: "Projects", path: "/projects" },
  { label: "Company", path: "/settings/company" },
] as const;

export function WorkspaceSidebar({
  orgSlug,
  organizationName,
}: {
  orgSlug: string;
  organizationName: string;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-72 shrink-0 lg:block">
      <div className="sticky top-6 space-y-4 border-4 border-border bg-card p-4 shadow-xl">
        <div className="space-y-1 border-b-2 border-border pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            SubBase Workspace
          </p>
          <h2 className="text-xl font-semibold">{organizationName}</h2>
          <p className="text-sm text-muted-foreground">
            Internal operating surface for projects, crews, materials, and docs.
          </p>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const href = `/workspace/${orgSlug}${item.path}`;
            const isActive =
              pathname === href ||
              (item.path === "" && pathname === `/workspace/${orgSlug}`);

            return (
              <Link
                key={item.label}
                href={href}
                className={cn(
                  "block border-2 border-border px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:bg-secondary/40",
                  isActive ? "bg-primary text-primary-foreground" : "bg-background",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
