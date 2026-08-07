import { DogEventType, DogPurchaseCategory } from "../../constants";

export interface HexPair {
  light: string;
  dark: string;
}

// Fixed categorical hue order from the app's validated palette (blue, green,
// magenta, yellow, aqua, orange, violet, red) — never reorder or cycle; each
// category keeps its assigned slot for life.
export const PURCHASE_CATEGORY_COLORS: Record<DogPurchaseCategory, HexPair> = {
  [DogPurchaseCategory.Veterinarian]: { light: "#2a78d6", dark: "#3987e5" },
  [DogPurchaseCategory.Food]: { light: "#008300", dark: "#008300" },
  [DogPurchaseCategory.Lodging]: { light: "#e87ba4", dark: "#d55181" },
  [DogPurchaseCategory.Flea]: { light: "#eda100", dark: "#c98500" },
  [DogPurchaseCategory.Fun]: { light: "#1baf7a", dark: "#199e70" },
  [DogPurchaseCategory.Hygiene]: { light: "#eb6834", dark: "#d95926" },
  [DogPurchaseCategory.Health]: { light: "#4a3aa7", dark: "#9085e9" },
};

export const EVENT_TYPE_COLORS: Record<DogEventType, HexPair> = {
  [DogEventType.Weight]: { light: "#2a78d6", dark: "#3987e5" },
  [DogEventType.Medicine]: { light: "#008300", dark: "#008300" },
  [DogEventType.Hygiene]: { light: "#e87ba4", dark: "#d55181" },
  [DogEventType.Other]: { light: "#eda100", dark: "#c98500" },
};
