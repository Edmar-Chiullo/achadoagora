import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";

export async function requireUser(): Promise<Session> {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireUser();
  if (session.user.role !== "ADMIN") {
    redirect(`/admin/${session.user.username}/dashboard`);
  }
  return session;
}

export function isAdminSession(session: Session): boolean {
  return session.user.role === "ADMIN";
}

export function scopedUserId(session: Session): string | null {
  return isAdminSession(session) ? null : session.user.id;
}

export function adminBasePath(session: Session): string {
  return `/admin/${session.user.username}`;
}
