/**
 * Seed script: Telemedicine Patient App + Menu, Resource, Actions, Org Role Permissions
 *
 * Single command — does everything in order:
 *   pnpm seed:patient-menu
 *
 * Idempotent — safe to re-run.
 *
 * Permission key format: <item-slug>:read
 *   e.g. dashboard:read, profile:read, book-appointment:read, appointment-intake:read
 *
 * To add/remove permissions later, update PATIENT_MENU and re-run.
 */

import { PrismaClient } from "../prisma/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { randomUUID } from "crypto";

// ------------------------------------------------------------------ //
// Database
// ------------------------------------------------------------------ //

const pool = new Pool({ connectionString: process.env.DATABASE_URL ?? "" });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ------------------------------------------------------------------ //
// Menu definition — mirrors patient sidebar data
// ------------------------------------------------------------------ //

const PATIENT_MENU: {
  label: string;
  slug: string;
  children: { label: string; slug: string; href: string; icon: string }[];
}[] = [
  {
    label: "PATIENT",
    slug: "patient",
    children: [
      {
        label: "Dashboard",
        slug: "dashboard",
        href: "/bezs/telemedicine/patient",
        icon: "layout-dashboard",
      },
      {
        label: "Profile",
        slug: "profile",
        href: "/bezs/telemedicine/patient/profile",
        icon: "user-cog",
      },
      {
        label: "Book Appointment",
        slug: "book-appointment",
        href: "/bezs/telemedicine/patient/appointments/book",
        icon: "calendar-plus",
      },
      {
        label: "Appointment Intake",
        slug: "appointment-intake",
        href: "/bezs/telemedicine/patient/appointments/intake",
        icon: "calendar-plus",
      },
    ],
  },
];

// ------------------------------------------------------------------ //
// Constants
// ------------------------------------------------------------------ //

const APP_SLUG = "telemedicine";
const APP_NAME = "Telemedicine";

const ORG_SLUG = "drgodly";
const PATIENT_ROLE = "patient";

// ------------------------------------------------------------------ //
// Helpers
// ------------------------------------------------------------------ //

/** Derives the permission key for a menu item: <slug>:read */
function permKey(itemSlug: string): string {
  return `${itemSlug}:read`;
}

// ------------------------------------------------------------------ //
// Main
// ------------------------------------------------------------------ //

