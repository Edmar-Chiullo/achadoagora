"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-utils";
import { slugify } from "@/lib/slug";
import { platformSchema, parsePlatformForm } from "@/lib/validations/platform";
import type { ActionResult } from "@/lib/actions/products";

async function uniquePlatformSlug(base: string, excludeId?: string) {
  let slug = base;
  let n = 2;
  for (;;) {
    const existing = await prisma.platform.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (!existing || (excludeId && existing.id === excludeId)) return slug;
    slug = `${base}-${n++}`;
  }
}

export async function createPlatform(formData: FormData): Promise<ActionResult> {
  const session = await requireUser();

  const parsed = platformSchema.safeParse(parsePlatformForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await uniquePlatformSlug(data.slug || slugify(data.name));

  await prisma.platform.create({
    data: {
      name: data.name,
      slug,
      shortLabel: data.shortLabel || null,
      badgeKey: data.badgeKey,
      status: data.status,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/plataformas`);
}

export async function updatePlatform(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireUser();

  const existing = await prisma.platform.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Plataforma não encontrada." };
  }

  const parsed = platformSchema.safeParse(parsePlatformForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const slug = await uniquePlatformSlug(data.slug || slugify(data.name), id);

  await prisma.platform.update({
    where: { id },
    data: {
      name: data.name,
      slug,
      shortLabel: data.shortLabel || null,
      badgeKey: data.badgeKey,
      status: data.status,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/plataformas`);
}

export async function togglePlatformStatus(id: string) {
  await requireUser();

  const platform = await prisma.platform.findUnique({ where: { id } });
  if (!platform) return;

  await prisma.platform.update({
    where: { id },
    data: { status: platform.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });

  revalidatePath("/", "layout");
}

export async function deletePlatform(id: string) {
  await requireUser();

  const platform = await prisma.platform.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!platform) return;

  if (platform.slug === "outro") {
    return { error: "A plataforma 'Outro' é o padrão do sistema e não pode ser excluída." };
  }

  if (platform._count.products > 0) {
    return {
      error: "Não é possível excluir uma plataforma que está em uso por produtos. Desative-a ou altere os produtos primeiro.",
    };
  }

  await prisma.platform.delete({ where: { id } });

  revalidatePath("/", "layout");
}
