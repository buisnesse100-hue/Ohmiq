import { describe, it, expect } from "vitest";
import { signUpSchema, signInSchema } from "@/lib/validations/auth";

describe("signUpSchema", () => {
  const valid = {
    email: "marie@example.com",
    password: "password123",
    confirmPassword: "password123",
    displayName: "Marie D.",
    username: "marie.d",
    acceptTerms: true as const,
  };

  it("accepte une inscription valide", () => {
    expect(signUpSchema.safeParse(valid).success).toBe(true);
  });

  it("refuse si les mots de passe ne correspondent pas", () => {
    const result = signUpSchema.safeParse({ ...valid, confirmPassword: "autrechose" });
    expect(result.success).toBe(false);
  });

  it("refuse un nom d'utilisateur avec des caractères invalides", () => {
    const result = signUpSchema.safeParse({ ...valid, username: "Marie D!" });
    expect(result.success).toBe(false);
  });

  it("refuse un mot de passe trop court", () => {
    const result = signUpSchema.safeParse({ ...valid, password: "abc", confirmPassword: "abc" });
    expect(result.success).toBe(false);
  });

  it("refuse si les conditions ne sont pas acceptées", () => {
    const result = signUpSchema.safeParse({ ...valid, acceptTerms: false });
    expect(result.success).toBe(false);
  });
});

describe("signInSchema", () => {
  it("refuse un email invalide", () => {
    const result = signInSchema.safeParse({ email: "pas-un-email", password: "x" });
    expect(result.success).toBe(false);
  });

  it("accepte des identifiants valides", () => {
    const result = signInSchema.safeParse({ email: "a@b.com", password: "x" });
    expect(result.success).toBe(true);
  });
});
