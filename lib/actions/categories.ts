"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import { slugify } from "@/lib/slug";
import { categorySchema, parseCategoryForm } from "@/lib/validations/category";
import type { ActionResult } from "@/lib/actions/products";

async function uniqueCategorySlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function createCategory(formData: FormData): Promise<ActionResult> {
  await requireAdmin();

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await uniqueCategorySlug(data.slug || slugify(data.name));

  await prisma.category.create({
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      status: data.status,
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/categorias");
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  await requireAdmin();

  const existing = await prisma.category.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Categoria não encontrada." };
  }

  const parsed = categorySchema.safeParse(parseCategoryForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await uniqueCategorySlug(data.slug || slugify(data.name), id);

  await prisma.category.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      description: data.description || null,
      image: data.image || null,
      status: data.status,
    },
  });

  revalidatePath("/", "layout");
  redirect("/admin/categorias");
}

export async function toggleCategoryStatus(id: string) {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) return;

  await prisma.category.update({
    where: { id },
    data: { status: category.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  await prisma.category.delete({ where: { id } });

  revalidatePath("/", "layout");
}
