import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  currentPassword: z.string().min(1, "Informe a senha atual para confirmar"),
  newPassword: z
    .string()
    .max(100)
    .refine(
      (value) => value === "" || value.length >= 6,
      "A nova senha deve ter pelo menos 6 caracteres"
    ),
});

export function parseProfileForm(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    currentPassword: formData.get("currentPassword")?.toString() ?? "",
    newPassword: formData.get("newPassword")?.toString() ?? "",
  };
}
