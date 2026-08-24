import { DefaultSession } from "next-auth";
import type { Role } from "@/app/generated/prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: Role;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    username: string;
    role: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    username?: string;
    role?: Role;
  }
}
