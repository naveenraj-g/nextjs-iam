"server-only";

// packages import
import { APIError, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
import { getJwtToken } from "better-auth/plugins/jwt";
import { oauthProvider } from "@better-auth/oauth-provider";
import {
  openAPI,
  admin,
  jwt,
  organization,
  twoFactor,
  username,
  createAccessControl,
} from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
import { agentAuth } from "@better-auth/agent-auth";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
import { createFromOpenAPI } from "@better-auth/agent-auth/openapi";

// local import
import { prisma } from "../../../../prisma/db";
import { getEmailVerificationTemplate } from "@/modules/shared/email-templates/auth-email.templates";
import { sendAuthEmail } from "@/modules/server/utils/sendAuthEmail";

const statement = {
  ...defaultStatements,
  oauthClients: ["create", "read", "update", "delete"],
  organizations: ["create", "read", "update", "delete"],
} as const;

const ac = createAccessControl(statement);

const adminRole = ac.newRole({
  oauthClients: ["create", "read"],
  organizations: ["read"],
});

const superAdminRole = ac.newRole({
  ...adminAc.statements,
  oauthClients: ["create", "read", "update", "delete"],
  organizations: ["create", "read", "update", "delete"],
});

const guestRole = ac.newRole({
  user: ["get"],
});

const spec = await fetch(process.env.FHIR_OPENAPI_URL!).then((r) => r.json());

export const authConfig = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  session: {
    storeSessionInDatabase: true,

    // NOTE: Caching the session for 1 min
    // IMPORTANT: Don't cache session for long time
    cookieCache: {
      enabled: true,
      maxAge: 60, // 1 min
    },
  },

  experimental: {
    joins: true,
  },

  trustedOrigins: ["http://localhost:3000"],

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    sendResetPassword: async ({ user, url }) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Reset password",
        html: `<a href="${url}">Reset password</a>`,
      });
    },
    onPasswordReset: async ({ user }) => {
      console.log(`Password for user ${user.email} has been reset.`);
    },
    onExistingUserSignUp: async ({ user }) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Sign-up attempt with your email",
        html: "<p>Someone tried to create an account using your email address. If this was you, try signing in instead. If not, you can safely ignore this email.</p>",
      });
    },
  },

  emailVerification: {
    autoSignInAfterVerification: true,
    sendOnSignUp: true,
    sendVerificationEmail: async ({ user, url }) => {
      void sendAuthEmail({
        to: user.email,
        subject: "Verify email",
        html: getEmailVerificationTemplate(
          url,
          user.name,
          "Betterauth Clean Architecture",
        ),
      });
    },
  },

  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },

  user: {
    changeEmail: {
      enabled: true,
      sendChangeEmailConfirmation: async ({ user, url }) => {
        void sendAuthEmail({
          to: user.email,
          subject: "Change your email",
          html: `Click the link below to change your email: <a href="${url}">Change Email</a>`,
        });
      },
    },
    deleteUser: {
      enabled: true,
      sendDeleteAccountVerification: async ({ user, url }) => {
        void sendAuthEmail({
          to: user.email,
          subject: "Delete your account",
          html: `Click the link below to delete your account: <a href="${url}">Delete Account</a>`,
        });
      },
    },
  },

  disabledPaths: [],

  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      const protectedPaths = new Set([
        "/oauth2/create-client",
        "/oauth2/register",
      ]);

      if (!protectedPaths.has(ctx.path)) return;

      const token = ctx.getCookie(ctx.context.authCookies.sessionToken.name);

      if (!token)
        throw new APIError("UNAUTHORIZED", {
          message: "You must be logged in to perform this action",
        });

      const [sessionId] = token.split(".");

      const session = await ctx.context.internalAdapter.findSession(sessionId);

      if (!session) {
        throw new APIError("UNAUTHORIZED", {
          message: "Session expired or invalid. Please log in again.",
        });
      }

      const user = session.user;

      if (user.role !== "superadmin") {
        throw new APIError("FORBIDDEN", {
          message: "Only superadmin can create OAuth clients",
        });
      }
    }),
  },

  plugins: [
    openAPI(),

    username({
      minUsernameLength: 4,
      maxUsernameLength: 32,
      usernameValidator: (username) => {
        if (username === "admin" || username === "superadmin") {
          return false;
        }
        return true;
      },
    }),

    twoFactor({
      skipVerificationOnEnable: true,
      otpOptions: {
        sendOTP: async ({ user, otp }) => {
          void sendAuthEmail({
            to: user.email,
            subject: "2 FA OTP",
            html: `Your 2 FA OTP: ${otp}`,
          });
        },
      },
    }),

    jwt(),

    organization({
      teams: {
        enabled: true,
      },
    }),

    admin({
      ac,
      roles: {
        admin: adminRole,
        superadmin: superAdminRole,
        guest: guestRole,
      },
      adminRoles: ["admin", "superadmin"],
      defaultRole: "guest",
    }),

    oauthProvider({
      loginPage: process.env.LOGIN_PAGE!,
      consentPage: process.env.CONSENT_PAGE!,
      signup: {
        page: process.env.SIGNUP_PAGE!,
      },

      silenceWarnings: {
        oauthAuthServerConfig: true,
      },

      scopes: ["openid", "profile", "email", "offline_access"],

      storeClientSecret: "hashed",

      allowDynamicClientRegistration: false,

      clientPrivileges: ({ user }) => {
        if (!user) return false;
        return user.role === "superadmin" || user.role === "admin";
      },

      validAudiences: ["http://localhost:3000"],
    }),

    apiKey({ defaultPrefix: "drgodly_" }),

    agentAuth({
      ...createFromOpenAPI(spec, {
        baseUrl: process.env.FHIR_SERVER_URL!,
        async resolveHeaders({ ctx }) {
          const token = await getJwtToken(ctx);

          return {
            Authorization: `Bearer ${token}`,
          };
        },
      }),
    }),

    // NOTE: This plugin make sure the application knows how to set cookies in next.js, it is required for server side operations with better-auth
    nextCookies(),
  ],
} satisfies BetterAuthOptions;

/* 
{
      providerName: "My API",
      providerDescription: "My MCP-enabled API",

      modes: ["delegated", "autonomous"],

      capabilities: [
        {
          name: "hello_world",
          description: "Test capability",
        },
        {
          name: "create_user",
          description: "Create a new user",
          input: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
            required: ["name"],
          },
        },
      ],

      async onExecute({ capability, arguments: args, agentSession }) {
        if (capability === "hello_world") {
          return { message: "Hello from BetterAuth 🚀" };
        }

        if (capability === "create_user") {
          return {
            ok: true,
            name: args?.name,
            createdBy: agentSession.user?.id,
          };
        }

        throw new Error("Unknown capability");
      },
    }
*/
