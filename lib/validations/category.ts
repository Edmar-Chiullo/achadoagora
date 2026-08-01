import { z } from "zod";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "O nome deve ter pelo menos 2 caracteres")
    .max(100, "O nome deve ter no máximo 100 caracteres"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug muito curto")
    .max(100, "Slug muito longo")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido. Use apenas letras minúsculas, números e hífens."
    ),
  description: z
    .string()
    .trim()
    .max(1000, "A descrição deve ter no máximo 1000 caracteres")
    .optional()
    .default(""),
  image: z
    .union([z.url("URL de imagem inválida"), z.literal("")])
    .optional()
    .default(""),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type CategoryInput = z.infer<typeof categorySchema>;

export function parseCategoryForm(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    image: formData.get("image")?.toString() ?? "",
    status: formData.get("status")?.toString() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}
