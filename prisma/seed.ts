import { randomUUID } from 'node:crypto'

import { prisma } from '../lib/db/client'
import { normalizeOrganizationSlug } from '../lib/db/organization-scope'

async function resetKernel() {
  await prisma.$transaction([
    prisma.activityLog.deleteMany(),
    prisma.jobRun.deleteMany(),
    prisma.webhookEvent.deleteMany(),
    prisma.organizationIntegration.deleteMany(),
    prisma.subscription.deleteMany(),
    prisma.accessGrant.deleteMany(),
    prisma.fileAttachment.deleteMany(),
    prisma.file.deleteMany(),
    prisma.invitation.deleteMany(),
    prisma.projectContact.deleteMany(),
    prisma.project.deleteMany(),
    prisma.companyTrade.deleteMany(),
    prisma.companyProfile.deleteMany(),
    prisma.gcCompanyMembership.deleteMany(),
    prisma.gcCompany.deleteMany(),
    prisma.organizationMembership.deleteMany(),
    prisma.user.deleteMany(),
    prisma.organization.deleteMany(),
  ])
}

async function main() {
  await resetKernel()

  const organizationSlug = normalizeOrganizationSlug('Atlas Drywall')

  const ownerAuthUserId = randomUUID()
  const gcAuthUserId = randomUUID()

  const organization = await prisma.organization.create({
    data: {
      slug: organizationSlug,
      name: 'Atlas Drywall',
      status: 'ACTIVE',
      planTier: 'trial',
    },
  })

  const owner = await prisma.user.create({
    data: {
      authUserId: ownerAuthUserId,
      email: 'ops@atlasdrywall.com',
      firstName: 'Avery',
      lastName: 'Lopez',
      actorKind: 'INTERNAL',
      status: 'ACTIVE',
    },
  })

  await prisma.organizationMembership.create({
    data: {
      organizationId: organization.id,
      userId: owner.id,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })

  const companyProfile = await prisma.companyProfile.create({
    data: {
      organizationId: organization.id,
      legalName: 'Atlas Drywall, Inc.',
      displayName: 'Atlas Drywall',
      dbaName: 'Atlas Drywall',
      description: 'Interior framing, drywall, and finish subcontracting for commercial TI projects.',
      phone: '(619) 555-0142',
      email: 'ops@atlasdrywall.com',
      websiteUrl: 'https://atlasdrywall.example',
      serviceAreaJson: {
        city: 'San Diego',
        state: 'CA',
        radiusMiles: 75,
      },
      licenseSummary: 'Licensed and insured in California.',
      insuranceSummary: 'General liability and workers compensation in force.',
      marketplaceEnabled: true,
    },
  })

  await prisma.companyTrade.createMany({
    data: [
      {
        organizationId: organization.id,
        tradeCode: 'drywall',
        tradeName: 'Drywall',
      },
      {
        organizationId: organization.id,
        tradeCode: 'framing',
        tradeName: 'Framing',
      },
      {
        organizationId: organization.id,
        tradeCode: 'acoustical-ceilings',
        tradeName: 'Acoustical Ceilings',
      },
    ],
  })

  const gcCompany = await prisma.gcCompany.create({
    data: {
      name: 'WestBuild Construction',
      websiteUrl: 'https://westbuild.example',
      phone: '(619) 555-0101',
      email: 'jane@westbuild.example',
    },
  })

  const gcUser = await prisma.user.create({
    data: {
      authUserId: gcAuthUserId,
      email: 'jane@westbuild.example',
      firstName: 'Jane',
      lastName: 'Kim',
      actorKind: 'GC',
      status: 'ACTIVE',
    },
  })

  await prisma.gcCompanyMembership.create({
    data: {
      gcCompanyId: gcCompany.id,
      userId: gcUser.id,
      role: 'MEMBER',
      status: 'ACTIVE',
    },
  })

  const project = await prisma.project.create({
    data: {
      organizationId: organization.id,
      gcCompanyId: gcCompany.id,
      name: 'Riverside Tower TI',
      slug: 'riverside-tower-ti',
      status: 'ACTIVE',
      source: 'REPEAT_GC',
      projectAddress: '123 Main St',
      city: 'San Diego',
      state: 'CA',
      postalCode: '92101',
      startDate: new Date('2026-04-01'),
      notes: 'Primary tenant improvement package with weekly coordination.',
    },
  })

  await prisma.projectContact.create({
    data: {
      projectId: project.id,
      name: 'Jane Kim',
      companyName: 'WestBuild Construction',
      email: 'jane@westbuild.example',
      phone: '(619) 555-0101',
      role: 'AP / PM',
      isGcContact: true,
    },
  })

  await prisma.subscription.create({
    data: {
      organizationId: organization.id,
      stripeCustomerId: 'cus_demo_atlas',
      stripeSubscriptionId: 'sub_demo_atlas',
      stripePriceId: 'price_demo_trial',
      status: 'trialing',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  })

  await prisma.invitation.createMany({
    data: [
      {
        inviteType: 'internal',
        email: 'pm@atlasdrywall.com',
        organizationId: organization.id,
        roleOrPermission: 'MANAGER',
        tokenHash: `internal-${organizationSlug}-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByUserId: owner.id,
      },
      {
        inviteType: 'gc',
        email: 'jane@westbuild.example',
        organizationId: organization.id,
        gcCompanyId: gcCompany.id,
        roleOrPermission: 'VIEW',
        tokenHash: `gc-${organizationSlug}-${randomUUID()}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdByUserId: owner.id,
      },
    ],
  })

  const accessGrant = await prisma.accessGrant.create({
    data: {
      organizationId: organization.id,
      subjectType: 'GC_COMPANY',
      subjectId: gcCompany.id,
      resourceType: 'PROJECT',
      resourceId: project.id,
      permission: 'VIEW',
      grantedByUserId: owner.id,
    },
  })

  await prisma.activityLog.createMany({
    data: [
      {
        organizationId: organization.id,
        actorType: 'user',
        actorId: owner.id,
        entityType: 'organization',
        entityId: organization.id,
        action: 'organization.created',
        metadata: {
          slug: organization.slug,
        },
      },
      {
        organizationId: organization.id,
        actorType: 'user',
        actorId: owner.id,
        entityType: 'project',
        entityId: project.id,
        action: 'project.created',
        metadata: {
          name: project.name,
          status: project.status,
        },
      },
      {
        organizationId: organization.id,
        actorType: 'user',
        actorId: owner.id,
        entityType: 'access_grant',
        entityId: accessGrant.id,
        action: 'access_grant.created',
        metadata: {
          subjectType: 'GC_COMPANY',
          subjectId: gcCompany.id,
          resourceType: 'PROJECT',
          resourceId: project.id,
          permission: 'VIEW',
        },
      },
    ],
  })

  console.log(
    `Seeded ${organization.name} with ${companyProfile.displayName}, ${project.name}, and GC access demo data.`,
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
