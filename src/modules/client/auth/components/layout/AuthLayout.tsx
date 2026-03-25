import { ShieldCheck } from "lucide-react";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Left branding panel (desktop only) ── */}
      <div className="relative hidden lg:flex lg:w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-muted border-r border-border p-12">
        {/* Subtle dot-grid overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: [
              "linear-gradient(var(--foreground) 1px, transparent 1px)",
              "linear-gradient(90deg, var(--foreground) 1px, transparent 1px)",
            ].join(", "),
            backgroundSize: "36px 36px",
          }}
        />

        {/* Top — wordmark */}
        <div className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
            <ShieldCheck className="h-4 w-4 text-background" />
          </div>
          <span className="text-base font-semibold tracking-tight text-foreground">
            Doctor Godly
          </span>
        </div>

        {/* Middle — tagline */}
        <div className="relative z-10 space-y-4">
          <h2 className="text-[2rem] font-bold leading-tight tracking-tight text-foreground">
            Identity infrastructure for modern healthcare
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Secure authentication for apps, services, and devices.
          </p>
        </div>

        {/* Bottom — copyright */}
        <p className="relative z-10 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Doctor Godly. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto p-6 sm:p-10">
        {children}
      </div>
    </div>
  );
}
