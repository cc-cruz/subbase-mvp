import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/workspace/empty-state";
import { InviteMemberForm } from "@/components/workspace/members/invite-member-form";
import { RevokeInvitationButton } from "@/components/workspace/members/revoke-invitation-button";
import { requireOrgRouteContext } from "@/lib/api/route-guard";
import { listOrganizationMembers, listPendingInternalInvitations } from "@/lib/domain/members";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export default async function WorkspaceMembersSettingsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  const context = await requireOrgRouteContext({
    orgSlug,
    permission: "members:manage",
  });
  const [members, invitations] = await Promise.all([
    listOrganizationMembers({
      organizationId: context.organization.id,
    }),
    listPendingInternalInvitations({
      organizationId: context.organization.id,
    }),
  ]);

  return (
    <div className="space-y-6">
      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Workspace Members</CardTitle>
          <CardDescription>
            Manage the internal team for this workspace. This slice is limited to
            active memberships and pending internal invites.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Person</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Invited By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="align-top">
                    <div className="space-y-1">
                      <p className="font-semibold">{member.user.displayName}</p>
                      <p className="text-sm text-muted-foreground">{member.user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="align-top">
                    <Badge variant={member.role === "ADMIN" ? "default" : "outline"}>{member.role}</Badge>
                  </TableCell>
                  <TableCell className="align-top text-sm text-muted-foreground">
                    {formatDate(member.createdAt)}
                  </TableCell>
                  <TableCell className="align-top text-sm text-muted-foreground">
                    {member.invitedByUser ? member.invitedByUser.displayName : "Workspace bootstrap"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Invite Internal User</CardTitle>
          <CardDescription>
            Create a pending internal invite with one of the three frozen workspace
            roles: ADMIN, MANAGER, or FOREMAN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InviteMemberForm orgSlug={orgSlug} />
        </CardContent>
      </Card>

      <Card className="border-4 border-border">
        <CardHeader>
          <CardTitle>Pending Internal Invites</CardTitle>
          <CardDescription>
            These invites are still open. Revoking here marks the invitation as
            revoked without deleting the audit record.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <EmptyState
              title="No pending internal invites"
              description="New invites will show up here until they are accepted, expired, or revoked."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invitations.map((invitation) => (
                  <TableRow key={invitation.id}>
                    <TableCell className="align-top">
                      <p className="font-medium">{invitation.email}</p>
                    </TableCell>
                    <TableCell className="align-top">
                      <Badge variant={invitation.role === "ADMIN" ? "default" : "outline"}>
                        {invitation.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {invitation.createdByUser.displayName}
                    </TableCell>
                    <TableCell className="align-top text-sm text-muted-foreground">
                      {formatDate(invitation.expiresAt)}
                    </TableCell>
                    <TableCell className="align-top text-right">
                      <RevokeInvitationButton
                        orgSlug={orgSlug}
                        invitationId={invitation.id}
                        email={invitation.email}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
