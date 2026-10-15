import type { ListingCondition, ReportReason } from "@/types/database";

export const SITE_NAME = "OHMIQ";
export const SITE_TAGLINE = "La seconde vie de la tech.";
export const SITE_DESCRIPTION =
  "Le marketplace nouvelle génération de l'électronique et des appareils électriques d'occasion. Smartphones, PC, gaming, électroménager, outillage — achetez et vendez en toute confiance.";

export const OHMIQ_PRO_PRICE_EUR = 9.99;

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "Neuf",
  like_new: "Comme neuf",
  good: "Bon état",
  fair: "État correct",
  for_parts: "Pour pièces",
};

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  scam: "Arnaque",
  fake_product: "Faux produit",
  prohibited_content: "Contenu interdit",
  wrong_category: "Mauvaise catégorie",
  spam: "Spam",
  already_sold: "Annonce déjà vendue",
  other: "Autre",
};

export const SORT_LABELS: Record<string, string> = {
  relevance: "Pertinence",
  recent: "Plus récentes",
  price_asc: "Prix croissant",
  price_desc: "Prix décroissant",
};

export const LISTINGS_PER_PAGE = 24;

export const FRENCH_CITIES_SUGGESTIONS = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Strasbourg",
  "Montpellier",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Genève",
  "Annecy",
];
