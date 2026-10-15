import { describe, it, expect } from "vitest";
import { listingFormSchema } from "@/lib/validations/listing";

const validBase = {
  title: "Canapé 3 places en cuir",
  description: "Très bon état, peu utilisé, à venir chercher sur place.",
  price: 250,
  isNegotiable: true,
  categoryId: "11111111-1111-4111-8111-111111111111",
  subcategoryId: undefined,
  brandId: undefined,
  modelId: undefined,
  city: "Lyon",
  postalCode: "69001",
  condition: "good" as const,
  deliveryAvailable: false,
  hasInvoice: false,
  hasWarranty: false,
  warrantyUntil: "",
  purchaseDate: "",
  knownDefects: "",
  accessoriesIncluded: "",
  serialNumber: "",
  attributes: {},
  contactPhone: "0600000000",
  contactPhonePublic: true,
  contactWhatsapp: "",
  contactWhatsappPublic: false,
  contactEmail: "",
  contactEmailPublic: false,
};

describe("listingFormSchema", () => {
  it("accepte une annonce valide avec au moins un moyen de contact", () => {
    const result = listingFormSchema.safeParse(validBase);
    expect(result.success).toBe(true);
  });

  it("refuse une annonce sans aucun moyen de contact", () => {
    const result = listingFormSchema.safeParse({
      ...validBase,
      contactPhone: "",
      contactPhonePublic: false,
    });
    expect(result.success).toBe(false);
  });

  it("refuse de rendre public un moyen de contact non renseigné", () => {
    const result = listingFormSchema.safeParse({
      ...validBase,
      contactWhatsapp: "",
      contactWhatsappPublic: true,
    });
    expect(result.success).toBe(false);
  });

  it("refuse un titre trop court", () => {
    const result = listingFormSchema.safeParse({ ...validBase, title: "Ab" });
    expect(result.success).toBe(false);
  });

  it("refuse un prix négatif", () => {
    const result = listingFormSchema.safeParse({ ...validBase, price: -10 });
    expect(result.success).toBe(false);
  });

  it("refuse un numéro de téléphone mal formé", () => {
    const result = listingFormSchema.safeParse({ ...validBase, contactPhone: "abc123" });
    expect(result.success).toBe(false);
  });

  it("refuse un email de contact invalide", () => {
    const result = listingFormSchema.safeParse({
      ...validBase,
      contactEmail: "pas-un-email",
      contactEmailPublic: false,
    });
    expect(result.success).toBe(false);
  });
});
