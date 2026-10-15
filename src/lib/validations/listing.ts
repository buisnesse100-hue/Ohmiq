import { z } from "zod";

const phoneRegex = /^(\+33|0)[1-9](\d{2}){4}$/;

export const listingConditionValues = ["new", "like_new", "good", "fair", "for_parts"] as const;

const listingBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, "Le titre doit contenir au moins 5 caractères.")
    .max(80, "Le titre ne peut pas dépasser 80 caractères."),
  description: z
    .string()
    .trim()
    .min(20, "La description doit contenir au moins 20 caractères.")
    .max(3000, "La description ne peut pas dépasser 3000 caractères."),
  price: z
    .number({ error: "Le prix doit être un nombre." })
    .min(0, "Le prix ne peut pas être négatif.")
    .max(10_000_000, "Le prix semble incorrect."),
  isNegotiable: z.boolean(),
  categoryId: z.string().uuid("Choisis une catégorie."),
  subcategoryId: z.string().uuid().optional().nullable(),
  brandId: z.string().uuid().optional().nullable(),
  modelId: z.string().uuid().optional().nullable(),
  city: z.string().trim().min(2, "Indique une ville.").max(100),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{4,10}$/, "Code postal invalide.")
    .optional()
    .or(z.literal("")),
  condition: z.enum(listingConditionValues),
  deliveryAvailable: z.boolean(),

  // Informations produit d'occasion
  hasInvoice: z.boolean(),
  hasWarranty: z.boolean(),
  warrantyUntil: z.string().optional().or(z.literal("")),
  purchaseDate: z.string().optional().or(z.literal("")),
  knownDefects: z.string().trim().max(1000).optional().or(z.literal("")),
  accessoriesIncluded: z.string().trim().max(500).optional().or(z.literal("")),
  serialNumber: z.string().trim().max(100).optional().or(z.literal("")),

  // Caractéristiques techniques dynamiques : { [attributeId]: valeur }
  attributes: z.record(z.string(), z.string()),

  contactPhone: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro de téléphone invalide (format français).")
    .optional()
    .or(z.literal("")),
  contactPhonePublic: z.boolean(),
  contactWhatsapp: z
    .string()
    .trim()
    .regex(phoneRegex, "Numéro WhatsApp invalide (format français).")
    .optional()
    .or(z.literal("")),
  contactWhatsappPublic: z.boolean(),
  contactEmail: z.string().trim().email("Email invalide.").optional().or(z.literal("")),
  contactEmailPublic: z.boolean(),
});

export const listingFormSchema = listingBaseSchema
  .refine(
    (data) => Boolean(data.contactPhone) || Boolean(data.contactWhatsapp) || Boolean(data.contactEmail),
    {
      message: "Renseigne au moins un moyen de contact (téléphone, WhatsApp ou email).",
      path: ["contactPhone"],
    }
  )
  .refine(
    (data) =>
      !(data.contactPhonePublic && !data.contactPhone) &&
      !(data.contactWhatsappPublic && !data.contactWhatsapp) &&
      !(data.contactEmailPublic && !data.contactEmail),
    {
      message: "Tu ne peux rendre public que les coordonnées que tu as renseignées.",
      path: ["contactPhonePublic"],
    }
  );

export type ListingFormInput = z.infer<typeof listingFormSchema>;

export const listingImageUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, "Chaque image doit faire moins de 5 Mo.")
    .refine(
      (file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type),
      "Formats acceptés : JPEG, PNG, WebP."
    ),
});

export const MAX_LISTING_IMAGES = 10;

