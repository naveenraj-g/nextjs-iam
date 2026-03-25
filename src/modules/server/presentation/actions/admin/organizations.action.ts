"use server";

import { createServerAction } from "zsa";
import { runWithTransport } from "../../transport/runWithTransport";
import {
  listOrganizationsController,
  TListOrganizationsControllerOutput,
  getOrganizationController,
  TGetOrganizationControllerOutput,
  createOrganizationController,
  TCreateOrganizationControllerOutput,
  updateOrganizationController,
  TUpdateOrganizationControllerOutput,
  deleteOrganizationController,
  TDeleteOrganizationControllerOutput,
  addMemberController,
  TAddMemberControllerOutput,
  updateMemberRoleController,
  TUpdateMemberRoleControllerOutput,
  removeMemberController,
  TRemoveMemberControllerOutput,
  createInvitationController,
  TCreateInvitationControllerOutput,
  cancelInvitationController,
  TCancelInvitationControllerOutput,
  createTeamController,
  TCreateTeamControllerOutput,
  updateTeamController,
  TUpdateTeamControllerOutput,
  removeTeamController,
  TRemoveTeamControllerOutput,
  addTeamMemberController,
  TAddTeamMemberControllerOutput,
  removeTeamMemberController,
  TRemoveTeamMemberControllerOutput,
} from "@/modules/server/core/admin/interface-adapters/controllers/organizations";
import {
  CreateOrganizationActionSchema,
  UpdateOrganizationActionSchema,
  DeleteOrganizationActionSchema,
  AddMemberActionSchema,
  UpdateMemberRoleActionSchema,
  RemoveMemberActionSchema,
  CreateInvitationActionSchema,
  CancelInvitationActionSchema,
  CreateTeamActionSchema,
  UpdateTeamActionSchema,
  RemoveTeamActionSchema,
  AddTeamMemberActionSchema,
  RemoveTeamMemberActionSchema,
} from "@/modules/entities/schemas/admin/organizations/organizations.schema";
import z from "zod";

// ---------------------------------------------------------- //
// Query actions
// ---------------------------------------------------------- //

export const listOrganizationsAction = createServerAction().handler(async () => {
  return await runWithTransport<TListOrganizationsControllerOutput>(async () => {
    const data = await listOrganizationsController();
    return { result: data };
  });
});

export const getOrganizationAction = createServerAction()
  .input(z.object({ organizationId: z.string() }))
  .handler(async ({ input }) => {
    return await runWithTransport<TGetOrganizationControllerOutput>(async () => {
      const data = await getOrganizationController(input.organizationId);
      return { result: data };
    });
  });

// ---------------------------------------------------------- //
// Organization mutation actions
// ---------------------------------------------------------- //

export const createOrganizationAction = createServerAction()
  .input(CreateOrganizationActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCreateOrganizationControllerOutput>(async () => {
      const data = await createOrganizationController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const updateOrganizationAction = createServerAction()
  .input(UpdateOrganizationActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateOrganizationControllerOutput>(async () => {
      const data = await updateOrganizationController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const deleteOrganizationAction = createServerAction()
  .input(DeleteOrganizationActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TDeleteOrganizationControllerOutput>(async () => {
      const data = await deleteOrganizationController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

// ---------------------------------------------------------- //
// Member actions
// ---------------------------------------------------------- //

export const addMemberAction = createServerAction()
  .input(AddMemberActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TAddMemberControllerOutput>(async () => {
      const data = await addMemberController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const updateMemberRoleAction = createServerAction()
  .input(UpdateMemberRoleActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateMemberRoleControllerOutput>(async () => {
      const data = await updateMemberRoleController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const removeMemberAction = createServerAction()
  .input(RemoveMemberActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRemoveMemberControllerOutput>(async () => {
      const data = await removeMemberController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

// ---------------------------------------------------------- //
// Invitation actions
// ---------------------------------------------------------- //

export const createInvitationAction = createServerAction()
  .input(CreateInvitationActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCreateInvitationControllerOutput>(async () => {
      const data = await createInvitationController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const cancelInvitationAction = createServerAction()
  .input(CancelInvitationActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCancelInvitationControllerOutput>(async () => {
      const data = await cancelInvitationController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

// ---------------------------------------------------------- //
// Team actions
// ---------------------------------------------------------- //

export const createTeamAction = createServerAction()
  .input(CreateTeamActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCreateTeamControllerOutput>(async () => {
      const data = await createTeamController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const updateTeamAction = createServerAction()
  .input(UpdateTeamActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateTeamControllerOutput>(async () => {
      const data = await updateTeamController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const removeTeamAction = createServerAction()
  .input(RemoveTeamActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRemoveTeamControllerOutput>(async () => {
      const data = await removeTeamController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

// ---------------------------------------------------------- //
// Team member actions
// ---------------------------------------------------------- //

export const addTeamMemberAction = createServerAction()
  .input(AddTeamMemberActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TAddTeamMemberControllerOutput>(async () => {
      const data = await addTeamMemberController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });

export const removeTeamMemberAction = createServerAction()
  .input(RemoveTeamMemberActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRemoveTeamMemberControllerOutput>(async () => {
      const data = await removeTeamMemberController(input.payload);
      return { result: data, transport: input.transportOptions };
    });
  });
