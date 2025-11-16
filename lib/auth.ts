// /lib/auth.ts
import "server-only";
import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { prisma } from "./prisma";

type AppRole =
  | "DEVELOPER"
  | "SUPER_ADMIN"
  | "ADMIN"
  | "USER"
  | "VENDOR";

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

        // widen the role union to include USER and VENDOR
        const u: User = {
          id: user.id,
          name: user.name ?? null,
          email: user.email,
          role: user.role as AppRole,
          status: user.status as AppStatus,
        } as User;

        return u;
      },
    }),
  ],
  callbacks: {
    // --- UPDATED JWT CALLBACK ---
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // This block runs ONLY on sign-in, populating the token.
      if (user) {
        token.id = user.id;
        token.role = user.role as AppRole;
        token.status = user.status as AppStatus;
      }
      // The database lookup on every session check (in the `else if`)
      // has been removed to prevent unnecessary DB hits.
      return token;
    },
    // --- END UPDATE ---
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        // include all roles on the session
        session.user.id = token.id as string;
        session.user.role = token.role as AppRole;
        session.user.status = token.status as AppStatus;
      }
      return session;
    },
  },
};

export function auth() {
  return getServerSession(authOptions);
}