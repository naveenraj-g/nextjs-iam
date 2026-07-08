# CLAUDE.md — nextjs-iam

## Project Purpose

This is a **Next.js IAM (Identity & Access Management)** system built on [Better Auth](https://www.better-auth.com/). It is the central authentication authority for:

- AI agents and MCP servers
- Frontend web applications
- Backend services and APIs
- Mobile applications

It exposes **OAuth 2.1 / OIDC** endpoints, **API keys**, **agent auth**, and an **admin dashboard** for managing users and OAuth clients.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Auth | Better Auth (Prisma adapter) |
| Database | PostgreSQL via Prisma ORM |
| DI Container | `@evyweb/ioctopus` |
| Server Actions | ZSA (Zod Server Actions) |
| Validation | Zod |
| UI | Tailwind CSS + shadcn/ui |
| Client State | Zustand |
| Forms | React Hook Form + `@hookform/resolvers/zod` |
| i18n | next-intl |
| Package Manager | pnpm |

---

## Project Structure

```
src/
├── app/                                      # Next.js App Router — routing and pages only
│   └── [locale]/
│       └── admin/
│           ├── users/
│           │   ├── page.tsx                  # Calls getUsersAction, renders UsersTable
│           │   └── layout.tsx                # Wraps with <UserModalProvider />
│           └── oauth-clients/
│               ├── page.tsx
│               └── layout.tsx                # Wraps with <OAuthClientModalProvider />
│
├── modules/
│   ├── entities/                             # Shared — Zod schemas, types, enums (NO framework imports)
│   │   ├── schemas/
│   │   │   ├── admin/
│   │   │   │   ├── users/users.schema.ts     # All user operation schemas
│   │   │   │   └── oauthclient/
│   │   │   │       ├── base.schema.ts        # Shared base + ID schemas
│   │   │   │       └── oauthclient.schema.ts # All OAuth client schemas
│   │   │   └── transport.ts                  # TransportOptionsSchema
│   │   ├── types/admin/
│   │   │   └── oauthclient.type.ts           # TS payload types for write ops
│   │   └── enums/admin/oauth-client/
│   │       └── oauth-client.enum.ts          # ZodEnum for grant types, auth methods, etc.
│   │
│   ├── server/
│   │   ├── auth-provider/
│   │   │   ├── auth.ts                       # Better Auth instance (exported as `auth`)
│   │   │   └── auth.config.ts                # All plugin configuration
│   │   │
│   │   ├── core/admin/                       # Clean Architecture layers
│   │   │   ├── domain/interfaces/
│   │   │   │   ├── users.service.interface.ts
│   │   │   │   └── oauthclient.service.interface.ts
│   │   │   │
│   │   │   ├── application/usecases/
│   │   │   │   ├── users/                    # One file per operation + index.ts
│   │   │   │   │   ├── getUsers.usecase.ts
│   │   │   │   │   ├── createUser.usecase.ts
│   │   │   │   │   ├── updateUser.usecase.ts
│   │   │   │   │   ├── setUserRole.usecase.ts
│   │   │   │   │   ├── banUser.usecase.ts
│   │   │   │   │   ├── unbanUser.usecase.ts
│   │   │   │   │   ├── removeUser.usecase.ts
│   │   │   │   │   ├── setUserPassword.usecase.ts
│   │   │   │   │   ├── revokeUserSessions.usecase.ts
│   │   │   │   │   ├── impersonateUser.usecase.ts
│   │   │   │   │   └── index.ts
│   │   │   │   └── oauthclient/              # One file per operation + index.ts
│   │   │   │       ├── getOAuthClients.usecase.ts
│   │   │   │       ├── createOAuthClient.usecase.ts
│   │   │   │       ├── updateOAuthClient.usecase.ts
│   │   │   │       ├── deleteOAuthClient.usecase.ts
│   │   │   │       ├── rotateClientSecret.usecase.ts
│   │   │   │       └── index.ts
│   │   │   │
│   │   │   ├── infrastructure/services/
│   │   │   │   ├── users.service.ts          # Calls auth.api.* for users
│   │   │   │   └── oauthclient.service.ts    # Calls auth.api.* for OAuth clients
│   │   │   │
│   │   │   └── interface-adapters/controllers/
│   │   │       ├── users/                    # One file per operation + index.ts
│   │   │       └── oauthclient/              # One file per operation + index.ts
│   │   │
│   │   ├── di/
│   │   │   ├── types.ts                      # DI_SYMBOLS + DI_RETURN_TYPES
│   │   │   ├── container.ts                  # createContainer + getInjection
│   │   │   └── modules/
│   │   │       ├── index.ts                  # Re-exports all module registrations
│   │   │       ├── admin/
│   │   │       │   ├── users.module.ts
│   │   │       │   └── oauthclient.module.ts
│   │   │       ├── auth/auth.module.ts
│   │   │       └── email/email.module.ts
│   │   │
│   │   ├── presentation/
│   │   │   ├── actions/admin/
│   │   │   │   ├── index.ts                  # Re-exports all actions
│   │   │   │   ├── users.action.ts
│   │   │   │   └── oauthclients.action.ts
│   │   │   └── transport/
│   │   │       └── runWithTransport.ts       # Handles revalidate/redirect + error mapping
│   │   │
│   │   └── shared/
│   │       ├── auth/require-role.ts          # requireRole() — gates pages by RBAC role
│   │       └── errors/
│   │           ├── schemaParseError.ts       # InputParseError, OutputParseError
│   │           └── mappers/mapErrorToZSA.ts  # Maps domain errors → ZSA errors
│   │
│   └── client/
│       ├── admin/
│       │   ├── stores/
│       │   │   └── admin.store.ts            # Zustand: ModalType, ModalData, onOpen/onClose
│       │   ├── types/
│       │   │   ├── users.type.ts             # TUser, IUsersTableProps
│       │   │   └── oauthclient.type.ts       # TOAuthClient, IOAuthClientsTableProps
│       │   ├── components/
│       │   │   ├── users/
│       │   │   │   ├── UsersTable.tsx
│       │   │   │   └── UsersTableColumn.tsx
│       │   │   └── oauth-clients/
│       │   │       ├── OAuthClientsTable.tsx
│       │   │       └── OAuthClientsTableColumn.tsx
│       │   ├── forms/
│       │   │   ├── users/
│       │   │   │   ├── UserCreateForm.tsx
│       │   │   │   ├── UserUpdateForm.tsx
│       │   │   │   ├── UserSetRoleForm.tsx
│       │   │   │   ├── UserBanForm.tsx
│       │   │   │   └── UserSetPasswordForm.tsx
│       │   │   ├── OAuthClientCreateForm.tsx
│       │   │   └── OAuthClientEditForm.tsx
│       │   ├── modals/
│       │   │   ├── users/
│       │   │   │   ├── CreateUserModal.tsx
│       │   │   │   ├── UpdateUserModal.tsx
│       │   │   │   ├── SetRoleModal.tsx
│       │   │   │   ├── BanUserModal.tsx      # Dual-mode: ban + unban
│       │   │   │   ├── RemoveUserModal.tsx
│       │   │   │   ├── SetUserPasswordModal.tsx
│       │   │   │   ├── RevokeUserSessionsModal.tsx
│       │   │   │   └── ImpersonateUserModal.tsx
│       │   │   └── oauth-clients/
│       │   │       ├── CreateOAuthClientModal.tsx  # Two-phase: form → credentials display
│       │   │       ├── EditOAuthClientModal.tsx
│       │   │       ├── DeleteOAuthClientModal.tsx
│       │   │       └── RotateSecretModal.tsx        # Two-phase: confirm → show new secret
│       │   └── provider/
│       │       ├── UserModalProvider.tsx            # Mounts all user modals
│       │       └── OAuthClientModalProvider.tsx     # Mounts all OAuth client modals
│       │
│       └── shared/
│           ├── components/
│           │   ├── table/                    # DataTable, column sorting
│           │   └── EmptyState.tsx
│           ├── custom-form-fields/           # FormInput, FormSelect, FormSwitch
│           └── error/
│               └── handleZSAError.ts         # Maps ZSA errors to form field errors
│
└── components/                               # Global shadcn/ui components
```

---

## Architecture

**Clean Architecture** with strict one-way dependency flow: outer layers depend on inner, never the reverse.

```
Entities (schemas/types)
  └── Domain (interfaces)
        └── Application (use cases)
              └── Infrastructure (services → Better Auth API)
                    └── Interface Adapters (controllers)
                          └── Presentation (ZSA server actions)
                                └── Client (React components)
```

### Layer Responsibilities

| Layer | Path | Responsibility |
|---|---|---|
| Entities | `src/modules/entities/` | Zod schemas, TS types, enums — zero framework imports |
| Domain | `core/.../domain/` | Service interfaces (contracts only) |
| Application | `core/.../application/usecases/` | One use case per operation — gets service from DI, calls one method |
| Infrastructure | `core/.../infrastructure/services/` | Calls `auth.api.*` — always passes `headers: await headers()` |
| Interface Adapters | `core/.../interface-adapters/controllers/` | Validates input with `safeParseAsync`, calls use case, runs presenter |
| Presentation | `server/presentation/actions/` | ZSA server actions, wrapped in `runWithTransport` |
| Client | `client/admin/` | React components, forms, modals — reads from Zustand store |
| Pages | `app/[locale]/admin/` | Thin shell: calls action, passes result to table component |

---

## Admin Roles (RBAC)

| Role | Permissions |
|---|---|
| `guest` | Read own user info |
| `admin` | Create/read OAuth clients, read organizations |
| `superadmin` | Full CRUD on all resources |

Default role on sign-up: `guest`. Every admin page calls `requireRole(["superadmin"])` (or appropriate level) at the top.

---

## Better Auth Config (`src/modules/server/auth-provider/auth.config.ts`)

**Active plugins:**

| Plugin | Purpose |
|---|---|
| `openAPI` | Auto-generated API reference |
| `username` | Username support (blocks "admin"/"superadmin" as usernames) |
| `twoFactor` | Email OTP 2FA |
| `jwt` | JWT token generation |
| `organization` | Org/team management |
| `admin` | RBAC with custom access control |
| `oauthProvider` | Acts as OAuth 2.1 / OIDC server |
| `apiKey` | API key management (prefix: `drgodly_`) |
| `agentAuth` | AI agent identity and capability-based auth |
| `nextCookies` | Required for server-side Better Auth in Next.js |

**Key settings:**
- `requireEmailVerification: false`
- `allowDynamicClientRegistration: false` — OAuth clients created manually only
- Session cookie cached for 60 seconds
- Custom `before` hook: `/oauth2/create-client` and `/oauth2/register` restricted to `superadmin`

---

## Key Conventions

### Server-side
- **Always pass `headers: await headers()`** to every `auth.api.*` call — Better Auth requires request context
- **Presenter pattern** — every controller has a local `presenter()` function; export `T<Name>ControllerOutput = ReturnType<typeof presenter>`
- **`runWithTransport`** wraps all server actions — handles `revalidatePath`, `redirect`, and error mapping to ZSA errors
- **`skipInputParsing: true`** on all mutation actions — the controller does the actual Zod parsing

### Better Auth return types (critical — check per method)
- Most admin methods return `{ user: UserWithRole }` — use `res.user`
- `adminUpdateUser` returns `UserWithRole` directly — use `res` (not `res.user`)
- `deleteOAuthClient` returns `void` — return `{ success: true }` manually
- `rotateClientSecret` returns `OAuthClient` directly

### Client-side
- **`useAdminStore`** — all modals read `type`, `isOpen`, `data` from a single Zustand store
- **`values` vs `defaultValues`** in `useForm`:
  - Use `defaultValues` for create modals (static initial state)
  - Use `values` for edit/update modals (syncs when `modalData` changes on open)
- **`useSyncExternalStore` hydration guard** in every `ModalProvider` — prevents SSR/client mismatch
- **`adminStore` (not `useAdminStore`)** in column definitions — columns are not React components, can't use hooks

### Zustand store (`isBanned` convention)
- `isBanned: true` = user IS currently banned → BanUserModal shows **unban** UI
- `isBanned: false` = user is NOT currently banned → BanUserModal shows **ban** form
- Never override `isBanned` in the dropdown handler — the initial `modalData` already has the correct value from `user.banned`

### Validation schemas
- `DeleteOAuthClientValidationSchema` and `GetOAuthClientValidationSchema` use only `{ client_id: string }` — NOT the full `OAuthClientIdSchema` (which also requires `user_id`)
- All date fields from Better Auth responses use `z.coerce.date()`
- No `any` types — all methods are fully typed via Zod inference

---

## Implemented Admin Features

All 11 features below are fully wired end-to-end (domain → service → DI module → usecases → controller → server action → client types/components/forms/modals/provider → page), following the layering documented above.

| Feature | Route | Backend folder |
|---|---|---|
| Users | `/admin/users` | `users` |
| OAuth Clients | `/admin/oauth-clients` | `oauthclient` |
| Sessions | `/admin/sessions` | `sessions` |
| Organizations | `/admin/organizations` | `organizations` |
| Consents | `/admin/consents` | `consents` |
| Agent Auth | `/admin/agent-auth` | `agent-auth` |
| Apps | `/admin/apps` | `apps` |
| Resources | `/admin/resources` | `resources` |
| API Keys | `/admin/api-keys` | `apikeys` |
| Preference Templates | `/admin/preference-templates` | `preference-templates` |
| User Context | `/admin/user-context` | `usercontext` |

Users and OAuth Clients are the two most-referenced examples throughout this doc:

### Users (`/admin/users`)
| Operation | Better Auth Method |
|---|---|
| List users | `auth.api.listUsers` |
| Create user | `auth.api.createUser` |
| Update user (name/email/image) | `auth.api.adminUpdateUser` |
| Set role | `auth.api.setRole` |
| Ban user | `auth.api.banUser` |
| Unban user | `auth.api.unbanUser` |
| Delete user | `auth.api.removeUser` |
| Set password | `auth.api.setUserPassword` |
| Revoke all sessions | `auth.api.revokeUserSessions` |
| Impersonate user | `auth.api.impersonateUser` |

### OAuth Clients (`/admin/oauth-clients`)
| Operation | Better Auth Method |
|---|---|
| List clients | `auth.api.getOAuthClients` |
| Create client | `auth.api.adminCreateOAuthClient` |
| Update client | `auth.api.adminUpdateOAuthClient` |
| Delete client | `auth.api.deleteOAuthClient` |
| Get single client | `auth.api.getOAuthClient` (GET, uses `query` not `body`) |
| Rotate secret | `auth.api.rotateClientSecret` |

> Note: backend folder names are inconsistent for 4 features (`agent-auth` vs `agentauth` in some usecase/DI symbols, `apikeys` vs `api-keys`, `oauthclient` vs `oauth-clients`, `usercontext` vs `user-context`) — a kebab-case normalization pass is tracked as a follow-up. New features should use kebab-case consistently across every layer.

---

## Adding a New Admin Feature

Full step-by-step guide in `SKILL.md`.

Short checklist:
1. Schema → `src/modules/entities/schemas/admin/<feature>/`
2. Interface → `core/admin/domain/interfaces/<feature>.service.interface.ts`
3. Service → `core/admin/infrastructure/services/<feature>.service.ts`
4. DI → `di/modules/admin/<feature>.module.ts` + update `types.ts`, `modules/index.ts`, `container.ts`
5. Use cases → `core/admin/application/usecases/<feature>/` (one file per op + `index.ts`)
6. Controllers → `core/admin/interface-adapters/controllers/<feature>/` (one file per op + `index.ts`)
7. Action → `presentation/actions/admin/<feature>.action.ts` + export from `index.ts`
8. Client types → `client/admin/types/<feature>.type.ts`
9. Store → add modal types and `ModalData` fields to `admin.store.ts`
10. Forms → `client/admin/forms/<feature>/`
11. Modals → `client/admin/modals/<feature>/`
12. Provider → `client/admin/provider/<Feature>ModalProvider.tsx`
13. Components → `client/admin/components/<feature>/`
14. Page + layout → `app/[locale]/admin/<feature>/`
