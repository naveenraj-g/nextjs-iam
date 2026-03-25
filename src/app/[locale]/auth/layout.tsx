import { AuthLayout } from "@/modules/client/auth/components/layout/AuthLayout";

function AuthPageLayout({ children }: LayoutProps<"/auth">) {
  return <AuthLayout>{children}</AuthLayout>;
}

export default AuthPageLayout;
