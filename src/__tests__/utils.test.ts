import { describe, it, expect } from "vitest";
import { formatPrice, buildTelLink, buildWhatsappLink, buildMailtoLink, toInternationalPhone, truncate } from "@/lib/utils";

describe("formatPrice", () => {
  it("affiche 'Gratuit' pour un prix à 0", () => {
    expect(formatPrice(0)).toBe("Gratuit");
  });

  it("formate un prix entier sans décimales", () => {
    expect(formatPrice(250)).toContain("250");
    expect(formatPrice(250)).not.toContain(",00");
  });

  it("formate un prix décimal avec 2 décimales", () => {
    expect(formatPrice(19.9)).toContain("19,90");
  });
});

describe("toInternationalPhone", () => {
  it("convertit un numéro français en format international", () => {
    expect(toInternationalPhone("0600000000")).toBe("+33600000000");
  });

  it("laisse un numéro déjà international inchangé", () => {
    expect(toInternationalPhone("+33600000000")).toBe("+33600000000");
  });
});

describe("liens de contact", () => {
  it("construit un lien tel: valide", () => {
    expect(buildTelLink("0600000000")).toBe("tel:+33600000000");
  });

  it("construit un lien wa.me valide sans le +", () => {
    const link = buildWhatsappLink("0600000000");
    expect(link).toBe("https://wa.me/33600000000");
  });

  it("construit un lien wa.me avec message encodé", () => {
    const link = buildWhatsappLink("0600000000", "Bonjour !");
    expect(link).toContain("text=Bonjour");
  });

  it("construit un lien mailto: avec sujet", () => {
    const link = buildMailtoLink("test@example.com", "Sujet");
    expect(link).toContain("mailto:test@example.com");
    expect(link).toContain("subject=Sujet");
  });
});

describe("truncate", () => {
  it("ne modifie pas un texte plus court que la limite", () => {
    expect(truncate("Bonjour", 20)).toBe("Bonjour");
  });

  it("tronque et ajoute une ellipse si trop long", () => {
    expect(truncate("Bonjour tout le monde", 10)).toHaveLength(10);
  });
});
