import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/lib/data/public";
import { absoluteUrl, siteConfig } from "@/lib/site";
import { formatPrice, truncate } from "@/lib/format";
import { ProductImage } from "@/components/product/product-image";
import { PlatformBadge } from "@/components/product/platform-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";

export const revalidate = 60;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};

  const description = truncate(product.description, 160);
  const url = absoluteUrl(`/produto/${product.slug}`);

  return {
    title: product.title,
    description: description || undefined,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      url,
      title: product.title,
      description: description || undefined,
      images: product.image
        ? [{ url: product.image, alt: product.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description: description || undefined,
      images: product.image ? [product.image] : undefined,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const price = formatPrice(product.price);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    image: product.image ?? undefined,
    description: product.description ?? undefined,
    category: product.category?.name,
    brand: {
      "@type": "Brand",
      name: siteConfig.name,
    },
    offers: {
      "@type": "Offer",
      price: product.price?.toString() ?? undefined,
      priceCurrency: "BRL",
      url: absoluteUrl(`/go/${product.slug}`),
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-muted-foreground">
        <ol className="flex flex-wrap items-center gap-1.5">
          <li>
            <Link href="/" className="hover:text-foreground">
              Início
            </Link>
          </li>
          <ChevronRight className="size-4" aria-hidden />
          {product.category ? (
            <>
              <li>
                <Link
                  href={`/categoria/${product.category.slug}`}
                  className="hover:text-foreground"
                >
                  {product.category.name}
                </Link>
              </li>
              <ChevronRight className="size-4" aria-hidden />
            </>
          ) : null}
          <li aria-current="page" className="line-clamp-1">
            {product.title}
          </li>
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="aspect-square w-full rounded-xl border"
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.category ? (
              <Badge variant="secondary">{product.category.name}</Badge>
            ) : null}
            <PlatformBadge platform={product.platform} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {product.title}
          </h1>

          {price ? (
            <p className="text-3xl font-bold text-emerald-600">{price}</p>
          ) : null}

          <p className="whitespace-pre-line text-muted-foreground">
            {product.description || "Descrição em breve."}
          </p>

          <div className="mt-2">
            <Link
              href={`/go/${product.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ size: "lg", className: "w-full sm:w-auto" })}
            >
              Ver oferta
              <ExternalLink />
            </Link>
            <p className="mt-3 text-xs text-muted-foreground">
              Ao clicar, você será redirecionado para a oferta na plataforma
              parceira. Podemos receber comissão sem custo para você.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
