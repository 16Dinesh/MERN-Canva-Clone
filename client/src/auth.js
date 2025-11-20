import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  // ⭐ REQUIRED FOR RENDER (Fixes UntrustedHost error)
  trustedHosts: [
    "localhost",
    "localhost:3000",
    "localhost:10000",
    "mern-canva-clone-2025.onrender.com" // your Render domain
  ],

  // NextAuth secret
  secret: process.env.NEXTAUTH_SECRET,

  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },

    async session({ session, token }) {
      session.idToken = token.idToken;
      return session;
    },
  },
});
