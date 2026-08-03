import { z } from "zod";
import { PLATFORM_BADGE_KEYS } from "@/lib/constants";

export const platformSchema = z.object({
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
  shortLabel: z
    .string()
    .trim()
    .max(10, "O atalho deve ter no máximo 10 caracteres")
    .optional()
    .default(""),
  badgeKey: z.enum(PLATFORM_BADGE_KEYS as [string, ...string[]], "Cor inválida"),
  status: z.enum(["ACTIVE", "INACTIVE"]),
});

export type PlatformInput = z.infer<typeof platformSchema>;

export function parsePlatformForm(formData: FormData) {
  return {
    name: formData.get("name")?.toString() ?? "",
    slug: formData.get("slug")?.toString() ?? "",
    shortLabel: formData.get("shortLabel")?.toString() ?? "",
    badgeKey: formData.get("badgeKey")?.toString() ?? "gray",
    status: formData.get("status")?.toString() === "INACTIVE" ? "INACTIVE" : "ACTIVE",
  };
}
