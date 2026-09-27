"use server";

import { signOut } from "@/lib/auth";

// Kept apart from actions/auth.ts so that file (profile / password, covered by
// the integration suite) does not pull Auth.js' Next-only runtime into Vitest.
/** Sign out in one round trip: Auth.js deletes the Session row, clears the cookie and redirects. */
export async function logout() {
  await signOut({ redirectTo: "/admin/login" });
}
