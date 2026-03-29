import { redirect } from "@/i18n/navigation";
import { getServerSession } from "../../auth-provider/auth-server";
import { getLocale } from "next-intl/server";

export async function requireRole(roles: string[]) {
  const session = await getServerSession();
  const locale = await getLocale();

  if (!session?.user) {
    redirect({ href: "/sign-in", locale });
  }

  if (!session?.user.role || !roles.includes(session.user.role)) {
    redirect({ href: "/", locale });
  }

  return session;
}
