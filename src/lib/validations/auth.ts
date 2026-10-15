import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z.string().trim().toLowerCase().email("Adresse email invalide."),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères.")
      .max(72, "Le mot de passe est trop long."),
    confirmPassword: z.string(),
    displayName: z
      .string()
      .trim()
      .min(2, "Le nom doit contenir au moins 2 caractères.")
      .max(50, "Le nom est trop long."),
    username: z
      .string()
      .trim()
      .toLowerCase()
      .min(3, "Le nom d'utilisateur doit contenir au moins 3 caractères.")
      .max(30, "Le nom d'utilisateur est trop long.")
      .regex(
        /^[a-z0-9_.-]+$/,
        "Uniquement lettres minuscules, chiffres, points, tirets et underscores."
      ),
    acceptTerms: z.literal(true, {
      message: "Tu dois accepter les conditions d'utilisation.",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type SignUpInput = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
  password: z.string().min(1, "Le mot de passe est requis."),
});

export type SignInInput = z.infer<typeof signInSchema>;

export const requestPasswordResetSchema = z.object({
  email: z.string().trim().toLowerCase().email("Adresse email invalide."),
});

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>;

export const updatePasswordSchema = z
  .object({
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["confirmPassword"],
  });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