async function main() {
  // ── Phase 1: App + Menu nodes ─────────────────────────────────────
  console.log(
    "\n━━━ Phase 1: Telemedicine App & Patient Menu ━━━━━━━━━━━━━━━━━",
  );

  const app = await prisma.app.upsert({
    where: { slug: APP_SLUG },
    create: {
      name: APP_NAME,
      slug: APP_SLUG,
      description: "Telemedicine portal navigation",
      isActive: true,
    },
    update: {
      name: APP_NAME,
      description: "Telemedicine portal navigation",
      isActive: true,
    },
  });
  console.log(`\n  App: "${app.name}" (${app.id})`);

  for (let gi = 0; gi < PATIENT_MENU.length; gi++) {
    const group = PATIENT_MENU[gi]!;

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
      update: { label: group.label, order: gi },
    });
    console.log(`\n  GROUP: "${group.label}"`);

    for (let ii = 0; ii < group.children.length; ii++) {
      const item = group.children[ii]!;
      await prisma.appMenuNode.upsert({
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
      console.log(`    ITEM: "${item.label}" → ${item.href}`);
    }
  }

  // ── Phase 2: drgodly org + patient role ───────────────────────────
  console.log(
    "\n━━━ Phase 2: drgodly Org & Patient Role ━━━━━━━━━━━━━━━━━━━━━━",
  );

  const org = await prisma.organization.findUnique({
    where: { slug: ORG_SLUG },
  });
  if (!org) {
    console.error(
      `\n  ERROR: Organization "${ORG_SLUG}" not found. Run seed:admin first.\n`,
    );
    process.exit(1);
  }
  console.log(`\n  Found org: "${org.name}" (${org.id})`);

  // ── Phase 3: Resource + ResourceActions ───────────────────────────
  console.log(
    "\n━━━ Phase 3: Resource & Actions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );

  const resource = await prisma.resource.upsert({
    where: { name: "telemedicine-patient" },
    create: {
      name: "telemedicine-patient",
      description: "Telemedicine patient portal features",
    },
    update: { description: "Telemedicine patient portal features" },
  });
  console.log(`\n  Resource: "${resource.name}" (${resource.id})`);

  const allItems = PATIENT_MENU.flatMap((g) => g.children);

  for (const item of allItems) {
    const key = permKey(item.slug);
    const ra = await prisma.resourceAction.upsert({
      where: { key },
      create: {
        resourceId: resource.id,
        name: item.label,
        key,
        description: `Read access to the ${item.label} patient page`,
      },
      update: {
        name: item.label,
        description: `Read access to the ${item.label} patient page`,
      },
    });
    console.log(`  Action: ${ra.key}`);
  }

  // ── Phase 4: AppResource link ─────────────────────────────────────
  console.log(
    "\n━━━ Phase 4: AppResource Link ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );

  await prisma.appResource.upsert({
    where: { appId_resourceId: { appId: app.id, resourceId: resource.id } },
    create: { appId: app.id, resourceId: resource.id },
    update: {},
  });
  console.log(`\n  "${resource.name}" linked to app "${app.name}"`);

  // ── Phase 5: Set permissionKeys on each ITEM menu node ────────────
  console.log(
    "\n━━━ Phase 5: Menu Node permissionKeys ━━━━━━━━━━━━━━━━━━━━━━━",
  );

  for (const item of allItems) {
    const key = permKey(item.slug);
    const { count } = await prisma.appMenuNode.updateMany({
      where: { appId: app.id, slug: item.slug },
      data: { permissionKeys: [key] },
    });
    if (count > 0) {
      console.log(`\n  "${item.slug}" → [${key}]`);
    } else {
      console.warn(`\n  WARN: No node for slug "${item.slug}"`);
    }
  }

  // ── Phase 6: OrganizationRole — patient ───────────────────────────
  //
  // getUserPermissions() parses `permission` as JSON:
  //   { "dashboard": ["read"], "profile": ["read"], ... }
  // → produces keys like "dashboard:read", "profile:read", ...
  //
  // To add an action later: push the new action string into the item's array.
  // To remove an item:      delete its key from the object.
  //
  console.log(
    "\n━━━ Phase 6: Org Role Permissions ━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  );

  // Build permission map: { [itemSlug]: ["read"] }
  const permissionMap: Record<string, string[]> = {};
  for (const item of allItems) {
    permissionMap[item.slug] = ["read"];
  }
  const permissionJson = JSON.stringify(permissionMap);

  const existingOrgRole = await prisma.organizationRole.findFirst({
    where: { organizationId: org.id, role: PATIENT_ROLE },
  });

  if (existingOrgRole) {
    await prisma.organizationRole.update({
      where: { id: existingOrgRole.id },
      data: { permission: permissionJson },
    });
    console.log(`\n  Role "${PATIENT_ROLE}" updated (existing).`);
  } else {
    await prisma.organizationRole.create({
      data: {
        id: randomUUID(),
        organizationId: org.id,
        role: PATIENT_ROLE,
        permission: permissionJson,
      },
    });
    console.log(`\n  Role "${PATIENT_ROLE}" created.`);
  }

  const grantedKeys = allItems.map((i) => permKey(i.slug));
  console.log(`\n  Granted ${grantedKeys.length} permissions:`);
  console.log(`  ${grantedKeys.join(", ")}`);

  // ── Summary ───────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("✓ Seed complete.\n");
  console.log("  App:      ", APP_NAME, `(slug: ${APP_SLUG})`);
  console.log("  Org:      ", org.name, `(slug: ${ORG_SLUG})`);
  console.log("  Role:     ", PATIENT_ROLE);
  console.log("  Permissions:", grantedKeys.join(", "));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
