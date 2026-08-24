"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-utils";
import {
  createUserSchema,
  updateUserSchema,
  parseUserForm,
} from "@/lib/validations/user";
import type { ActionResult } from "@/lib/actions/products";

async function isLastAdmin(userId: string): Promise<boolean> {
  const admins = await prisma.user.count({ where: { role: "ADMIN" } });
  if (admins > 1) return false;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });
  return user?.role === "ADMIN";
}

function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "P2002"
  );
}

export async function createUser(formData: FormData): Promise<ActionResult> {
  const session = await requireAdmin();

  const parsed = createUserSchema.safeParse(parseUserForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const passwordHash = await bcrypt.hash(data.password, 12);

  try {
    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        username: data.username,
        password: passwordHash,
        role: data.role,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um usuário com este e-mail ou nome de usuário." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/usuarios`);
}

export async function updateUser(
  id: string,
  formData: FormData
): Promise<ActionResult> {
  const session = await requireAdmin();

  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) {
    return { error: "Usuário não encontrado." };
  }

  const parsed = updateUserSchema.safeParse(parseUserForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  if (
    existing.role === "ADMIN" &&
    data.role !== "ADMIN" &&
    (await isLastAdmin(id))
  ) {
    return { error: "Não é possível remover o papel do último administrador." };
  }

  const updateData: {
    name: string;
    email: string;
    username: string;
    role: "ADMIN" | "USER";
    password?: string;
  } = {
    name: data.name,
    email: data.email,
    username: data.username,
    role: data.role,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 12);
  }

  try {
    await prisma.user.update({ where: { id }, data: updateData });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "Já existe um usuário com este e-mail ou nome de usuário." };
    }
    throw error;
  }

  revalidatePath("/", "layout");
  redirect(`/admin/${session.user.username}/usuarios`);
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const session = await requireAdmin();

  if (id === session.user.id) {
    return { error: "Você não pode excluir a sua própria conta." };
  }

  if (await isLastAdmin(id)) {
    return { error: "Não é possível excluir o último administrador." };
  }

  try {
    await prisma.user.delete({ where: { id } });
  } catch {
    return { error: "Não foi possível excluir o usuário." };
  }

  revalidatePath("/", "layout");
  return {};
}
