import { prisma } from "@/lib/db";
import { projectSchema } from "@/lib/admin/schemas";
import { collectionRoutes } from "@/lib/admin/crud";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";

const routes = collectionRoutes({
  model: () => prisma.project as never,
  schema: projectSchema,
  orderBy: [{ position: "asc" }, { createdAt: "desc" }],
  derive: (data) => ({ slug: data.slug || slugify(data.title) }),
});

export const GET = routes.GET;
export const POST = routes.POST;
