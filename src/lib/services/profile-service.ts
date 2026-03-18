import { prisma } from "@/lib/db/prisma";
import type { Role } from "@prisma/client";

export async function ensureProfile(params: {
  userId: string;
  email: string;
  defaultRole?: Role;
}) {
  const existing = await prisma.profile.findUnique({
    where: { userId: params.userId },
  });
  if (existing) return existing;

  const isFirstUser = (await prisma.profile.count()) === 0;
  const role = params.defaultRole ?? (isFirstUser ? "ADMIN" : "USER");

  return prisma.profile.create({
    data: {
      userId: params.userId,
      email: params.email,
      role,
    },
  });
}

export async function getProfileByUserId(userId: string) {
  return prisma.profile.findUnique({
    where: { userId },
  });
}
