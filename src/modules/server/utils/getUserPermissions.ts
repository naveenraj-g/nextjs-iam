import { prisma } from "../../../../prisma/db";

export async function getUserPermissions(
  userId: string,
  organizationId: string,
): Promise<Set<string>> {
  const member = await prisma.member.findFirst({
    where: { userId, organizationId },
    select: { role: true },
  });

  if (!member) return new Set();

  const orgRoles = await prisma.organizationRole.findMany({
    where: { organizationId, role: member.role },
    select: { permission: true },
  });

  return new Set(orgRoles.map((r) => r.permission));
}
