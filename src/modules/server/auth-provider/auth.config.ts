"server-only";

// packages import
import { APIError, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { createAuthMiddleware } from "better-auth/api";
// import { getJwtToken } from "better-auth/plugins/jwt";
import { oauthProvider } from "@better-auth/oauth-provider";
import {
  openAPI,
  admin,
  jwt,
  organization,
  twoFactor,
  username,
  lastLoginMethod,
  createAccessControl,
  magicLink,
  customSession,
} from "better-auth/plugins";
import { apiKey } from "@better-auth/api-key";
// import { agentAuth } from "@better-auth/agent-auth";
import { defaultStatements, adminAc } from "better-auth/plugins/admin/access";
// import { createFromOpenAPI } from "@better-auth/agent-auth/openapi";

// local import
import { prisma } from "../../../../prisma/db";
import { getEmailVerificationTemplate } from "@/modules/shared/email-templates/auth-email.templates";
import { sendAuthEmail } from "@/modules/server/utils/sendAuthEmail";
import {
  getOAuthClientOrigins,
  validAudiencesRef,
} from "./oauth-client-origins";
import { getUserPermissions } from "../utils/getUserPermissions";

// ── Types for customSession context payload ──────────────────────────────────
interface NavNode {
  id: string;
  label: string;
  slug: string;
  icon: string | null;
  href: string | null;
  type: string;
  permissionKeys: string[];
  children: NavNode[];
}

interface NavApp {
  id: string;
  name: string;
  slug: string;
  menus: NavNode[];
}

interface OrgSummary {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
}

// Warm the cache at module load so trustedOrigins and validAudiences are ready
// before the first request. Does not block module initialization.
void getOAuthClientOrigins();

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

// const spec = await fetch(process.env.FHIR_OPENAPI_URL!).then((r) => r.json());

export const authConfig = {
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),

  rateLimit: {
    window: 60, // time window in seconds
    max: 100, // max requests in the window
  },

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

  databaseHooks: {
    session: {
      create: {
        before: async (session) => {
          // Auto-set the active organization to the user's first membership
          // so that activeOrganizationId is never null on a fresh session.
          const membership = await prisma.member.findFirst({
            where: { userId: session.userId },
            orderBy: { createdAt: "asc" },
            select: { organizationId: true },
          });

          return {
            data: {
              ...session,
              activeOrganizationId: membership?.organizationId ?? null,
            },
          };
        },
      },
    },
  },

  // Dynamically load redirect URI origins from registered OAuth clients.
  // Better Auth calls this async function per-request (with TTL cache).
  trustedOrigins: async () => getOAuthClientOrigins(),

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
      const token = ctx.getCookie(ctx.context.authCookies.sessionToken.name);

      // ── OAuth authorize: block authenticated but unverified users ───────────
      if (ctx.path === "/oauth2/authorize") {
        // Not authenticated — Better Auth redirects to loginPage automatically
        if (!token) return;

        const [sessionId] = token.split(".");
        const session =
          await ctx.context.internalAdapter.findSession(sessionId);

        if (session && !session.user.emailVerified) {
          // Preserve the full OAuth query string so the flow can resume after verification
          const requestUrl = new URL(ctx.request?.url as string);
          const authorizeRelativeUrl = `/api/auth/oauth2/authorize?${requestUrl.searchParams.toString()}`;
          const appUrl = process.env.BETTER_AUTH_URL!;
          const location = `${appUrl}/auth/email-verification?email=${encodeURIComponent(session.user.email)}&redirect=${encodeURIComponent(authorizeRelativeUrl)}`;

          return new Response(null, {
            status: 302,
            headers: { Location: location },
          });
        }

        return;
      }

      // ── Admin-only paths ─────────────────────────────────────────────────────
      const protectedPaths = new Set([
        "/oauth2/create-client",
        "/oauth2/register",
      ]);

      if (!protectedPaths.has(ctx.path)) return;

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

    jwt({
      jwt: {
        definePayload: async ({ user, session }) => {
          return {
            ...user,
            activeOrganizationId: session.activeOrganizationId,
            activeTeamId: session.activeTeamId,
          };
        },
      },
    }),

    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.role === "superadmin";
      },
      teams: {
        enabled: true,
        allowRemovingAllTeams: true,
      },
      ac,
      dynamicAccessControl: {
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

      // Mutable array reference: Better Auth reads opts.validAudiences on
      // every token/authorize request, so mutating this array in-place
      // (done by refreshOAuthClientOrigins) makes it effectively dynamic.
      validAudiences: validAudiencesRef,
    }),

    lastLoginMethod(),

    magicLink({
      sendMagicLink: async ({ email, url }) => {
        void sendAuthEmail({
          to: email,
          subject: "Your magic link",
          html: `<a href="${url}">Sign in with magic link</a>`,
        });
      },
    }),

    apiKey({ defaultPrefix: "drgodly_" }),

    // agentAuth({
    //   ...createFromOpenAPI(spec, {
    //     baseUrl: process.env.FHIR_SERVER_URL!,
    //     async resolveHeaders({ ctx }) {
    //       const token = await getJwtToken(ctx);

    //       return {
    //         Authorization: `Bearer ${token}`,
    //       };
    //     },
    //   }),
    // }),

    // ── Context: attach nav apps, permissions, and org list to every session ──
    // Runs at most once per cookie-cache TTL (60 s), so the three DB queries
    // below are not issued on every request.
    customSession(async ({ user, session }) => {
      const sessionData = session as typeof session & {
        activeOrganizationId?: string | null;
      };
      const organizationId = sessionData.activeOrganizationId ?? null;

      const [permSet, memberships, appsData] = await Promise.all([
        organizationId
          ? getUserPermissions(user.id, organizationId)
          : Promise.resolve(new Set<string>()),
        prisma.member.findMany({
          where: { userId: user.id },
          select: {
            organization: {
              select: { id: true, name: true, slug: true, logo: true },
            },
          },
        }),
        prisma.app.findMany({
          where: { isActive: true, deletedAt: null },
          orderBy: { name: "asc" },
          include: {
            menus: {
              where: { isActive: true },
              orderBy: { order: "asc" },
            },
          },
        }),
      ]);

      type RawNode = (typeof appsData)[number]["menus"][number];

      function filterNode(node: RawNode): boolean {
        return (
          node.permissionKeys.length === 0 ||
          node.permissionKeys.some((k) => permSet.has(k))
        );
      }

      function buildTree(
        allNodes: RawNode[],
        parentId: string | null = null,
      ): NavNode[] {
        return allNodes
          .filter((n) => (n.parentId ?? null) === parentId)
          .flatMap((n) => {
            if (!filterNode(n)) return [];
            const children = buildTree(allNodes, n.id);
            if (n.type === "GROUP" && children.length === 0) return [];
            return [
              {
                id: n.id,
                label: n.label,
                slug: n.slug,
                icon: n.icon ?? null,
                href: n.href ?? null,
                type: n.type,
                permissionKeys: n.permissionKeys,
                children,
              },
            ];
          });
      }

      const apps: NavApp[] = appsData
        .map((app) => ({
          id: app.id,
          name: app.name,
          slug: app.slug,
          menus: buildTree(app.menus),
        }))
        .filter((app) => app.menus.length > 0);

      const organizations: OrgSummary[] = memberships.map((m) => ({
        id: m.organization.id,
        name: m.organization.name,
        slug: m.organization.slug,
        logo: m.organization.logo,
      }));

      return {
        user,
        session: {
          ...session,
          apps,
          permissions: Array.from(permSet),
          organizations,
        },
      };
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
