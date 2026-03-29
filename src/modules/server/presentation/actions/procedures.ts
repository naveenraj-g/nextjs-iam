"server-only";

import { createServerActionProcedure } from "zsa";
import { getServerSession } from "@/modules/server/auth-provider/auth-server";
import { ZSAError } from "zsa";

/**
 * Base procedure for all admin server actions.
 * Verifies the caller is authenticated and holds the "superadmin" role.
 * Any action built on this procedure will short-circuit with a FORBIDDEN
 * ZSAError before the handler runs if the check fails.
 */
export const superadminProcedure = createServerActionProcedure().handler(
  async () => {
    const session = await getServerSession();

    if (!session?.user) {
      throw new ZSAError("NOT_AUTHORIZED", "You must be signed in.");
    }

    if (session.user.role !== "superadmin") {
      throw new ZSAError("FORBIDDEN", "Insufficient permissions.");
    }

    return { session };
  },
);
