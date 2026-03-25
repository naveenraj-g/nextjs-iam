"use client";

import { signoutAction } from "@/modules/server/presentation/actions/auth";
import { useServerAction } from "zsa-react";
import { TSession } from "../../types/auth-types";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { ShieldCheck, LogOut, LayoutDashboard, Loader2 } from "lucide-react";

function Home({ session }: { session: TSession | null }) {
  const { execute: executeSignoutAction, isPending: isSignoutActionPending } =
    useServerAction(signoutAction);

  async function handleSignout() {
    await executeSignoutAction({});
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Wordmark */}
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-foreground">
            <ShieldCheck className="h-6 w-6 text-background" />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Doctor Godly
            </h1>
            <p className="text-sm text-muted-foreground">
              Identity & Access Management
            </p>
          </div>
        </div>

        {session ? (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm">
              <p className="text-muted-foreground">Signed in as</p>
              <p className="font-medium text-foreground">{session.user.name}</p>
              <p className="text-xs text-muted-foreground">
                {session.user.email}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin">
                  <LayoutDashboard className="h-4 w-4" />
                  Admin Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full text-muted-foreground hover:text-destructive"
                onClick={handleSignout}
                disabled={isSignoutActionPending}
              >
                {isSignoutActionPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4" />
                )}
                Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/auth/sign-up">Create Account</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
