import { NextResponse } from "next/server";
import type { z } from "zod";
import { assertDatabase } from "@/lib/db";
import { requireApiUser } from "@/lib/auth/guard";
import { handleError, parseBody } from "./api-helpers";

/**
 * The five content collections (projects, stats, services, categories, specs)
 * differ only in schema and delegate, so their route handlers are generated
 * from this factory instead of five near-identical files.
 */
type Delegate = {
  findMany: (args: unknown) => Promise<unknown[]>;
  create: (args: unknown) => Promise<unknown>;
  update: (args: unknown) => Promise<unknown>;
  delete: (args: unknown) => Promise<unknown>;
};

type Values = Record<string, unknown>;

export function collectionRoutes<S extends z.ZodType<Values, unknown>>({
  model,
  schema,
  orderBy = [{ position: "asc" as const }],
  include,
  derive,
}: {
  model: () => Delegate;
  schema: S;
  orderBy?: Record<string, "asc" | "desc">[];
  include?: Record<string, unknown>;
  /** last chance to compute fields (slug, position) before writing */
  derive?: (data: z.infer<S>, ctx: { isCreate: boolean }) => Promise<Values> | Values;
}) {
  return {
    async GET() {
      const user = await requireApiUser();
      if (user instanceof NextResponse) return user;
      try {
        assertDatabase();
        const items = await model().findMany({ orderBy, ...(include ? { include } : {}) });
        return NextResponse.json({ items });
      } catch (e) {
        return handleError(e);
      }
    },

    async POST(req: Request) {
      const user = await requireApiUser();
      if (user instanceof NextResponse) return user;
      try {
        assertDatabase();
        const data = await parseBody(req, schema);
        const extra = (await derive?.(data, { isCreate: true })) ?? {};
        const item = await model().create({ data: { ...data, ...extra } });
        return NextResponse.json({ item }, { status: 201 });
      } catch (e) {
        return handleError(e);
      }
    },

    async PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
      const user = await requireApiUser();
      if (user instanceof NextResponse) return user;
      try {
        assertDatabase();
        const { id } = await ctx.params;
        const data = await parseBody(req, schema);
        const extra = (await derive?.(data, { isCreate: false })) ?? {};
        const item = await model().update({ where: { id }, data: { ...data, ...extra } });
        return NextResponse.json({ item });
      } catch (e) {
        return handleError(e);
      }
    },

    async DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
      const user = await requireApiUser();
      if (user instanceof NextResponse) return user;
      try {
        assertDatabase();
        const { id } = await ctx.params;
        await model().delete({ where: { id } });
        return NextResponse.json({ ok: true });
      } catch (e) {
        return handleError(e);
      }
    },
  };
}
