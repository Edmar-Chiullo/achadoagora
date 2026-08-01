"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import type { Category } from "@/app/generated/prisma/client";
import { Logo } from "@/components/public/logo";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface HeaderProps {
  categories: Category[];
}

function Header({ categories }: HeaderProps) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  const navLinks = [
    { href: "/", label: "Início" },
    { href: "/#categorias", label: "Categorias" },
    { href: "/#destaques", label: "Destaques" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Abrir menu"
        >
          {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Logo />

        <nav className="ml-4 hidden items-center gap-1 md:flex" aria-label="Navegação">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <form action="/buscar" className="ml-auto hidden w-full max-w-xs md:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              name="q"
              type="search"
              placeholder="Buscar achados…"
              className="h-9 rounded-full pl-9"
              aria-label="Buscar produtos"
            />
          </div>
        </form>

        <Link
          href="/buscar"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-muted md:hidden"
          aria-label="Buscar"
        >
          <Search className="size-5" />
        </Link>
      </div>

      {menuOpen ? (
        <div className="border-t bg-background md:hidden">
          <nav className="mx-auto max-w-6xl px-4 py-4" aria-label="Menu mobile">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <p className="px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Categorias
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categoria/${category.slug}`}
                    onClick={() => setMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
            <Link
              href="/admin/login"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4 w-full")}
            >
              Área administrativa
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export { Header };
