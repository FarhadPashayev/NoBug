import { NextResponse } from "next/server";
import { signOut } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST() {
  // database strategy: Auth.js deletes the Session row and clears the cookie
  await signOut({ redirect: false });
  return NextResponse.json({ ok: true });
}
