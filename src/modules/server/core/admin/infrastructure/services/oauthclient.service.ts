import { IOAuthClientService } from "@/modules/server/core/admin/domain/interfaces/oauthclient.service.interface";
import {
  TCreateOAuthClientPayload,
  TUpdateOAuthClientPayload,
  TDeleteOAuthClientPayload,
  TGetOAuthClientPayload,
} from "@/modules/entities/types/admin/oauthclient.type";
import {
  TGetOAuthClientsResponseDtoSchema,
  GetOAuthClientsResponseDtoSchema,
} from "@/modules/entities/schemas/admin/oauthclient/oauthclient.schema";
import { auth } from "@/modules/server/auth-provider/auth";
import { headers } from "next/headers";

export class OAuthClientService implements IOAuthClientService {
  createOAuthClient(payload: TCreateOAuthClientPayload): Promise<void> {
    throw new Error("Method not implemented.");
  }
  updateOAuthClient(payload: TUpdateOAuthClientPayload): Promise<void> {
    throw new Error("Method not implemented.");
  }
  deleteOAuthClient(payload: TDeleteOAuthClientPayload): Promise<void> {
    throw new Error("Method not implemented.");
  }
  getOAuthClient(payload: TGetOAuthClientPayload): Promise<void> {
    throw new Error("Method not implemented.");
  }
  async getOAuthClients(): Promise<TGetOAuthClientsResponseDtoSchema> {
    try {
      const res = await auth.api.getOAuthClients({
        headers: await headers(),
      });
      const data = await GetOAuthClientsResponseDtoSchema.parseAsync(res);
      return data;
    } catch (error) {
      throw error;
    }
  }
}
