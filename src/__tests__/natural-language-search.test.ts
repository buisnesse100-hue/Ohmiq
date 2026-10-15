import { describe, it, expect } from "vitest";
import { parseNaturalLanguageSearch } from "@/lib/search/natural-language";

describe("parseNaturalLanguageSearch", () => {
  it("extrait un prix maximum avec 'moins de'", () => {
    const result = parseNaturalLanguageSearch("RTX 4070 moins de 400 €");
    expect(result.query).toBe("RTX 4070");
    expect(result.priceMax).toBe(400);
    expect(result.priceMin).toBeUndefined();
  });

  it("extrait un prix maximum avec 'sous les' et 'euros'", () => {
    const result = parseNaturalLanguageSearch("iPhone 13 sous les 300 euros");
    expect(result.query).toBe("iPhone 13");
    expect(result.priceMax).toBe(300);
  });

  it("extrait un prix maximum avec 'max'", () => {
    const result = parseNaturalLanguageSearch("PS5 max 350€");
    expect(result.query).toBe("PS5");
    expect(result.priceMax).toBe(350);
  });

  it("extrait un prix minimum avec 'plus de'", () => {
    const result = parseNaturalLanguageSearch("vélo électrique plus de 500€");
    expect(result.query).toBe("vélo électrique");
    expect(result.priceMin).toBe(500);
  });

  it("extrait une fourchette avec 'entre X et Y'", () => {
    const result = parseNaturalLanguageSearch("casque entre 50 et 100 €");
    expect(result.query).toBe("casque");
    expect(result.priceMin).toBe(50);
    expect(result.priceMax).toBe(100);
  });

  it("retourne la requête telle quelle sans contrainte de prix", () => {
    const result = parseNaturalLanguageSearch("MacBook Pro M3");
    expect(result.query).toBe("MacBook Pro M3");
    expect(result.priceMin).toBeUndefined();
    expect(result.priceMax).toBeUndefined();
  });

  it("gère une chaîne vide", () => {
    const result = parseNaturalLanguageSearch("   ");
    expect(result.query).toBe("");
  });
});
