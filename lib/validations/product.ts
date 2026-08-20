import { z } from "zod";

export const STATUS_VALUES = ["ACTIVE", "INACTIVE"] as const;
export const SOURCE_TYPE_VALUES = ["MANUAL", "IMPORTED"] as const;

export const productSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "O título deve ter pelo menos 3 caracteres")
    .max(200, "O título deve ter no máximo 200 caracteres"),
  slug: z
    .string()
    .trim()
    .min(2, "Slug muito curto")
    .max(200, "Slug muito longo")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug inválido. Use apenas letras minúsculas, números e hífens."
    ),
  description: z
    .string()
    .trim()
    .max(5000, "A descrição deve ter no máximo 5000 caracteres")
    .optional()
    .default(""),
  image: z
    .union([z.url("URL de imagem inválida"), z.literal("")])
    .optional()
    .default(""),
  price: z
    .union([z.number().min(0, "Preço não pode ser negativo"), z.null()])
    .optional()
    .default(null),
  categoryId: z.union([z.string().min(1, "Categoria inválida"), z.null()]).optional().default(null),
  platformId: z.string().min(1, "Selecione a plataforma"),
  affiliateLink: z.url("Link de afiliado inválido").min(5, "Informe o link de afiliado"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  featured: z.boolean(),
  sourceType: z.enum(["MANUAL", "IMPORTED"]).optional().default("MANUAL"),
  sourceUrl: z.union([z.url("URL de origem inválida"), z.literal("")]).optional().default(""),
});

export type ProductInput = z.infer<typeof productSchema>;

export function parseProductForm(formData: FormData) {
  const price = formData.get("price");
  return {
    title: formData.get("title")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    image: formData.get("image")?.toString() ?? "",
    price:
      price && price.toString().trim() !== ""
        ? Number(price.toString().replace(",", "."))
        : null,
    categoryId: formData.get("categoryId")?.toString() || null,
    platformId: formData.get("platformId")?.toString() ?? "",
    affiliateLink: formData.get("affiliateLink")?.toString() ?? "",
    status: formData.get("status")?.toString() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
    featured: formData.get("featured") === "on",
    sourceType: formData.get("sourceType")?.toString() === "IMPORTED" ? "IMPORTED" : "MANUAL",
    sourceUrl: formData.get("sourceUrl")?.toString() ?? "",
  };
}
