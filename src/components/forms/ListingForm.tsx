"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { X, Star, Upload, Eye } from "lucide-react";
import { listingFormSchema, type ListingFormInput, MAX_LISTING_IMAGES } from "@/lib/validations/listing";
import { CONDITION_LABELS } from "@/lib/constants";
import { formatPrice } from "@/lib/utils";
import { Field, FieldError, Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import type { Brand, Category, CategoryAttribute, Model, Subcategory } from "@/types";

interface PendingImage {
  id: string;
  file: File;
  previewUrl: string;
}

export function ListingForm({
  categories,
  subcategoriesByCategory,
  brands,
  categoryAttributes,
  onSubmit,
  onFetchModels,
}: {
  categories: Category[];
  subcategoriesByCategory: Record<string, Subcategory[]>;
  brands: Brand[];
  categoryAttributes: CategoryAttribute[];
  onSubmit: (values: ListingFormInput, images: File[]) => Promise<{ success: boolean; message?: string }>;
  onFetchModels: (brandId: string, subcategoryId: string | null) => Promise<Model[]>;
}) {
  const [images, setImages] = useState<PendingImage[]>([]);
  const [primaryImageId, setPrimaryImageId] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [models, setModels] = useState<Model[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ListingFormInput>({
    resolver: zodResolver(listingFormSchema),
    defaultValues: {
      isNegotiable: false,
      deliveryAvailable: false,
      condition: "good",
      hasInvoice: false,
      hasWarranty: false,
      attributes: {},
      contactPhonePublic: false,
      contactWhatsappPublic: false,
      contactEmailPublic: false,
    },
  });

  const values = watch();
  const selectedCategoryId = watch("categoryId");
  const selectedSubcategoryId = watch("subcategoryId");
  const selectedBrandId = watch("brandId");
  const subcategories = subcategoriesByCategory[selectedCategoryId] ?? [];

  const relevantAttributes = useMemo(() => {
    const bySubcategory = categoryAttributes.filter(
      (a) => a.subcategory_id === (selectedSubcategoryId || null) && a.category_id === selectedCategoryId
    );
    if (bySubcategory.length > 0) return bySubcategory;
    return categoryAttributes.filter((a) => a.category_id === selectedCategoryId && !a.subcategory_id);
  }, [categoryAttributes, selectedCategoryId, selectedSubcategoryId]);

  useEffect(() => {
    if (!selectedBrandId) {
      setModels([]);
      return;
    }
    let cancelled = false;
    onFetchModels(selectedBrandId, selectedSubcategoryId || null).then((result) => {
      if (!cancelled) setModels(result);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedBrandId, selectedSubcategoryId, onFetchModels]);

  const handleFilesSelected = (fileList: FileList | null) => {
    if (!fileList) return;
    const remainingSlots = MAX_LISTING_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, remainingSlots);

    const newImages = files
      .filter((f) => ["image/jpeg", "image/png", "image/webp"].includes(f.type) && f.size <= 5 * 1024 * 1024)
      .map((file) => ({ id: crypto.randomUUID(), file, previewUrl: URL.createObjectURL(file) }));

    setImages((prev) => {
      const merged = [...prev, ...newImages];
      if (!primaryImageId && merged.length > 0) setPrimaryImageId(merged[0].id);
      return merged;
    });
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (primaryImageId === id) setPrimaryImageId(null);
  };

  const submit = handleSubmit((data) => {
    setServerError(null);
    startTransition(async () => {
      const orderedFiles = [
        ...images.filter((img) => img.id === primaryImageId),
        ...images.filter((img) => img.id !== primaryImageId),
      ].map((img) => img.file);

      const result = await onSubmit(data, orderedFiles);
      if (!result.success) {
        setServerError(result.message ?? "Une erreur est survenue.");
      }
    });
  });

  return (
    <form onSubmit={submit} className="space-y-8">
      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Informations principales</h2>

        <div>
          <Field htmlFor="title">Titre de l&apos;annonce</Field>
          <Input id="title" placeholder="Ex : RTX 4070 12 Go — comme neuve" {...register("title")} />
          <FieldError>{errors.title?.message}</FieldError>
        </div>

        <div>
          <Field htmlFor="description">Description</Field>
          <Textarea
            id="description"
            rows={6}
            placeholder="Décris l'état, l'usage, la raison de la vente..."
            {...register("description")}
          />
          <FieldError>{errors.description?.message}</FieldError>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field htmlFor="price">Prix (€)</Field>
            <Input id="price" type="number" min={0} step="0.01" {...register("price", { valueAsNumber: true })} />
            <FieldError>{errors.price?.message}</FieldError>
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="accent-signal" {...register("isNegotiable")} />
              Prix négociable
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field htmlFor="categoryId">Catégorie</Field>
            <Select
              id="categoryId"
              {...register("categoryId")}
              onChange={(e) => {
                setValue("categoryId", e.target.value);
                setValue("subcategoryId", null);
                setValue("brandId", null);
                setValue("modelId", null);
                setValue("attributes", {});
              }}
            >
              <option value="">Choisir...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>
            <FieldError>{errors.categoryId?.message}</FieldError>
          </div>
          <div>
            <Field htmlFor="subcategoryId">Sous-catégorie</Field>
            <Select
              id="subcategoryId"
              {...register("subcategoryId")}
              disabled={subcategories.length === 0}
              onChange={(e) => {
                setValue("subcategoryId", e.target.value || null);
                setValue("modelId", null);
              }}
            >
              <option value="">
                {subcategories.length === 0 ? "Aucune disponible" : "Choisir..."}
              </option>
              {subcategories.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field htmlFor="brandId">Marque</Field>
            <Select
              id="brandId"
              {...register("brandId")}
              onChange={(e) => {
                setValue("brandId", e.target.value || null);
                setValue("modelId", null);
              }}
            >
              <option value="">Choisir...</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Field htmlFor="modelId">Modèle</Field>
            <Select id="modelId" {...register("modelId")} disabled={!selectedBrandId || models.length === 0}>
              <option value="">
                {!selectedBrandId ? "Choisis une marque d'abord" : models.length === 0 ? "Aucun modèle référencé" : "Choisir..."}
              </option>
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Field htmlFor="condition">État du produit</Field>
          <Select id="condition" {...register("condition")}>
            {Object.entries(CONDITION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </div>
      </section>

      {relevantAttributes.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Caractéristiques techniques</h2>
          <p className="text-sm text-muted">
            Ces champs s&apos;adaptent automatiquement à la catégorie choisie.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {relevantAttributes.map((attr) => (
              <div key={attr.id}>
                <Field htmlFor={`attr-${attr.id}`}>
                  {attr.label}
                  {attr.unit ? ` (${attr.unit})` : ""}
                  {attr.is_required ? " *" : ""}
                </Field>
                {attr.input_type === "select" && attr.options ? (
                  <Select
                    id={`attr-${attr.id}`}
                    value={values.attributes?.[attr.id] ?? ""}
                    onChange={(e) =>
                      setValue("attributes", { ...values.attributes, [attr.id]: e.target.value })
                    }
                  >
                    <option value="">Choisir...</option>
                    {attr.options.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <Input
                    id={`attr-${attr.id}`}
                    type={attr.input_type === "number" ? "number" : "text"}
                    value={values.attributes?.[attr.id] ?? ""}
                    onChange={(e) =>
                      setValue("attributes", { ...values.attributes, [attr.id]: e.target.value })
                    }
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Localisation</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Field htmlFor="city">Ville</Field>
            <Input id="city" placeholder="Lyon" {...register("city")} />
            <FieldError>{errors.city?.message}</FieldError>
          </div>
          <div>
            <Field htmlFor="postalCode">Code postal</Field>
            <Input id="postalCode" placeholder="69001" {...register("postalCode")} />
            <FieldError>{errors.postalCode?.message}</FieldError>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm text-ink">
          <input type="checkbox" className="accent-signal" {...register("deliveryAvailable")} />
          Livraison possible
        </label>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Confiance &amp; historique</h2>
        <div className="flex flex-wrap gap-5">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="accent-signal" {...register("hasInvoice")} />
            Facture disponible
          </label>
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" className="accent-signal" {...register("hasWarranty")} />
            Sous garantie
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {values.hasWarranty && (
            <div>
              <Field htmlFor="warrantyUntil">Garantie jusqu&apos;au</Field>
              <Input id="warrantyUntil" type="date" {...register("warrantyUntil")} />
            </div>
          )}
          <div>
            <Field htmlFor="purchaseDate">Date d&apos;achat</Field>
            <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
          </div>
        </div>
        <div>
          <Field htmlFor="accessoriesIncluded">Accessoires inclus</Field>
          <Input id="accessoriesIncluded" placeholder="Chargeur, câble, boîte d'origine..." {...register("accessoriesIncluded")} />
        </div>
        <div>
          <Field htmlFor="knownDefects">Défauts connus</Field>
          <Textarea id="knownDefects" rows={2} placeholder="Sois transparent : ça inspire confiance." {...register("knownDefects")} />
        </div>
        <div>
          <Field htmlFor="serialNumber">Numéro de série / IMEI (optionnel, jamais public)</Field>
          <Input id="serialNumber" {...register("serialNumber")} />
          <p className="mt-1 text-xs text-muted">
            Visible uniquement par toi et l&apos;équipe de modération — jamais affiché publiquement.
          </p>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Photos</h2>
        <p className="text-sm text-muted">
          Jusqu&apos;à {MAX_LISTING_IMAGES} photos. La première (ou celle marquée d&apos;une étoile) sera
          l&apos;image principale.
        </p>

        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {images.map((img) => (
            <div key={img.id} className="group relative aspect-square overflow-hidden rounded-[10px] border border-line">
              <Image src={img.previewUrl} alt="" fill className="object-cover" />
              <button
                type="button"
                onClick={() => setPrimaryImageId(img.id)}
                aria-label="Définir comme image principale"
                className="absolute left-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90"
              >
                <Star
                  size={14}
                  className={primaryImageId === img.id ? "fill-signal text-signal" : "text-muted"}
                />
              </button>
              <button
                type="button"
                onClick={() => removeImage(img.id)}
                aria-label="Supprimer la photo"
                className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-paper/90"
              >
                <X size={14} />
              </button>
            </div>
          ))}

          {images.length < MAX_LISTING_IMAGES && (
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-[10px] border border-dashed border-line-strong text-muted hover:bg-paper-muted">
              <Upload size={20} />
              <span className="text-xs">Ajouter</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => handleFilesSelected(e.target.files)}
              />
            </label>
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold">Moyens de contact</h2>
        <p className="text-sm text-muted">
          Choisis les coordonnées à afficher publiquement. Rien n&apos;est visible sans ton accord.
        </p>

        <div className="space-y-3">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field htmlFor="contactPhone">Téléphone</Field>
              <Input id="contactPhone" placeholder="0600000000" {...register("contactPhone")} />
              <FieldError>{errors.contactPhone?.message}</FieldError>
            </div>
            <label className="mb-3 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="accent-signal" {...register("contactPhonePublic")} />
              Public
            </label>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field htmlFor="contactWhatsapp">WhatsApp</Field>
              <Input id="contactWhatsapp" placeholder="0600000000" {...register("contactWhatsapp")} />
              <FieldError>{errors.contactWhatsapp?.message}</FieldError>
            </div>
            <label className="mb-3 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="accent-signal" {...register("contactWhatsappPublic")} />
              Public
            </label>
          </div>

          <div className="flex items-end gap-3">
            <div className="flex-1">
              <Field htmlFor="contactEmail">Email</Field>
              <Input id="contactEmail" type="email" placeholder="vous@exemple.com" {...register("contactEmail")} />
              <FieldError>{errors.contactEmail?.message}</FieldError>
            </div>
            <label className="mb-3 flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" className="accent-signal" {...register("contactEmailPublic")} />
              Public
            </label>
          </div>
        </div>
      </section>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button type="button" variant="outline" onClick={() => setShowPreview(true)}>
          <Eye size={16} /> Prévisualiser
        </Button>
        <Button type="submit" variant="signal" size="lg" disabled={isPending}>
          {isPending ? "Publication..." : "Publier l'annonce"}
        </Button>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
          <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-[16px] bg-paper p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Aperçu</h3>
              <button type="button" onClick={() => setShowPreview(false)} aria-label="Fermer">
                <X size={20} />
              </button>
            </div>
            {images[0] && (
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-[10px]">
                <Image src={images[0].previewUrl} alt="" fill className="object-cover" />
              </div>
            )}
            <p className="font-display text-xl font-semibold">
              {values.price ? formatPrice(Number(values.price)) : "—"}
            </p>
            <p className="mt-1 font-medium">{values.title || "Titre de l'annonce"}</p>
            <p className="mt-1 text-sm text-muted">{values.city || "Ville"}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm text-ink">
              {values.description || "Description de l'annonce..."}
            </p>
          </div>
        </div>
      )}
    </form>
  );
}
