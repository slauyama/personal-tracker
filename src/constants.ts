// ─── Add or remove brands here ───────────────────────────────────────────────
export enum Brand {
  bareMinerals = " bareMinerals",
  BenefitCosmetics = "Benefit Cosmetics",
  CharlotteTilbury = "Charlotte Tilbury",
  ColourPop = "ColourPop",
  CoverGirl = "CoverGirl",
  Dior = "Dior",
  ELFCosmetics = "e.l.f. Cosmetics",
  EstéeLauder = "Estée Lauder",
  Glossier = "Glossier",
  HudaBeauty = "Huda Beauty",
  Hourglass = "Hourglass",
  Kiehls = "Kiehls",
  LOreal = "L'Oréal",
  LauraMercier = "Laura Mercier",
  MACCosmetics = "MAC Cosmetics",
  Maybelline = "Maybelline",
  MilkMakeup = "Milk Makeup",
  Neutrogena = "Neutrogena",
  NYX = "NYX",
  PatrickTA = "Patrick TA",
  RareBeauty = "Rare Beauty",
  Tarte = "Tarte",
  UrbanDecay = "Urban Decay",
  YSL = "YSL",
}

export const ALL_BRANDS = Object.values(Brand);

// ─── Add or remove categories here ───────────────────────────────────────────
export enum Category {
  Blush = "Blush",
  Bronzer = "Bronzer",
  Concealer = "Concealer",
  EyebrowPencil = "Eyebrow Pencil",
  Eyeliner = "Eyeliner",
  Eyeshadow = "Eyeshadow",
  Foundation = "Foundation",
  Highlighter = "Highlighter",
  LipBalm = "Lip Balm",
  LipGloss = "Lip Gloss",
  LipLiner = "Lip Liner",
  Lipstick = "Lipstick",
  Mascara = "Mascara",
  Primer = "Primer",
  SettingPowder = "Setting Powder",
  SettingSpray = "Setting Spray",
  Skincare = "Skincare",
  SunScreen = "Sun Screen",
  Other = "Other",
}

export const ALL_CATEGORIES = Object.values(Category);

export enum ProductStatus {
  Active = "active",
  Finished = "finished",
}

// Eye, Lip, Face, Setting, Skincare, Other — shared colours within each group
const EYE = "bg-purple-100 text-purple-700";
const LIP = "bg-rose-100 text-rose-600";
const FACE = "bg-amber-100 text-amber-700";
const SETTING = "bg-blue-100 text-blue-700";
const SKINCARE = "bg-teal-100 text-teal-700";
const OTHER = "bg-slate-100 text-slate-600";

export const CATEGORY_COLORS: Record<Category, string> = {
  // Eye
  Eyeshadow: EYE,
  Eyeliner: EYE,
  "Eyebrow Pencil": EYE,
  Mascara: EYE,
  // Lip
  Lipstick: LIP,
  "Lip Gloss": LIP,
  "Lip Liner": LIP,
  "Lip Balm": LIP,
  // Face
  Foundation: FACE,
  Concealer: FACE,
  Blush: FACE,
  Bronzer: FACE,
  Highlighter: FACE,
  Primer: FACE,
  // Setting
  "Setting Spray": SETTING,
  "Setting Powder": SETTING,
  // Skincare
  Skincare: SKINCARE,
  "Sun Screen": SKINCARE,
  // Other
  Other: OTHER,
};
