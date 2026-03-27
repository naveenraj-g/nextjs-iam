"use client";

import { useEffect, useState } from "react";
import { usePathname } from "@/i18n/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup } from "./nav-group";
import { NavUser } from "../NavUser";
import { AppTitle } from "./AppTitle";
import { type NavGroup as NavGroupProps } from "./types";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

// ------------------------------------------------------------------ //
// API types (from /api/me/context)
// ------------------------------------------------------------------ //
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

interface ContextApp {
  id: string;
  name: string;
  slug: string;
  menus: NavNode[];
}

// ------------------------------------------------------------------ //
// Convert API response → NavGroup[] that NavGroup component expects
// ------------------------------------------------------------------ //
function buildNavGroups(apps: ContextApp[]): NavGroupProps[] {
  return apps.flatMap((app) =>
    app.menus
      .filter((node) => node.type === "GROUP")
      .map((group) => ({
        title: group.label,
        items: group.children
          .filter((child) => child.type === "ITEM")
          .map((child) => {
            if (child.children.length > 0) {
              return {
                title: child.label,
                icon: child.icon ?? undefined,
                items: child.children.map((sub) => ({
                  title: sub.label,
                  url: sub.href ?? "#",
                  icon: sub.icon ?? undefined,
                })),
              };
            }
            return {
              title: child.label,
              url: child.href ?? "#",
              icon: child.icon ?? undefined,
            };
          }),
      })),
  );
}

const SKELETON_GROUPS = [3, 2, 2, 1, 4, 3];

function NavSkeleton() {
  return (
    <>
      {SKELETON_GROUPS.map((count, gi) => (
        <SidebarGroup key={gi}>
          <SidebarGroupLabel>
            <Skeleton className="h-3 w-24" />
          </SidebarGroupLabel>
          <SidebarMenu>
            {Array.from({ length: count }).map((_, ii) => (
              <SidebarMenuItem key={ii}>
                <SidebarMenuButton>
                  <Skeleton className="h-4 w-4 rounded" />
                  <Skeleton className="h-4 w-28" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}

export function MenuBar() {
  const [allApps, setAllApps] = useState<ContextApp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();

  // Derive the current app slug from the first path segment.
  // e.g. "/admin/users" → "admin"
  const currentAppSlug = pathname.split("/").filter(Boolean)[0] ?? "";

  const currentApp = allApps.find((a) => a.slug === currentAppSlug);
  const navGroups = currentApp ? buildNavGroups([currentApp]) : [];

  useEffect(() => {
    fetch("/api/me/context")
      .then((res) => res.json() as Promise<{ apps: ContextApp[] }>)
      .then(({ apps }) => setAllApps(apps))
      .catch(() => {
        // silently keep empty — auth guards handle access
      })
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <Sidebar collapsible="icon" side="left">
      <SidebarHeader>
        <AppTitle />
      </SidebarHeader>
      <SidebarContent>
        {!isLoading ? (
          <NavSkeleton />
        ) : (
          navGroups.map((props) => <NavGroup key={props.title} {...props} />)
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser isSidebar />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
