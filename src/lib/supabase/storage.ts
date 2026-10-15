const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export const LISTING_IMAGES_BUCKET = "listing-images";
export const AVATARS_BUCKET = "avatars";

/** Construit l'URL publique d'un fichier stocké dans Supabase Storage. */
export function getPublicStorageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path || !SUPABASE_URL) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

export function getListingImageUrl(path: string | null | undefined): string | null {
  return getPublicStorageUrl(LISTING_IMAGES_BUCKET, path);
}

export function getAvatarUrl(path: string | null | undefined): string | null {
  return getPublicStorageUrl(AVATARS_BUCKET, path);
}

/** Chemin de stockage conventionnel pour une photo d'annonce. */
export function buildListingImagePath(sellerId: string, listingId: string, fileName: string): string {
  const ext = fileName.split(".").pop() ?? "jpg";
  const uniqueName = `${crypto.randomUUID()}.${ext}`;
  return `${sellerId}/${listingId}/${uniqueName}`;
}

export function buildAvatarPath(userId: string, fileName: string): string {
  const ext = fileName.split(".").pop() ?? "jpg";
  return `${userId}/avatar.${ext}`;
}
