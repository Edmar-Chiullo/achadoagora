import Link from "next/link";
import type { Category } from "@/app/generated/prisma/client";
import { Logo } from "@/components/public/logo";
import { siteConfig } from "@/lib/site";
import {
  FacebookIcon,
  InstagramIcon,
  TikTokIcon,
  YoutubeIcon,
} from "@/components/public/social-icons";

const socials = [
  { label: "Instagram", href: "https://www.instagram.com/acha.doagora/", icon: InstagramIcon },
  { label: "Facebook", href: "#", icon: FacebookIcon },
  { label: "TikTok", href: "https://www.tiktok.com/@achadoagorapage", icon: TikTokIcon },
  { label: "YouTube", href: "#", icon: YoutubeIcon },
];

interface FooterProps {
  categories: Category[];
}

function Footer({ categories }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm text-muted-foreground">
            {siteConfig.tagline}. Curadoria com links de afiliados do Mercado
            Livre, Shopee e Hotmart.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Navegação</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link href="/" className="hover:text-foreground">
                Início
              </Link>
            </li>
            <li>
              <Link href="/#destaques" className="hover:text-foreground">
                Produtos em destaque
              </Link>
            </li>
            <li>
              <Link href="/#recentes" className="hover:text-foreground">
                Produtos recentes
              </Link>
            </li>
            <li>
              <Link href="/buscar" className="hover:text-foreground">
                Buscar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Categorias</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {categories.slice(0, 6).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categoria/${category.slug}`}
                  className="hover:text-foreground"
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold">Redes sociais</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-foreground"
                >
                  <social.icon className="size-4" />
                  {social.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs text-muted-foreground">
          <p>
            {siteConfig.name} participa de programas de afiliados e pode receber
            comissão por compras realizadas através dos links indicados. Isso não
            altera o preço para você.
          </p>
          <p>© {year} {siteConfig.name}. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
