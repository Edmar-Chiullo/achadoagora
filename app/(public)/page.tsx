import Link from "next/link";
import {
  getActiveCategories,
  getFeaturedProducts,
  getRecentProducts,
} from "@/lib/data/public";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";
import { CategoryPill } from "@/components/category/category-pill";
import { SearchBar } from "@/components/public/search-bar";
import { buttonVariants } from "@/components/ui/button";
import { SectionHeading } from "@/components/public/section-heading";

export const revalidate = 60;

export default async function HomePage() {
  const [categories, featured, recent] = await Promise.all([
    getActiveCategories(),
    getFeaturedProducts(8),
    getRecentProducts(8),
  ]);

  return (
    <div>
      <section className="border-b bg-gradient-to-b from-orange-50 to-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-16 text-center">
          <h1 className="max-w-2xl text-3xl font-bold tracking-tight sm:text-5xl">
            Os melhores{" "}
            <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">
              achadinhos
            </span>{" "}
            em um só lugar
          </h1>
          <p className="max-w-xl text-muted-foreground sm:text-lg">
            Curadoria de produtos e ofertas recomendados com links diretos para
            as melhores plataformas parceiras.
          </p>
          <SearchBar />
        </div>
      </section>

      <section id="categorias" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-12">
        <SectionHeading
          title="Categorias"
          action={{ href: "/#categorias", label: "Explorar" }}
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <CategoryPill key={category.id} category={category} />
          ))}
        </div>
      </section>

      <section id="destaques" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-12">
        <SectionHeading
          title="Produtos em destaque"
          action={{ href: "/buscar", label: "Ver todos" }}
        />
        {featured.length > 0 ? (
          <ProductGrid>
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        ) : (
          <EmptyProducts />
        )}
      </section>

      <section id="recentes" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-16">
        <SectionHeading
          title="Produtos recentes"
          action={{ href: "/buscar", label: "Ver todos" }}
        />
        {recent.length > 0 ? (
          <ProductGrid>
            {recent.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </ProductGrid>
        ) : (
          <EmptyProducts />
        )}
      </section>

      <section className="border-t bg-muted/40">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-14 text-center">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Não perca os próximos achadinhos
          </h2>
          <p className="max-w-lg text-muted-foreground">
            Siga nossas redes sociais para ficar por dentro de novas indicações
            e ofertas imperdíveis.
          </p>
          <div className="flex gap-2">
            <Link
              href="#"
              className={buttonVariants()}
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </Link>
            <Link
              href="#"
              className={buttonVariants({ variant: "outline" })}
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </Link>
            <Link
              href="#"
              className={buttonVariants({ variant: "outline" })}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyProducts() {
  return (
    <p className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
      Nenhum produto por aqui ainda. Volte em breve!
    </p>
  );
}
