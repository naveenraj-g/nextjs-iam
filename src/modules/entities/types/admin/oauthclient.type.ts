// backend schemas (used in class methods and interfaces)
// payloads

export type TCreateOAuthClientPayload = {
  client_name?: string;
  redirect_uris: string[];

  // OAuth configuration
  grant_types?: (
    | "authorization_code"
    | "client_credentials"
    | "refresh_token"
  )[];
  response_types?: "code"[];
  scopes?: string[];

  // client authentication
  token_endpoint_auth_method?:
    | "none"
    | "client_secret_basic"
    | "client_secret_post";

  // client type
  type?: "web" | "native" | "user-agent-based";
  public?: boolean;

  // PKCE
  require_pkce?: boolean;

  // subject identifier
  subject_type?: "public" | "pairwise";

  // UI metadata
  uri?: string;
  icon?: string;
  contacts?: string[];
  tos?: string;
  policy?: string;

  // software metadata
  software_id?: string;
  software_version?: string;
  software_statement?: string;

  // advanced metadata
  metadata?: Record<string, any>;
};

export type TUpdateOAuthClientPayload = {
  client_id: string;
  update: {
    client_name?: string;
    redirect_uris?: string[];

    grant_types?: (
      | "authorization_code"
      | "client_credentials"
      | "refresh_token"
    )[];
    response_types?: "code"[];
    scopes?: string[];

    token_endpoint_auth_method?:
      | "none"
      | "client_secret_basic"
      | "client_secret_post";

    uri?: string;
    icon?: string;
    contacts?: string[];
    tos?: string;
    policy?: string;

    software_id?: string;
    software_version?: string;
    software_statement?: string;

    metadata?: Record<string, any>;
  };
};

export type TDeleteOAuthClientPayload = {
  client_id: string;
};

export type TGetOAuthClientPayload = {
  client_id: string;
};
