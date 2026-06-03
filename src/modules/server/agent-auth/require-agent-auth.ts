"server-only";

import type { AgentSession } from "@better-auth/agent-auth";
import { verifyAgentRequest } from "@better-auth/agent-auth";
import type { Auth } from "better-auth";
import { auth } from "../auth-provider/auth";

/**
 * Resolve the agent session from an incoming Request.
 * Returns `null` when the request carries no valid agent JWT.
 * Use this in Next.js API route handlers.
 */
export async function getAgentSession(
  request: Request,
): Promise<AgentSession | null> {
  return verifyAgentRequest(request, auth as unknown as Auth) as Promise<AgentSession | null>;
}

/**
 * Assert that `agentSession` holds an active grant for `capability`.
 * Throws an `Error` when the grant is absent or not active — callers should
 * map this to a 403 response.
 */
export function requireAgentCapability(
  agentSession: AgentSession,
  capability: string,
): void {
  const grant = agentSession.agent.capabilityGrants.find(
    (g) => g.capability === capability && g.status === "active",
  );
  if (!grant) {
    throw new Error(
      `Agent '${agentSession.agent.id}' does not have an active grant for capability '${capability}'`,
    );
  }
}

/**
 * Assert that `agentSession` is a delegated session (linked to a real user).
 * Throws when the session is autonomous and no userId is available.
 */
export function requireDelegatedAgent(agentSession: AgentSession): void {
  if (agentSession.type !== "delegated" || !agentSession.user?.id) {
    throw new Error(
      "This endpoint requires a delegated agent session linked to a user",
    );
  }
}
