"server-only";

import type { AgentSession } from "@better-auth/agent-auth";
import { prisma } from "../../../../prisma/db";

export async function executeCapability(
  capability: string,
  args: Record<string, unknown>,
  agentSession: AgentSession,
) {
  const isDelegated = agentSession.type === "delegated";
  const userId = agentSession.user?.id;

  switch (capability) {
    case "profile:read": {
      if (!isDelegated || !userId) throw new Error("profile:read requires a delegated agent");
      return prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, image: true, createdAt: true },
      });
    }

    case "profile:write": {
      if (!isDelegated || !userId) throw new Error("profile:write requires a delegated agent");
      const { name, image } = args as { name?: string; image?: string };
      return prisma.user.update({
        where: { id: userId },
        data: { ...(name && { name }), ...(image && { image }) },
        select: { id: true, name: true, email: true, image: true },
      });
    }

    case "organizations:read": {
      if (!isDelegated || !userId) throw new Error("organizations:read requires a delegated agent");
      const members = await prisma.member.findMany({
        where: { userId },
        include: {
          organization: { select: { id: true, name: true, slug: true, logo: true } },
        },
      });
      return { organizations: members.map((m) => m.organization) };
    }

    case "api_keys:read": {
      if (!isDelegated || !userId) throw new Error("api_keys:read requires a delegated agent");
      const keys = await prisma.apikey.findMany({
        where: { referenceId: userId, enabled: true },
        select: { id: true, name: true, start: true, prefix: true, createdAt: true, expiresAt: true },
      });
      return { keys };
    }

    case "api_keys:create":
    case "api_keys:revoke":
      throw new Error(`Capability '${capability}' must be invoked through the API key endpoints`);

    default:
      throw new Error(`Capability '${capability}' is not implemented on this server`);
  }
}
