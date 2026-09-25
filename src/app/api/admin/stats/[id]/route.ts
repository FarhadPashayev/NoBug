import { NextResponse } from "next/server";

// Replaced by server actions in src/actions — safe to delete this file.
const gone = () => NextResponse.json({ error: "Bu endpoint server action-larla əvəz olunub" }, { status: 410 });
export const GET = gone;
export const POST = gone;
export const PUT = gone;
export const PATCH = gone;
export const DELETE = gone;
