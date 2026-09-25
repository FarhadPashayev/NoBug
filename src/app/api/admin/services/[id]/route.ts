import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const routes = collectionRoutes({
  model: () => prisma.service as never,
  schema: serviceSchema,
  derive: (data) => ({ slug: data.slug || slugify(data.name) }),
});

export const PATCH = routes.PATCH;
export const DELETE = routes.DELETE;
