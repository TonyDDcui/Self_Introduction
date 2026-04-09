import "next-auth";
import "next-auth/jwt";
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      /** GitHub username (profile.login) */
      login?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** GitHub username (profile.login) */
    githubLogin?: string;
  }
}

