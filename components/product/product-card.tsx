import Link from "next/link";
import type { Category, Product } from "@/app/generated/prisma/client";
import { formatPrice, truncate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { PlatformBadge } from "@/components/product/platform-badge";
import { ProductImage } from "@/components/product/product-image";

interface ProductCardProps {
  product: Product & { category: Category | null };
}

function ProductCard({ product }: ProductCardProps) {
  const price = formatPrice(product.price);

  return (
    <Card className="group flex h-full flex-col overflow-hidden">
      <Link
        href={`/produto/${product.slug}`}
        className="block"
        aria-label={product.title}
      >
        <ProductImage
          src={product.image}
          alt={product.title}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="aspect-[4/3] w-full"
        />
      </Link>
      <CardContent className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {product.category ? (
            <Link href={`/categoria/${product.category.slug}`}>
              <Badge variant="secondary" className="hover:bg-muted-foreground/20">
                {product.category.name}
              </Badge>
            </Link>
          ) : null}
          <PlatformBadge platform={product.platform} />
        </div>
        <h3 className="line-clamp-2 font-medium leading-snug">
          <Link href={`/produto/${product.slug}`} className="hover:underline">
            {product.title}
          </Link>
        </h3>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {truncate(product.description, 140)}
        </p>
        {price ? (
          <p className="mt-auto pt-1 text-lg font-semibold text-emerald-600">
            {price}
          </p>
        ) : (
          <p className="mt-auto pt-1 text-sm font-medium text-muted-foreground">
            Consulte o preço
          </p>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Link
          href={`/produto/${product.slug}`}
          className={buttonVariants({ size: "sm", className: "w-full" })}
        >
          Ver produto
        </Link>
      </CardFooter>
    </Card>
  );
}

export { ProductCard };
