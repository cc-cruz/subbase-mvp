import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/workspace/empty-state";

type ProjectWithRelations = {
  id: string;
  name: string;
  status: string;
  source: string;
  projectAddress: string | null;
  city: string | null;
  state: string | null;
  gcCompany: { name: string } | null;
  contacts: Array<{ id: string }>;
};

export function ProjectList({
  orgSlug,
  projects,
}: {
  orgSlug: string;
  projects: ProjectWithRelations[];
}) {
  return (
    <Card className="border-4 border-border">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          These are the first org-owned records in the real product. Every later
          module will hang off them.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length === 0 ? (
          <EmptyState
            title="No project records yet"
            description="Create the first job to prove the workspace kernel and project CRUD end to end."
          />
        ) : (
          <div className="grid gap-3">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/workspace/${orgSlug}/projects/${project.id}`}
                className="grid gap-3 border-2 border-border bg-background px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-md md:grid-cols-[1fr_auto]"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold">{project.name}</h3>
                    <Badge variant={project.status === "ACTIVE" ? "default" : "outline"}>
                      {project.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {project.gcCompany?.name ?? "No GC company linked"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {project.projectAddress
                      ? `${project.projectAddress}${project.city ? `, ${project.city}` : ""}${project.state ? `, ${project.state}` : ""}`
                      : "Address not set"}
                  </p>
                </div>
                <div className="text-left text-sm text-muted-foreground md:text-right">
                  <p>{project.source.replace("_", " ")}</p>
                  <p>{project.contacts.length} contacts</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
