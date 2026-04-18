export const organizationRoleValues = ["ADMIN", "MANAGER", "FOREMAN"] as const;

export type OrganizationRole = (typeof organizationRoleValues)[number];

export const workspacePermissions = [
  "workspace:view",
  "workspace:manage",
  "members:manage",
  "billing:manage",
  "integrations:manage",
  "company_profile:manage",
  "projects:manage",
  "crew:manage",
  "materials:manage",
  "compliance:manage",
  "invoices:view",
  "invoices:manage",
  "leads:manage",
  "shares:manage",
] as const;

export type WorkspacePermission = (typeof workspacePermissions)[number];

const permissionMap: Record<OrganizationRole, WorkspacePermission[]> = {
  ADMIN: [...workspacePermissions],
  MANAGER: [
    "workspace:view",
    "company_profile:manage",
    "projects:manage",
    "crew:manage",
    "materials:manage",
    "compliance:manage",
    "invoices:view",
    "invoices:manage",
    "leads:manage",
    "shares:manage",
  ],
  FOREMAN: [
    "workspace:view",
    "projects:manage",
    "crew:manage",
    "materials:manage",
  ],
};

const rolePriority: Record<OrganizationRole, number> = {
  FOREMAN: 1,
  MANAGER: 2,
  ADMIN: 3,
};

const legacyRoleAliases: Record<string, OrganizationRole> = {
  OWNER: "ADMIN",
  MEMBER: "FOREMAN",
};

function normalizeEnumLikeValue(value: string) {
  return value.trim().replace(/[\s-]+/g, "_").toUpperCase();
}

export function getPermissionsForRole(role: OrganizationRole) {
  return permissionMap[role];
}

export function getResolvedPermissions(role: OrganizationRole) {
  return getPermissionsForRole(role);
}

export function asOrganizationRole(role: string): OrganizationRole {
  const normalized = normalizeEnumLikeValue(role);

  if (normalized in legacyRoleAliases) {
    return legacyRoleAliases[normalized];
  }

  if (normalized === "ADMIN" || normalized === "MANAGER" || normalized === "FOREMAN") {
    return normalized;
  }

  return "FOREMAN";
}

export function roleHasPermission(role: OrganizationRole, permission: WorkspacePermission) {
  return permissionMap[role].includes(permission);
}

export function hasMinimumRole(role: OrganizationRole, minimumRole: OrganizationRole) {
  return rolePriority[role] >= rolePriority[minimumRole];
}
