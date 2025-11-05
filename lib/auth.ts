// /src/lib/auth.ts
import "server-only";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

// [EDIT] Centralize the role/status literal types so we reuse everywhere below
type AppRole =
  | "DEVELOPER"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "USER"       // [EDIT] added
  | "VENDOR";    // [EDIT] added

type AppStatus = "ACTIVE" | "INACTIVE" | "SUSPENDED";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(creds) {
        const email = (creds?.email ?? "").toLowerCase().trim();
        const password = creds?.password ?? "";

        const user = await prisma.user.findUnique({
          where: { email },
          // [EDIT] we only need a few fields here
          select: {
            id: true,
            name: true,
            email: true,
            password: true,
            role: true,
            status: true,
          },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return null;

        // [EDIT] widen the role union to include USER and VENDOR
        const u: User = {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role as AppRole,     // [EDIT]
          status: user.status as AppStatus,
        } as User;

        return u;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        // [EDIT] include all roles
        token.id = user.id;
        token.role = user.role as AppRole;          // [EDIT]
        token.status = user.status as AppStatus;
      } else if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          select: { id: true, role: true, status: true, name: true },
        });
        if (dbUser) {
          token.id = dbUser.id;
          token.role = dbUser.role as AppRole;      // [EDIT]
          token.status = dbUser.status as AppStatus;
        }
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // [EDIT] include all roles on the session
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;        // [EDIT]
        session.user.status = token.status as AppStatus;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}
