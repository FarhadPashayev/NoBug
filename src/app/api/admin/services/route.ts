import { prisma } from "@/lib/db";
import { serviceSchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const routes = collectionRoutes({
  model: () => prisma.service as never,
  schema: serviceSchema,
  include: { category: true },
  derive: (data) => ({ slug: data.slug || slugify(data.name) }),
});

export const GET = routes.GET;
export const POST = routes.POST;
