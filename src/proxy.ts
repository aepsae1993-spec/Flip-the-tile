import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Refresh and validate auth only where a signed-in account is actually used.
  // Running getClaims() on public pages delays every client-side navigation.
  matcher: [
    "/dashboard/:path*",
    "/create/:path*",
    "/settings/:path*",
    "/sets/:path*",
    "/admin/:path*",
    "/pending/:path*",
    "/auth/update-password/:path*",
  ],
};
