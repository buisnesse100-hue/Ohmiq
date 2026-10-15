import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Eye, Calendar, Truck, Tag } from "lucide-react";
import { getListingBySlug, getRelatedListings } from "@/services/listings";
import { getListingAttributeValues } from "@/services/catalog";
import { getDealAssessment } from "@/services/price-estimates";
import { getCurrentProfile } from "@/services/profiles";
import { createClient } from "@/lib/supabase/server";
import { ImageGallery } from "@/components/listings/ImageGallery";
import { ContactButtons } from "@/components/listings/ContactButtons";
import { BuyerActions } from "@/components/listings/BuyerActions";
import { FavoriteButton } from "@/components/listings/FavoriteButton";
import { ShareButton } from "@/components/listings/ShareButton";
import { ReportDialog } from "@/components/listings/ReportDialog";
import { SellerCard } from "@/components/listings/SellerCard";
import { ViewTracker } from "@/components/listings/ViewTracker";
import { DealBadge } from "@/components/listings/DealBadge";
import { TechnicalSpecs } from "@/components/listings/TechnicalSpecs";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { Badge } from "@/components/ui/Badge";
import { formatPrice, formatFullDate } from "@/lib/utils";
import { CONDITION_LABELS } from "@/lib/constants";
import { getListingImageUrl } from "@/lib/supabase/storage";

interface ListingPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing || listing.status === "deleted" || listing.status === "hidden") return {};

  const primaryImage = listing.images.find((i) => i.is_primary) ?? listing.images[0];
  const imageUrl = getListingImageUrl(primaryImage?.storage_path);
  const description = `${formatPrice(listing.price)} — ${listing.city}. ${listing.description.slice(0, 140)}`;

  return {
    title: listing.title,
    description,
    alternates: { canonical: `/annonce/${listing.slug}` },
    openGraph: {
      title: listing.title,
      description,
      type: "website",
      images: imageUrl ? [{ url: imageUrl, width: 1200, height: 900 }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);

  if (!listing || listing.status === "deleted" || listing.status === "hidden") {
    notFound();
  }

  const [profile, related, dealAssessment, attributeValues] = await Promise.all([
    getCurrentProfile(),
    getRelatedListings(listing.category.id, listing.id),
    getDealAssessment(listing.model_id, listing.condition, listing.price),
    getListingAttributeValues(listing.id),
  ]);

  const isOwner = profile?.id === listing.seller_id;
  // Le numéro de série/IMEI n'est jamais exposé publiquement, même dans la réponse API :
  // seul le propriétaire (ou un futur accès admin dédié) peut le voir.
  const safeListing = isOwner ? listing : { ...listing, serial_number: null };

  let isFavorited = false;
  if (profile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", profile.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    isFavorited = Boolean(data);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const listingUrl = `${siteUrl}/annonce/${listing.slug}`;
  const primaryImage = listing.images.find((i) => i.is_primary) ?? listing.images[0];
  const imageUrl = getListingImageUrl(primaryImage?.storage_path);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: imageUrl ? [imageUrl] : undefined,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "EUR",
      availability: listing.status === "sold" ? "https://schema.org/SoldOut" : "https://schema.org/InStock",
      url: listingUrl,
    },
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <ViewTracker listingId={listing.id} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div>
          <ImageGallery images={listing.images} title={listing.title} />

          <div className="mt-6">
            <div className="flex flex-wrap items-center gap-2">
              {listing.is_promoted && <Badge variant="signal">Mis en avant</Badge>}
              <Badge variant="outline">{CONDITION_LABELS[listing.condition]}</Badge>
              {listing.status === "sold" && <Badge>Vendu</Badge>}
            </div>

            <h1 className="mt-3 font-display text-2xl font-semibold sm:text-3xl">{listing.title}</h1>
            {(listing.brand?.name || listing.model?.name) && (
              <p className="mt-1 text-sm font-medium text-volt-ink">
                {listing.brand?.name}
                {listing.model?.name ? ` · ${listing.model.name}` : ""}
              </p>
            )}
            <p className="mt-2 font-display text-3xl font-bold text-ink">
              {formatPrice(listing.price)}
              {listing.is_negotiable && (
                <span className="ml-2 text-sm font-normal text-muted">Négociable</span>
              )}
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted">
              <span className="flex items-center gap-1">
                <MapPin size={15} /> {listing.city}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={15} /> Publiée le {formatFullDate(listing.published_at ?? listing.created_at)}
              </span>
              <span className="flex items-center gap-1">
                <Eye size={15} /> {listing.view_count} vues
              </span>
              {listing.delivery_available && (
                <span className="flex items-center gap-1">
                  <Truck size={15} /> Livraison possible
                </span>
              )}
              {listing.subcategory && (
                <span className="flex items-center gap-1">
                  <Tag size={15} /> {listing.subcategory.name}
                </span>
              )}
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="font-display text-lg font-semibold">Description</h2>
              <p className="mt-2 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">
                {listing.description}
              </p>
            </div>

            <TechnicalSpecs listing={safeListing} attributeValues={attributeValues} />
          </div>
        </div>

        <div className="space-y-4">
          <BuyerActions
            listingId={listing.id}
            sellerId={listing.seller_id}
            listingTitle={listing.title}
            price={listing.price}
            isNegotiable={listing.is_negotiable}
            isAuthenticated={Boolean(profile)}
            isOwnListing={isOwner}
          />

          <div className="rounded-[16px] border border-line p-4">
            <h2 className="mb-3 font-display text-lg font-semibold">Coordonnées directes</h2>
            <ContactButtons listing={listing} />
          </div>

          {dealAssessment && <DealBadge assessment={dealAssessment} />}

          <div className="flex gap-2">
            <FavoriteButton
              listingId={listing.id}
              initialFavorited={isFavorited}
              isAuthenticated={Boolean(profile)}
            />
            <ShareButton title={listing.title} url={listingUrl} />
          </div>

          <SellerCard seller={listing.seller} />

          <ReportDialog listingId={listing.id} />
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-display text-xl font-semibold">Annonces similaires</h2>
          <div className="mt-5">
            <ListingGrid listings={related} />
          </div>
        </section>
      )}
    </div>
  );
}
