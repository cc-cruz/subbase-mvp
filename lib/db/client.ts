import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __subbasePrisma__: PrismaClient | undefined;
}

const adapter = process.env.DATABASE_URL
  ? new PrismaPg(process.env.DATABASE_URL)
  : undefined;

export const prisma =
  globalThis.__subbasePrisma__ ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__subbasePrisma__ = prisma;
}

export const db = prisma;

export default prisma;
