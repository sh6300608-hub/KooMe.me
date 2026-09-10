import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { z } from "zod";

const credentialsSchema = z.object({ email: z.string().email(), password: z.string().min(8).max(128) });
const configuredOwnerEmail = process.env.OWNER_EMAIL?.toLowerCase();

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  trustHost: true,
  session: { strategy: "database" },
  providers: [
    Google({ clientId: process.env.AUTH_GOOGLE_ID ?? "", clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "" }),
    Credentials({
      name: "Email and password",
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        if (configuredOwnerEmail && email !== configuredOwnerEmail) return null;
        const user = await db.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.role !== "OWNER") return null;
        if (!(await bcrypt.compare(parsed.data.password, user.passwordHash))) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      if (configuredOwnerEmail && user.email.toLowerCase() !== configuredOwnerEmail) return false;
      const existing = await db.user.findUnique({ where: { email: user.email.toLowerCase() } });
      return !existing || existing.role === "OWNER";
    },
    async session({ session, user }) {
      if (session.user) session.user.id = user.id;
      return session;
    },
  },
  pages: { signIn: "/login" },
});
