import { auth } from "@/modules/server/auth-provider/auth";
import { headers } from "next/headers";
import { IConsentsService } from "../../domain/interfaces/consents.service.interface";
import {
  ConsentSchema,
  ListConsentsResponseSchema,
  TConsentSchema,
  TDeleteConsentValidationSchema,
  TGetConsentValidationSchema,
  TListConsentsResponseSchema,
  TUpdateConsentScopesValidationSchema,
} from "@/modules/entities/schemas/admin/consents/consents.schema";

export class ConsentsService implements IConsentsService {
  async listConsents(): Promise<TListConsentsResponseSchema> {
    const res = await auth.api.getOAuthConsents({
      headers: await headers(),
    });
    return ListConsentsResponseSchema.parseAsync(res);
  }

  async getConsent(
    payload: TGetConsentValidationSchema,
  ): Promise<TConsentSchema> {
    const res = await auth.api.getOAuthConsent({
      headers: await headers(),
      query: { id: payload.id },
    });
    return ConsentSchema.parseAsync(res);
  }

  async updateConsentScopes(
    payload: TUpdateConsentScopesValidationSchema,
  ): Promise<TConsentSchema> {
    const res = await auth.api.updateOAuthConsent({
      headers: await headers(),
      body: { id: payload.id, update: { scopes: payload.scopes } },
    });
    return ConsentSchema.parseAsync(res);
  }

  async deleteConsent(
    payload: TDeleteConsentValidationSchema,
  ): Promise<{ success: boolean }> {
    await auth.api.deleteOAuthConsent({
      headers: await headers(),
      body: { id: payload.id },
    });
    return { success: true };
  }
}
