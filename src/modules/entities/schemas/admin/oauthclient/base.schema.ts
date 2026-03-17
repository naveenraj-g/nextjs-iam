import z from "zod";

// ------------------------------------------------------- //
// base reusable schemas

export const OAuthClientBaseSchema = z.object({
  client_secret_expires_at: z.number().optional(),
  scope: z.string().optional(),
  client_id_issued_at: z.number(),
  client_name: z.string().min(1).optional(),
  contacts: z.array(z.string()).optional(),
  redirect_uris: z.array(z.string().url()).min(1),
  post_logout_redirect_uris: z.array(z.string().url()).optional(),

  token_endpoint_auth_method: z
    .enum(["none", "client_secret_basic", "client_secret_post"])
    .optional(),

  grant_types: z
    .array(
      z.enum(["authorization_code", "client_credentials", "refresh_token"]),
    )
    .optional(),

  response_types: z.array(z.literal("code")).optional(),
  public: z.boolean().optional(),
  disabled: z.boolean().optional(),

  type: z.enum(["web", "native", "user-agent-based"]).optional(),
  require_pkce: z.boolean().optional(),
  subject_type: z.enum(["public", "pairwise"]).optional(),
  uri: z.string().url().optional(),
  icon: z.string().url().optional(),
  tos: z.string().url().optional(),
  policy: z.string().url().optional(),
  software_id: z.string().optional(),
  software_version: z.string().optional(),
  software_statement: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

export const OAuthClientIdSchema = z.object({
  client_id: z.string(),
  user_id: z.string(),
});
