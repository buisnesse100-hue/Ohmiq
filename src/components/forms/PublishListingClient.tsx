"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ListingForm } from "@/components/forms/ListingForm";
import { createListingAction } from "@/actions/listings";
import { uploadListingImageAction } from "@/actions/listing-images";
import { getModelsForBrandAction } from "@/actions/catalog";
import { listingFormSchema, type ListingFormInput } from "@/lib/validations/listing";
import type { Brand, Category, CategoryAttribute, Subcategory } from "@/types";

export function PublishListingClient({
  categories,
  subcategories,
  brands,
  categoryAttributes,
}: {
  categories: Category[];
  subcategories: Subcategory[];
  brands: Brand[];
  categoryAttributes: CategoryAttribute[];
}) {
  const router = useRouter();

  const subcategoriesByCategory = useMemo(() => {
    return subcategories.reduce<Record<string, Subcategory[]>>((acc, sub) => {
      acc[sub.category_id] = [...(acc[sub.category_id] ?? []), sub];
      return acc;
    }, {});
  }, [subcategories]);

  const handleSubmit = async (values: ListingFormInput, images: File[]) => {
    const parsed = listingFormSchema.parse(values);
    const formData = new FormData();
    formData.set("title", parsed.title);
    formData.set("description", parsed.description);
    formData.set("price", String(parsed.price));
    if (parsed.isNegotiable) formData.set("isNegotiable", "on");
    formData.set("categoryId", parsed.categoryId);
    if (parsed.subcategoryId) formData.set("subcategoryId", parsed.subcategoryId);
    if (parsed.brandId) formData.set("brandId", parsed.brandId);
    if (parsed.modelId) formData.set("modelId", parsed.modelId);
    formData.set("city", parsed.city);
    if (parsed.postalCode) formData.set("postalCode", parsed.postalCode);
    formData.set("condition", parsed.condition);
    if (parsed.deliveryAvailable) formData.set("deliveryAvailable", "on");
    if (parsed.hasInvoice) formData.set("hasInvoice", "on");
    if (parsed.hasWarranty) formData.set("hasWarranty", "on");
    if (parsed.warrantyUntil) formData.set("warrantyUntil", parsed.warrantyUntil);
    if (parsed.purchaseDate) formData.set("purchaseDate", parsed.purchaseDate);
    if (parsed.knownDefects) formData.set("knownDefects", parsed.knownDefects);
    if (parsed.accessoriesIncluded) formData.set("accessoriesIncluded", parsed.accessoriesIncluded);
    if (parsed.serialNumber) formData.set("serialNumber", parsed.serialNumber);
    formData.set("attributesJson", JSON.stringify(parsed.attributes ?? {}));
    if (parsed.contactPhone) formData.set("contactPhone", parsed.contactPhone);
    if (parsed.contactPhonePublic) formData.set("contactPhonePublic", "on");
    if (parsed.contactWhatsapp) formData.set("contactWhatsapp", parsed.contactWhatsapp);
    if (parsed.contactWhatsappPublic) formData.set("contactWhatsappPublic", "on");
    if (parsed.contactEmail) formData.set("contactEmail", parsed.contactEmail);
    if (parsed.contactEmailPublic) formData.set("contactEmailPublic", "on");

    const result = await createListingAction(null, formData);

    if (!result.success || !result.data) {
      return { success: false, message: result.message ?? "Une erreur est survenue." };
    }

    const listingId = result.data.id;

    for (const file of images) {
      const imageFormData = new FormData();
      imageFormData.set("file", file);
      const uploadResult = await uploadListingImageAction(listingId, imageFormData);
      if (!uploadResult.success) {
        console.error("[upload photo]", uploadResult.message);
      }
    }

    router.push(`/annonce/${result.data.slug}`);
    return { success: true };
  };

  return (
    <ListingForm
      categories={categories}
      subcategoriesByCategory={subcategoriesByCategory}
      brands={brands}
      categoryAttributes={categoryAttributes}
      onSubmit={handleSubmit}
      onFetchModels={getModelsForBrandAction}
    />
  );
}
