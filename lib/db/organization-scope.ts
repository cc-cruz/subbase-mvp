export type OrganizationScope = {
  organizationId: string
  organizationSlug?: string | null
  actorType?: 'internal' | 'gc' | 'system'
  actorId?: string | null
  role?: string | null
}

export function normalizeOrganizationSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createOrganizationScope(
  organizationId: string,
  organizationSlug?: string | null,
): OrganizationScope {
  return {
    organizationId,
    organizationSlug: organizationSlug ?? null,
  }
}

export function organizationWhere(organizationId: string) {
  return {
    organizationId,
  }
}
