import { z } from "zod";
import { RESERVED_USERNAMES, USERNAME_REGEX } from "@/lib/constants";

const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "O nome de usuário deve ter pelo menos 2 caracteres")
  .max(30, "O nome de usuário deve ter no máximo 30 caracteres")
  .regex(
    USERNAME_REGEX,
    "Use apenas letras minúsculas, números e hífens (não pode começar nem terminar com hífen)."
  )
  .refine(
    (value) => !RESERVED_USERNAMES.includes(value),
    "Este nome de usuário é reservado pelo sistema."
  );

export const ROLE_VALUES = ["ADMIN", "USER"] as const;

export const createUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().toLowerCase().email("E-mail inválido"),
  username: usernameSchema,
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "USER"]),
});

export const updateUserSchema = createUserSchema.extend({
  password: z
    .string()
    .max(100)
    .refine(
      (value) => value === "" || value.length >= 6,
      "A senha deve ter pelo menos 6 caracteres"
    ),
});

export type UserInput = z.infer<typeof createUserSchema>;

export function parseUserForm(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
    username: formData.get("username")?.toString() ?? "",
    password: formData.get("password")?.toString() ?? "",
    role: formData.get("role")?.toString() === "ADMIN" ? "ADMIN" : "USER",
  };
}
