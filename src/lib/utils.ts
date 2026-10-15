import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne intelligemment des classes Tailwind (évite les conflits). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Formatte un prix en euros, ex: 1234.5 -> "1 234,50 €" ; 0 -> "Gratuit" */
export function formatPrice(price: number): string {
  if (price === 0) return "Gratuit";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: price % 1 === 0 ? 0 : 2,
  }).format(price);
}

/** Formatte une date relative simple en français, ex: "il y a 3 jours" */
export function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) return "à l'instant";
  if (diffMinutes < 60) return `il y a ${diffMinutes} min`;
  if (diffHours < 24) return `il y a ${diffHours} h`;
  if (diffDays < 7) return `il y a ${diffDays} j`;
  if (diffDays < 30) return `il y a ${Math.floor(diffDays / 7)} sem.`;
  if (diffDays < 365) return `il y a ${Math.floor(diffDays / 30)} mois`;
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    date
  );
}

/** Formatte une date d'inscription/publication complète */
export function formatFullDate(dateString: string): string {
  return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" }).format(
    new Date(dateString)
  );
}

/** Nettoie un numéro français pour un lien tel:/wa.me (garde le + international) */
export function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\s|\.|-/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.startsWith("0")) return `+33${digits.slice(1)}`;
  return digits;
}

export function buildTelLink(phone: string): string {
  return `tel:${toInternationalPhone(phone)}`;
}

export function buildWhatsappLink(phone: string, message?: string): string {
  const intl = toInternationalPhone(phone).replace("+", "");
  const base = `https://wa.me/${intl}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function buildMailtoLink(email: string, subject?: string, body?: string): string {
  const params = new URLSearchParams();
  if (subject) params.set("subject", subject);
  if (body) params.set("body", body);
  const query = params.toString();
  return `mailto:${email}${query ? `?${query}` : ""}`;
}

/** Génère (côté client) un identifiant de session anonyme pour la dédup des vues. */
export function getOrCreateAnonSessionId(): string {
  const key = "contacta_session_id";
  if (typeof window === "undefined") return "";
  let sessionId = window.localStorage.getItem(key);
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    window.localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}
