import z from "zod";
import { TransportOptionsSchema } from "../../transport";
import { OAuthClientBaseSchema, OAuthClientIdSchema } from "./base.schema";

// ------------------------------------------------------- //
// form schemas (client side forms)

export const CreateOAuthClientFormSchema = OAuthClientBaseSchema.pick({
  client_name: true,
  redirect_uris: true,
  grant_types: true,
  scope: true,
  token_endpoint_auth_method: true,
  type: true,
  uri: true,
});

export type TCreateOAuthClientFormSchema = z.infer<
  typeof CreateOAuthClientFormSchema
>;

export const UpdateOAuthClientFormSchema = OAuthClientBaseSchema.partial();

export type TUpdateOAuthClientFormSchema = z.infer<
  typeof UpdateOAuthClientFormSchema
>;

// ------------------------------------------------------- //
// validation schemas (used in controllers / services)

export const CreateOAuthClientValidationSchema = OAuthClientBaseSchema;

export type TCreateOAuthClientValidationSchema = z.infer<
  typeof CreateOAuthClientValidationSchema
>;

export const UpdateOAuthClientValidationSchema = z.object({
  client_id: z.string(),
  update: OAuthClientBaseSchema.partial(),
});

export type TUpdateOAuthClientValidationSchema = z.infer<
  typeof UpdateOAuthClientValidationSchema
>;

export const DeleteOAuthClientValidationSchema = OAuthClientIdSchema;

export type TDeleteOAuthClientValidationSchema = z.infer<
  typeof DeleteOAuthClientValidationSchema
>;

export const GetOAuthClientValidationSchema = OAuthClientIdSchema;

export type TGetOAuthClientValidationSchema = z.infer<
  typeof GetOAuthClientValidationSchema
>;

export const GetOAuthClientsValidationSchema = z.object({});

export type TGetOAuthClientsValidationSchema = z.infer<
  typeof GetOAuthClientsValidationSchema
>;

// ------------------------------------------------------- //
// Server Action Schemas

export const CreateOAuthClientActionSchema = z.object({
  payload: CreateOAuthClientValidationSchema,
  transportOptions: TransportOptionsSchema.optional(),
});

export type TCreateOAuthClientActionSchema = z.infer<
  typeof CreateOAuthClientActionSchema
>;

export const UpdateOAuthClientActionSchema = z.object({
  payload: UpdateOAuthClientValidationSchema,
  transportOptions: TransportOptionsSchema.optional(),
});

export type TUpdateOAuthClientActionSchema = z.infer<
  typeof UpdateOAuthClientActionSchema
>;

export const DeleteOAuthClientActionSchema = z.object({
  payload: DeleteOAuthClientValidationSchema,
  transportOptions: TransportOptionsSchema.optional(),
});

export type TDeleteOAuthClientActionSchema = z.infer<
  typeof DeleteOAuthClientActionSchema
>;

export const GetOAuthClientActionSchema = z.object({
  payload: GetOAuthClientValidationSchema,
  transportOptions: TransportOptionsSchema.optional(),
});

export type TGetOAuthClientActionSchema = z.infer<
  typeof GetOAuthClientActionSchema
>;

export const GetOAuthClientsActionSchema = z.object({
  transportOptions: TransportOptionsSchema.optional(),
});

export type TGetOAuthClientsActionSchema = z.infer<
  typeof GetOAuthClientsActionSchema
>;

// ------------------------------------------------------- //
// Response DTO schemas

export const OAuthClientDtoSchema = OAuthClientIdSchema.merge(
  OAuthClientBaseSchema.pick({
    client_secret_expires_at: true,
    scope: true,
    client_id_issued_at: true,
    client_name: true,
    contacts: true,
    redirect_uris: true,
    post_logout_redirect_uris: true,
    token_endpoint_auth_method: true,
    grant_types: true,
    response_types: true,
    public: true,
    disabled: true,
  }),
);

export type TOAuthClientDtoSchema = z.infer<typeof OAuthClientDtoSchema>;

export const GetOAuthClientResponseDtoSchema = OAuthClientDtoSchema;

export type TGetOAuthClientResponseDtoSchema = z.infer<
  typeof GetOAuthClientResponseDtoSchema
>;

export const GetOAuthClientsResponseDtoSchema = z.array(OAuthClientDtoSchema);

export type TGetOAuthClientsResponseDtoSchema = z.infer<
  typeof GetOAuthClientsResponseDtoSchema
>;

export const DeleteOAuthClientResponseDtoSchema = z.object({
  success: z.boolean(),
});

export type TDeleteOAuthClientResponseDtoSchema = z.infer<
  typeof DeleteOAuthClientResponseDtoSchema
>;
