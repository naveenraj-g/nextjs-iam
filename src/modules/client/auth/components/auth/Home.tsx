"use client";

import type { TServerSession } from "@/modules/server/auth-provider/auth-server";
import { PublicNavbar } from "@/modules/client/shared/navbar/PublicNavbar";
import { ShieldCheck, LayoutDashboard, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

function Home({ session }: { session: TServerSession }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbar session={session} />

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center">
        <div className="w-full max-w-md space-y-8">
          {/* Wordmark */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground">
              <ShieldCheck className="h-7 w-7 text-background" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Doctor Godly
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Identity infrastructure for modern healthcare
              </p>
            </div>
          </div>

          {/* CTA */}
          {session ? (
            <div className="space-y-3">
              <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
                <p className="text-muted-foreground">Signed in as</p>
                <p className="font-medium text-foreground">
                  {session.user.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  Go to Dashboard
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button asChild className="w-full" size="lg">
                <Link href="/auth/sign-in">
                  Sign In
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full" size="lg">
                <Link href="/auth/sign-up">Create Account</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Home;
