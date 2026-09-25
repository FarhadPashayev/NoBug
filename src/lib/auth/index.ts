import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { encode as defaultEncode } from "next-auth/jwt";
import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db";
import { loginSchema } from "@/schemas/auth";
import { verifyPassword } from "./password";

/**
 * Auth.js v5 — Credentials provider with *database* sessions.
 *
 * Auth.js only creates a database session for OAuth sign-ins; with
 * Credentials it falls back to a JWT. The `jwt` callback + `jwt.encode`
 * override below is the documented workaround: on a credentials login we
 * create the Session row ourselves and put its token in the cookie, so every
 * request is checked against the database and a session can be revoked by
 * deleting the row.
 */

export type Role = "ADMIN" | "EDITOR";

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}

export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

const adapter = PrismaAdapter(prisma);

export const hasAuthSecret = Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32);

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter,
  trustHost: true,
  // strategy is deliberately *not* spelled out: Auth.js refuses "database" +
  // Credentials at config time, but with an adapter present it defaults to
  // "database" at runtime — which, together with the encode override, is the
  // combination we want.
  session: { maxAge: SESSION_MAX_AGE },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
        if (!user) return null;
        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, user }) {
      if (account?.provider === "credentials" && user?.id) {
        const session = await adapter.createSession!({
          sessionToken: randomUUID(),
          userId: user.id,
          expires: new Date(Date.now() + SESSION_MAX_AGE * 1000),
        });
        token.sessionToken = session.sessionToken;
      }
      return token;
    },
    async session({ session, user }) {
      // `user` is the database row from the adapter — expose id and role
      session.user.id = user.id;
      session.user.role = ((user as { role?: Role }).role ?? "ADMIN") as Role;
      return session;
    },
  },
  jwt: {
    async encode(params) {
      const sessionToken = params.token?.sessionToken;
      if (typeof sessionToken === "string") return sessionToken;
      return defaultEncode(params);
    },
  },
});
