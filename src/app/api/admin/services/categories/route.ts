import { prisma } from "@/lib/db";
import { serviceCategorySchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const routes = collectionRoutes({
  model: () => prisma.serviceCategory as never,
  schema: serviceCategorySchema,
  derive: (data) => ({ slug: data.slug || slugify(data.name) }),
});

export const GET = routes.GET;
export const POST = routes.POST;
