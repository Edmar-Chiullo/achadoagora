"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Package,
  Store,
  Tags,
  UserCircle,
  Users,
} from "lucide-react";
import { signOutAction } from "@/lib/actions/auth";
import { Logo } from "@/components/public/logo";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  username: string;
  isAdmin: boolean;
  userName: string;
  userEmail: string;
}

function AdminSidebar({ username, isAdmin, userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const base = `/admin/${username}`;

  const links = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    ...(isAdmin
      ? [{ href: `${base}/visitas`, label: "Visitas", icon: BarChart3 }]
      : []),
    { href: `${base}/produtos`, label: "Produtos", icon: Package },
    { href: `${base}/plataformas`, label: "Plataformas", icon: Store },
    { href: `${base}/categorias`, label: "Categorias", icon: Tags },
    ...(isAdmin
      ? [{ href: `${base}/usuarios`, label: "Usuários", icon: Users }]
      : []),
    { href: `${base}/manual`, label: "Manual", icon: BookOpen },
    { href: `${base}/perfil`, label: "Meu perfil", icon: UserCircle },
  ];

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <Logo />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Menu administrativo">
        {links.map((link) => {
          const active =
            link.href === `${base}/dashboard`
              ? pathname === link.href
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <link.icon className="size-4" aria-hidden />
              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t px-3 py-4">
        <div className="mb-2 px-3">
          <p className="truncate text-sm font-medium">{userName}</p>
          <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
          {isAdmin ? (
            <p className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Administrador
            </p>
          ) : null}
        </div>
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="size-4" aria-hidden />
          Ver site
        </Link>
        <form action={signOutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" aria-hidden />
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}

export { AdminSidebar };
