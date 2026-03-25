import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const allowedOrigin = process.env.ALLOWED_ORIGIN!;

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  /**
   * =========================
   * ✅ 1. Handle API (CORS)
   * =========================
   */
  if (pathname.startsWith("/api")) {
    // Preflight
    if (req.method === "OPTIONS") {
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Access-Control-Allow-Origin": allowedOrigin,
          "Access-Control-Allow-Credentials": "true",
          "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      });
    }

    // Normal API request
    const res = NextResponse.next();

    res.headers.set("Access-Control-Allow-Origin", allowedOrigin);
    res.headers.set("Access-Control-Allow-Credentials", "true");
    res.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PUT,PATCH,DELETE,OPTIONS",
    );
    res.headers.set(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    return res;
  }

  /**
   * =========================
   * ✅ 2. next-intl middleware
   * =========================
   */
  const intlResponse = intlMiddleware(req);

  // Important: respect rewrites/redirects from next-intl
  if (!intlResponse.ok) {
    return intlResponse;
  }

  /**
   * Extract locale + pathname AFTER intl rewrite
   */
  const rewrittenPath =
    intlResponse.headers.get("x-middleware-rewrite") || req.url;

  const [, locale, ...rest] = new URL(rewrittenPath).pathname.split("/");
  const cleanPathname = "/" + rest.join("/");

  /**
   * Optional: expose headers (like your old middleware)
   */
  const res = NextResponse.next();
  res.headers.set("x-pathname", cleanPathname);
  res.headers.set("x-next-intl-locale", locale);

  return res;
}

/**
 * =========================
 * ✅ Matcher
 * =========================
 */
export const config = {
  matcher: [
    /*
     * Apply to everything EXCEPT:
     * - static files
     * - next internals
     */
    "/((?!_next|_vercel|.*\\..*).*)",
  ],
};
