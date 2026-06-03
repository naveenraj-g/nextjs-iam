import { redirect } from "@/i18n/navigation";
import { getServerSession } from "../../auth-provider/auth-server";
import { getLocale } from "next-intl/server";

export async function requireRole(roles: string[]) {
  const [session, locale] = await Promise.all([getServerSession(), getLocale()]);

  if (!session?.user) {
    redirect({ href: "/auth/sign-in", locale });
    return session; // unreachable — satisfies TS narrowing
  }

  const userRole = (session.user as { role?: string | null }).role;

  if (!userRole || !roles.includes(userRole)) {
    redirect({ href: "/", locale });
    return session; // unreachable — satisfies TS narrowing
  }

  return session;
}
