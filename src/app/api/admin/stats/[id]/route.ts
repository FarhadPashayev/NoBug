import { prisma } from "@/lib/db";
import { statSchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";

export const runtime = "nodejs";

const routes = collectionRoutes({ model: () => prisma.stat as never, schema: statSchema });
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
