"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth-utils";
import {
  updateProfileSchema,
  parseProfileForm,
} from "@/lib/validations/profile";

export type ProfileActionResult = {
  error?: string;
  fieldErrors?: Record<string, string[] | undefined>;
  successMessage?: string;
};

export async function updateProfile(
  formData: FormData
): Promise<ProfileActionResult> {
  const session = await requireUser();

  const parsed = updateProfileSchema.safeParse(parseProfileForm(formData));
  if (!parsed.success) {
    return {
      error: "Verifique os campos abaixo.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { password: true },
  });
  if (!user) {
    return { error: "Usuário não encontrado." };
  }

  const currentPasswordValid = await bcrypt.compare(
    data.currentPassword,
    user.password
  );
  if (!currentPasswordValid) {
    return {
      error: "Senha atual incorreta.",
      fieldErrors: { currentPassword: ["Senha atual incorreta."] },
    };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: data.name,
      ...(data.newPassword
        ? { password: await bcrypt.hash(data.newPassword, 12) }
        : {}),
    },
  });

  revalidatePath("/", "layout");
  return { successMessage: "Perfil atualizado com sucesso." };
}
