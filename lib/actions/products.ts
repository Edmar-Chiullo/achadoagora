"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-utils";
import type { Session } from "next-auth";
import { slugify } from "@/lib/slug";
import { productSchema, parseProductForm } from "@/lib/validations/product";

export type ActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

async function uniqueProductSlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) return slug;
    slug = `${base}-${n++}`;
  }
}

async function validatePlatform(platformId: string, requireActive: boolean) {
  const platform = await prisma.platform.findUnique({ where: { id: platformId } });
  if (!platform) return null;
  if (requireActive && platform.status !== "ACTIVE") return null;
  return platform;
}

async function findOwnedProduct(
  session: Session,
  id: string
): Promise<{ userId: string; status: "ACTIVE" | "INACTIVE"; featured: boolean } | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { userId: true, status: true, featured: true },
  });
  if (!product) return null;
  if (session.user.role !== "ADMIN" && product.userId !== session.user.id) {
    return null;
  }
  return product;
}

export async function createProduct(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();

  const input = parseProductForm(formData);
  const parsed = productSchema.safeParse(input);

  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const platform = await validatePlatform(data.platformId, true);
  if (!platform) {
    return { error: "Plataforma inválida ou inativa." };
  }

  const baseSlug = data.slug || slugify(data.title);
  const slug = await uniqueProductSlug(baseSlug);

  await prisma.product.create({
    data: {
      title: data.title,
      slug,
      description: data.description || null,
      image: data.image || null,
      price: data.price,
      categoryId: data.categoryId,
      platformId: platform.id,
      userId: session.user.id,
      affiliateLink: data.affiliateLink,
      status: data.status,
      featured: data.featured,
      sourceType: data.sourceType,
      sourceUrl: data.sourceUrl || null,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/produtos`);
}

export async function updateProduct(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireUser();

  const existing = await findOwnedProduct(session, id);
  if (!existing) {
    return { error: "Produto não encontrado." };
  }

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const platform = await validatePlatform(data.platformId, false);
  if (!platform) {
    return { error: "Plataforma inválida." };
  }

  const baseSlug = data.slug || slugify(data.title);
  const slug = await uniqueProductSlug(baseSlug, id);

  await prisma.product.update({
    where: { id },
    data: {
      title: data.title,
      slug,
      description: data.description || null,
      image: data.image || null,
      price: data.price,
      categoryId: data.categoryId,
      platformId: platform.id,
      affiliateLink: data.affiliateLink,
      status: data.status,
      featured: data.featured,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/produtos`);
}

export async function toggleProductStatus(id: string) {
  const session = await requireUser();

  const product = await findOwnedProduct(session, id);
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { status: product.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/", "layout");
}

export async function toggleProductFeatured(id: string) {
  const session = await requireUser();

  const product = await findOwnedProduct(session, id);
  if (!product) return;

  await prisma.product.update({
    where: { id },
    data: { featured: !product.featured },
  });

  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  const session = await requireUser();

  const product = await findOwnedProduct(session, id);
  if (!product) return;

  await prisma.product.delete({ where: { id } });

  revalidatePath("/", "layout");
}
