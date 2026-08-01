import Link from "next/link";
import type { Category } from "@/app/generated/prisma/client";
import { Badge } from "@/components/ui/badge";

interface CategoryPillProps {
  category: Category;
}

function CategoryPill({ category }: CategoryPillProps) {
  return (
    <Link href={`/categoria/${category.slug}`} className="inline-block">
      <Badge
        variant="outline"
        className="rounded-full px-3.5 py-1.5 text-sm hover:border-primary hover:text-primary"
      >
        {category.name}
      </Badge>
    </Link>
  );
}

export { CategoryPill };
