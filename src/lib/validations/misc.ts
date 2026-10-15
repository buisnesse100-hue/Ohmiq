import { z } from "zod";

export const searchFiltersSchema = z.object({
  q: z.string().trim().max(200).optional(),
  category: z.string().trim().max(100).optional(),
  subcategory: z.string().trim().max(100).optional(),
  brand: z.string().trim().max(100).optional(),
  city: z.string().trim().max(100).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  condition: z.string().trim().max(50).optional(),
  isProfessional: z
    .enum(["true", "false"])
    .optional()
    .transform((v) => (v === undefined ? undefined : v === "true")),
  hasPhone: z.coerce.boolean().optional(),
  hasWhatsapp: z.coerce.boolean().optional(),
  hasEmail: z.coerce.boolean().optional(),
  sort: z.enum(["relevance", "recent", "price_asc", "price_desc"]).default("recent"),
  page: z.coerce.number().int().min(1).default(1),
});

export type SearchFiltersInput = z.infer<typeof searchFiltersSchema>;

export const reportReasonValues = [
  "scam",
  "fake_product",
  "prohibited_content",
  "wrong_category",
  "spam",
  "already_sold",
  "other",
] as const;

export const reportFormSchema = z.object({
  listingId: z.string().uuid(),
  reason: z.enum(reportReasonValues),
  message: z.string().trim().max(1000).optional().or(z.literal("")),
});

export type ReportFormInput = z.infer<typeof reportFormSchema>;

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(50),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    bio: z.string().trim().max(500).optional().or(z.literal("")),
    phone: z
      .string()
      .trim()
      .regex(/^(\+33|0)[1-9](\d{2}){4}$/, "Numéro invalide (format français).")
      .optional()
      .or(z.literal("")),
    isProfessional: z.boolean(),
    companyName: z.string().trim().max(150).optional().or(z.literal("")),
    siret: z
      .string()
      .trim()
      .regex(/^\d{14}$/, "Un SIRET comporte 14 chiffres.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => !data.isProfessional || Boolean(data.companyName), {
    message: "Indique le nom de ton entreprise pour activer le mode professionnel.",
    path: ["companyName"],
  });

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const favoriteToggleSchema = z.object({
  listingId: z.string().uuid(),
});
