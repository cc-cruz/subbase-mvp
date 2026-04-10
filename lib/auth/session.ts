import "server-only";

import { prisma } from "@/lib/db/client";
import { ApiError } from "@/lib/api/errors";
import { auth } from "@/lib/auth/server";

type AuthSessionPayload = Awaited<ReturnType<typeof auth.getSession>>["data"];
type AuthUser = NonNullable<AuthSessionPayload>["user"];

function deriveNames(authUser: AuthUser) {
  const [firstName, ...lastNameParts] = (authUser.name ?? "").trim().split(/\s+/).filter(Boolean);

  return {
    firstName: firstName ?? authUser.email.split("@")[0] ?? null,
    lastName: lastNameParts.length > 0 ? lastNameParts.join(" ") : null,
  };
}

export async function getAuthUser() {
  const { data, error } = await auth.getSession();

  if (error) {
    throw new ApiError("unauthorized", "Unable to resolve the current session.", 401);
  }

  return data?.user ?? null;
}

export async function syncUserFromAuth(authUser: AuthUser) {
  const { firstName, lastName } = deriveNames(authUser);

  return prisma.user.upsert({
    where: { authUserId: authUser.id },
    update: {
      email: authUser.email ?? "",
      firstName,
      lastName,
    },
    create: {
      authUserId: authUser.id,
      email: authUser.email ?? "",
      firstName,
      lastName,
      actorKind: "INTERNAL",
    },
  });
}

export async function getCurrentUser() {
  const authUser = await getAuthUser();

  if (!authUser || !authUser.email) {
    return null;
  }

  const user = await syncUserFromAuth(authUser);

  return { authUser, user };
}

export async function requireCurrentUser() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new ApiError("unauthorized", "You must be signed in to access this resource.", 401);
  }

  return currentUser;
}
