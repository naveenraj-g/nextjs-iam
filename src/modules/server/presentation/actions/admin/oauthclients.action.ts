"use server";

import { createServerAction } from "zsa";
import { runWithTransport } from "../../transport/runWithTransport";
import {
  CreateOAuthClientActionSchema,
  UpdateOAuthClientActionSchema,
  DeleteOAuthClientActionSchema,
  RotateClientSecretActionSchema,
} from "@/modules/entities/schemas/admin/oauthclient/oauthclient.schema";
import {
  createOAuthClientController,
  getOAuthClientsController,
  updateOAuthClientController,
  deleteOAuthClientController,
  rotateClientSecretController,
  TCreateOAuthClientControllerOutput,
  TGetOAuthClientsControllerOutput,
  TUpdateOAuthClientControllerOutput,
  TDeleteOAuthClientControllerOutput,
  TRotateClientSecretControllerOutput,
} from "@/modules/server/core/admin/interface-adapters/controllers/oauthclient";

export const getOAuthClientsAction = createServerAction().handler(async () => {
  return await runWithTransport<TGetOAuthClientsControllerOutput>(async () => {
    const data = await getOAuthClientsController();
    return { result: data };
  });
});

export const createOAuthClientAction = createServerAction()
  .input(CreateOAuthClientActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TCreateOAuthClientControllerOutput>(
      async () => {
        const data = await createOAuthClientController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

export const updateOAuthClientAction = createServerAction()
  .input(UpdateOAuthClientActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TUpdateOAuthClientControllerOutput>(
      async () => {
        const data = await updateOAuthClientController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

export const deleteOAuthClientAction = createServerAction()
  .input(DeleteOAuthClientActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TDeleteOAuthClientControllerOutput>(
      async () => {
        const data = await deleteOAuthClientController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });

export const rotateClientSecretAction = createServerAction()
  .input(RotateClientSecretActionSchema, { skipInputParsing: true })
  .handler(async ({ input }) => {
    return await runWithTransport<TRotateClientSecretControllerOutput>(
      async () => {
        const data = await rotateClientSecretController(input.payload);
        return { result: data, transport: input.transportOptions };
      },
    );
  });
