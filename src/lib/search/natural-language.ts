/**
 * Extrait une contrainte de prix en langage naturel d'une requête de recherche,
 * et retourne le texte de recherche "nettoyé" à côté.
 *
 * Gère des tournures courantes en français :
 *  - "RTX 4070 moins de 400 €"     -> { query: "RTX 4070", priceMax: 400 }
 *  - "iPhone 13 sous les 300 euros" -> { query: "iPhone 13", priceMax: 300 }
 *  - "PS5 max 350€"                 -> { query: "PS5", priceMax: 350 }
 *  - "vélo électrique plus de 500€" -> { query: "vélo électrique", priceMin: 500 }
 *  - "casque entre 50 et 100 €"     -> { query: "casque", priceMin: 50, priceMax: 100 }
 *
 * Ne fait aucun appel réseau : c'est un parseur local, volontairement simple et prévisible.
 */
export interface ParsedSearchQuery {
  query: string;
  priceMin?: number;
  priceMax?: number;
}

const NUMBER = "(\\d+(?:[.,]\\d+)?)";
const CURRENCY = "(?:€|euros?)?";

const PATTERNS: Array<{
  regex: RegExp;
  extract: (match: RegExpMatchArray) => { priceMin?: number; priceMax?: number };
}> = [
  {
    // "entre 50 et 100 €"
    regex: new RegExp(`entre\\s+${NUMBER}\\s+et\\s+${NUMBER}\\s*${CURRENCY}`, "i"),
    extract: (m) => ({ priceMin: parseFloat(m[1].replace(",", ".")), priceMax: parseFloat(m[2].replace(",", ".")) }),
  },
  {
    // "moins de 400", "sous les 400", "max 400", "-de 400", "en dessous de 400"
    regex: new RegExp(
      `(?:moins de|sous(?: les)?|max(?:imum)?|en dessous de)\\s+${NUMBER}\\s*${CURRENCY}`,
      "i"
    ),
    extract: (m) => ({ priceMax: parseFloat(m[1].replace(",", ".")) }),
  },
  {
    // "plus de 500", "min 500", "à partir de 500"
    regex: new RegExp(`(?:plus de|min(?:imum)?|à partir de)\\s+${NUMBER}\\s*${CURRENCY}`, "i"),
    extract: (m) => ({ priceMin: parseFloat(m[1].replace(",", ".")) }),
  },
];

export function parseNaturalLanguageSearch(input: string): ParsedSearchQuery {
  const trimmed = input.trim();
  if (!trimmed) return { query: "" };

  for (const pattern of PATTERNS) {
    const match = trimmed.match(pattern.regex);
    if (match) {
      const constraints = pattern.extract(match);
      const cleanedQuery = trimmed.replace(match[0], "").trim().replace(/\s{2,}/g, " ");
      return { query: cleanedQuery, ...constraints };
    }
  }

  return { query: trimmed };
}
