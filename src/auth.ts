import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        if (
          credentials?.email === process.env.ADMIN_EMAIL &&
          credentials?.password === process.env.ADMIN_PASSWORD
        ) {
          return {
            id: "pryma-admin",
            email: credentials.email as string,
            name: "Pryma Admin",
          };
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    authorized({ auth: session, request: { nextUrl } }) {
      const isAdminPath =
        nextUrl.pathname.startsWith("/admin") &&
        nextUrl.pathname !== "/admin/login";
      const isAdminApi = nextUrl.pathname.startsWith("/api/admin");
      if ((isAdminPath || isAdminApi) && !session) return false;
      return true;
    },
  },
});
