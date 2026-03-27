/**
 * Seed script: Admin App + Menu Nodes
 *
 * Run with:
 *   pnpm tsx --env-file=.env scripts/seed-admin-menu.ts
 */

import { PrismaClient } from "../prisma/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------------ //
// Menu definition — mirrors adminSidebarData
// type: "GROUP" = section header with children
// type: "ITEM"  = leaf link
// permissionKeys: [] = always visible (admin-only app, auth guards the page)
// ------------------------------------------------------------------ //
const ADMIN_MENU: {
  label: string;
  slug: string;
  children: { label: string; slug: string; href: string; icon: string }[];
}[] = [
  {
    label: "OVERVIEW",
    slug: "overview",
    children: [
      { label: "Dashboard", slug: "dashboard", href: "/admin", icon: "layout-dashboard" },
    ],
  },
  {
    label: "IDENTITY",
    slug: "identity",
    children: [
      { label: "Users", slug: "users", href: "/admin/users", icon: "users" },
      { label: "Organizations", slug: "organizations", href: "/admin/organizations", icon: "building-2" },
    ],
  },
  {
    label: "AUTHORIZATION",
    slug: "authorization",
    children: [
      { label: "Resources", slug: "resources", href: "/admin/resources", icon: "database" },
      { label: "Actions", slug: "resource-actions", href: "/admin/resource-actions", icon: "zap" },
    ],
  },
  {
    label: "APPLICATION BUILDER",
    slug: "application-builder",
    children: [
      { label: "Apps", slug: "apps", href: "/admin/apps", icon: "grid" },
    ],
  },
  {
    label: "APPLICATION",
    slug: "application",
    children: [
      { label: "OAuth Clients", slug: "oauth-clients", href: "/admin/oauth-clients", icon: "globe" },
      { label: "Agent Auth", slug: "agent-auth", href: "/admin/agent-auth", icon: "bot" },
      { label: "Consents", slug: "consents", href: "/admin/consents", icon: "file-check" },
      { label: "API Keys", slug: "api-keys", href: "/admin/api-keys", icon: "key" },
    ],
  },
  {
    label: "SECURITY",
    slug: "security",
    children: [
      { label: "Sessions", slug: "sessions", href: "/admin/sessions", icon: "activity" },
      { label: "Audit Logs", slug: "audit-logs", href: "/admin/audit-logs", icon: "scroll-text" },
      { label: "Security Policies", slug: "security-policies", href: "/admin/security-policies", icon: "shield-check" },
    ],
  },
];

async function main() {
  console.log("Seeding admin app and menu nodes...");

  // Upsert the Admin app
  const app = await prisma.app.upsert({
    where: { slug: "admin" },
    create: {
      name: "Admin",
      slug: "admin",
      description: "Admin portal navigation",
      isActive: true,
    },
    update: {
      name: "Admin",
      description: "Admin portal navigation",
      isActive: true,
    },
  });

  console.log(`App: "${app.name}" (${app.id})`);

  // Process each group + its children in order
  for (let gi = 0; gi < ADMIN_MENU.length; gi++) {
    const group = ADMIN_MENU[gi];

    // Upsert the GROUP node
    const groupNode = await prisma.appMenuNode.upsert({
      where: { appId_slug: { appId: app.id, slug: group.slug } },
      create: {
        appId: app.id,
        label: group.label,
        slug: group.slug,
        type: "GROUP",
        order: gi,
        permissionKeys: [],
      },
      update: {
        label: group.label,
        order: gi,
      },
    });

    console.log(`  GROUP: "${group.label}" (${groupNode.id})`);

    // Upsert each ITEM under the group
    for (let ii = 0; ii < group.children.length; ii++) {
      const item = group.children[ii];

      const itemNode = await prisma.appMenuNode.upsert({
        where: { appId_slug: { appId: app.id, slug: item.slug } },
        create: {
          appId: app.id,
          parentId: groupNode.id,
          label: item.label,
          slug: item.slug,
          href: item.href,
          icon: item.icon,
          type: "ITEM",
          order: ii,
          permissionKeys: [],
        },
        update: {
          parentId: groupNode.id,
          label: item.label,
          href: item.href,
          icon: item.icon,
          order: ii,
        },
      });

      console.log(`    ITEM: "${item.label}" → ${item.href} (${itemNode.id})`);
    }
  }

  console.log("\nDone.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
