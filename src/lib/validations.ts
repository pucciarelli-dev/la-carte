import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(6, "Password minimo 6 caratteri"),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  nameEn: z.string().default(""),
  visible: z.boolean().default(true),
  order: z.number().int().default(0),
  wineSortByPrice: z.boolean().default(false),
  backgroundColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Colore non valido")
    .nullable()
    .optional(),
  textColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Colore non valido")
    .nullable()
    .optional(),
  footerImageUrl: z.string().min(1).nullable().optional(),
});

export const menuItemSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  nameEn: z.string().default(""),
  description: z.string().default(""),
  descriptionEn: z.string().default(""),
  price: z.coerce.number().min(0, "Prezzo non valido"),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
  isVegetarian: z.boolean().default(false),
  isVegan: z.boolean().default(false),
  isGlutenFree: z.boolean().default(false),
  isSpicy: z.boolean().default(false),
  allergens: z
    .array(z.string().regex(/^([1-9]|1[0-4])$/, "Allergene non valido"))
    .default([]),
});

export const wineItemSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  nameEn: z.string().default(""),
  producer: z.string().default(""),
  vintage: z.string().nullable().optional(),
  region: z.string().default(""),
  regionEn: z.string().default(""),
  subcategory: z.string().default(""),
  subcategoryEn: z.string().default(""),
  description: z.string().default(""),
  descriptionEn: z.string().default(""),
  glassPrice: z.coerce.number().min(0).nullable().optional(),
  bottlePrice: z.coerce.number().min(0).nullable().optional(),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const drinkItemSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  nameEn: z.string().default(""),
  ingredients: z.string().default(""),
  ingredientsEn: z.string().default(""),
  description: z.string().default(""),
  descriptionEn: z.string().default(""),
  price: z.coerce.number().min(0, "Prezzo non valido"),
  order: z.number().int().default(0),
  visible: z.boolean().default(true),
});

export const reorderSchema = z.object({
  items: z.array(
    z.object({
      id: z.string(),
      order: z.number().int(),
    })
  ),
});

export const menuAllergenEntrySchema = z.object({
  num: z.number().int().min(1).max(14),
  it: z.string().min(1),
  en: z.string().min(1),
  enabled: z.boolean(),
});

export const menuAllergenLegendSchema = z.array(menuAllergenEntrySchema).length(14);

export const createMenuSchema = z.object({
  name: z.string().min(1, "Nome obbligatorio").max(80),
  slug: z
    .string()
    .min(2, "Slug troppo corto")
    .max(48, "Slug troppo lungo")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Usa solo lettere minuscole, numeri e trattini"
    ),
  type: z.enum(["DINNER", "WINE", "DRINK"]).default("DINNER"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type MenuItemInput = z.infer<typeof menuItemSchema>;
export type WineItemInput = z.infer<typeof wineItemSchema>;
export type DrinkItemInput = z.infer<typeof drinkItemSchema>;
export type CreateMenuInput = z.infer<typeof createMenuSchema>;
