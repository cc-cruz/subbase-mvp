import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  var __subbasePrisma__: PrismaClient | undefined;
}

function createPrismaClient() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required to initialize Prisma.");
  }

  return new PrismaClient({
    adapter: new PrismaPg(databaseUrl),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getPrismaClient() {
  if (!globalThis.__subbasePrisma__) {
    globalThis.__subbasePrisma__ = createPrismaClient();
  }

  return globalThis.__subbasePrisma__;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);

    return typeof value === "function" ? value.bind(client) : value;
  },
});

export const db = prisma;

export default prisma;
