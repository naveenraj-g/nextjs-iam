"use server";

import { createServerAction } from "zsa";
import { runWithTransport } from "../../transport/runWithTransport";
import {
  listAgentsController,
  TListAgentsControllerOutput,
  registerAgentController,
  TRegisterAgentControllerOutput,
  updateAgentController,
  TUpdateAgentControllerOutput,
  revokeAgentController,
  TRevokeAgentControllerOutput,
  reactivateAgentController,
  TReactivateAgentControllerOutput,
  grantAgentCapabilityController,
  TGrantAgentCapabilityControllerOutput,
  cleanupAgentsController,
  TCleanupAgentsControllerOutput,
  listPendingApprovalsController,
  TListPendingApprovalsControllerOutput,
  approveCapabilityController,
  TApproveCapabilityControllerOutput,
  listHostsController,
  TListHostsControllerOutput,
  createHostController,
  TCreateHostControllerOutput,
  updateHostController,
  TUpdateHostControllerOutput,
  revokeHostController,
  TRevokeHostControllerOutput,
} from "@/modules/server/core/admin/interface-adapters/controllers/agent-auth";
import {
  RevokeAgentActionSchema,
  ReactivateAgentActionSchema,
  GrantCapabilityActionSchema,
  RegisterAgentActionSchema,
  UpdateAgentActionSchema,
  CleanupAgentsActionSchema,
  ApproveCapabilityActionSchema,
  CreateHostActionSchema,
  UpdateHostActionSchema,
  RevokeHostActionSchema,
} from "@/modules/entities/schemas/admin/agent-auth/agent-auth.schema";

// -------------------------------------------------- Agents

export const listAgentsAction = createServerAction().handler(async () => {
  return await runWithTransport<TListAgentsControllerOutput>(async () => {
    const data = await listAgentsController();
    return { result: data };
  });
});

export const registerAgentAction = createServerAction()
  .input(RegisterAgentActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRegisterAgentControllerOutput>(async () => {
      const data = await registerAgentController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const updateAgentAction = createServerAction()
  .input(UpdateAgentActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateAgentControllerOutput>(async () => {
      const data = await updateAgentController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const revokeAgentAction = createServerAction()
  .input(RevokeAgentActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRevokeAgentControllerOutput>(async () => {
      const data = await revokeAgentController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const reactivateAgentAction = createServerAction()
  .input(ReactivateAgentActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TReactivateAgentControllerOutput>(
      async () => {
        const data = await reactivateAgentController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

export const grantAgentCapabilityAction = createServerAction()
  .input(GrantCapabilityActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TGrantAgentCapabilityControllerOutput>(
      async () => {
        const data = await grantAgentCapabilityController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

export const cleanupAgentsAction = createServerAction()
  .input(CleanupAgentsActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCleanupAgentsControllerOutput>(async () => {
      const data = await cleanupAgentsController();
      return { result: data, transport: input.transportOptions };
    });
  });

// -------------------------------------------------- Approvals

export const listPendingApprovalsAction = createServerAction().handler(
  async () => {
    return await runWithTransport<TListPendingApprovalsControllerOutput>(
      async () => {
        const data = await listPendingApprovalsController();
        return { result: data };
      },
    );
  },
);

export const approveCapabilityAction = createServerAction()
  .input(ApproveCapabilityActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TApproveCapabilityControllerOutput>(
      async () => {
        const data = await approveCapabilityController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

// -------------------------------------------------- Hosts

export const listHostsAction = createServerAction().handler(async () => {
  return await runWithTransport<TListHostsControllerOutput>(async () => {
    const data = await listHostsController();
    return { result: data };
  });
});

export const createHostAction = createServerAction()
  .input(CreateHostActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCreateHostControllerOutput>(async () => {
      const data = await createHostController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const updateHostAction = createServerAction()
  .input(UpdateHostActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateHostControllerOutput>(async () => {
      const data = await updateHostController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const revokeHostAction = createServerAction()
  .input(RevokeHostActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRevokeHostControllerOutput>(async () => {
      const data = await revokeHostController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });
