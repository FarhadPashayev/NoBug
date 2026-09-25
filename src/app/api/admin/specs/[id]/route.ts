import { prisma } from "@/lib/db";
import { specSchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";

export const runtime = "nodejs";

const routes = collectionRoutes({ model: () => prisma.spec as never, schema: specSchema });
export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
