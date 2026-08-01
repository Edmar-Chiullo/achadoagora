import type { Metadata } from "next";
import { searchProducts } from "@/lib/data/public";
import { SearchBar } from "@/components/public/search-bar";
import { ProductCard } from "@/components/product/product-card";
import { ProductGrid } from "@/components/product/product-grid";

export const metadata: Metadata = {
  title: "Buscar",
  description: "Busque pelos melhores achados e ofertas recomendados.",
  robots: { index: false, follow: true },
};

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const { q } = await searchParams;
  const query = (Array.isArray(q) ? q[0] : q)?.trim() ?? "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-col items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Buscar achadinhos
        </h1>
        <SearchBar defaultValue={query} placeholder="Digite o que você procura…" />
      </div>

      {query ? (
        <p className="mb-6 text-sm text-muted-foreground">
          {products.length > 0
            ? `${products.length} resultado(s) para "${query}"`
            : `Nenhum resultado para "${query}".`}
        </p>
      ) : null}

      {products.length > 0 ? (
        <ProductGrid>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </ProductGrid>
      ) : (
        <p className="rounded-lg border border-dashed py-10 text-center text-muted-foreground">
          {query
            ? "Tente buscar por outro termo ou categoria."
            : "Digite algo no campo de busca para encontrar produtos."}
        </p>
      )}
    </div>
  );
}
