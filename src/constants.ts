// ─── Add or remove brands here ───────────────────────────────────────────────
export enum Brand {
  BenefitCosmetics = "Benefit Cosmetics",
  Biore = "Biore",
  CharlotteTilbury = "Charlotte Tilbury",
  EltaMD = "Elta MD",
  Farmacy = "Farmacy",
  Frownies = "Frownies",
  Hourglass = "Hourglass",
  Kiehls = "Kiehls",
  LauraMercier = "Laura Mercier",
  Neutrogena = "Neutrogena",
  NYX = "NYX",
  PatrickTA = "Patrick TA",
  PaulasChoice = "Paula's Choice",
  Sephora = "Sephora",
  Tarte = "Tarte",
  TheOrdinary = "The Ordinary",
  Other = "Other",
}

export const ALL_BRANDS = Object.values(Brand);

// ─── Add or remove categories here ───────────────────────────────────────────
export enum Category {
  MakeUp = "Make-Up",
  Skin = "Skin",
  Tools = "Tools",
  Other = "Other",
}

export const ALL_CATEGORIES = Object.values(Category);

export enum ProductStatus {
  Active = "active",
  Finished = "finished",
}
