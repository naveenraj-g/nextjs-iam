import { createServerAction } from "zsa";
import { runWithTransport } from "../../transport/runWithTransport";
import {
  getOAuthClientsController,
  TGetOAuthClientsControllerOutput,
} from "@/modules/server/core/admin/interface-adapters/controllers/oauthclient/getOAuthclients.controller";

export const getOAuthClientsAction = createServerAction().handler(async () => {
  return await runWithTransport<TGetOAuthClientsControllerOutput>(async () => {
    const data = await getOAuthClientsController();

    return {
      result: data,
    };
  });
});
