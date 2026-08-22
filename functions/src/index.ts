import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";

initializeApp();
const db = getFirestore();

const serpapiKey = defineSecret("SERPAPI_KEY");

interface SearchPricesRequest {
  productId: string;
  brand: string;
  name: string;
  shade: string;
  size: string;
}

interface PriceResult {
  retailer: string;
  price: number;
  url: string;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const searchProductPrices = onCall(
  { secrets: [serpapiKey] },
  async (request): Promise<PriceResult[]> => {
    const { productId, brand, name, shade, size } =
      request.data as SearchPricesRequest;

    if (!productId || !brand || !name) {
      throw new HttpsError(
        "invalid-argument",
        "productId, brand, and name are required",
      );
    }

    const apiKey = serpapiKey.value();
    const query = [brand, name, shade, size].filter(Boolean).join(" ");

    const shoppingUrl = new URL("https://serpapi.com/search.json");
    shoppingUrl.searchParams.set("engine", "google_shopping_light");
    shoppingUrl.searchParams.set("q", query);
    shoppingUrl.searchParams.set("api_key", apiKey);

    const shoppingRes = await fetch(shoppingUrl);
    if (!shoppingRes.ok) {
      throw new HttpsError("unavailable", "SerpAPI shopping search failed");
    }
    const shoppingData = await shoppingRes.json();

    const topResult = shoppingData.shopping_results?.[0];
    const token = topResult?.immersive_product_page_token;
    if (!token) {
      return [];
    }

    const immersiveUrl = new URL("https://serpapi.com/search.json");
    immersiveUrl.searchParams.set("engine", "google_immersive_product");
    immersiveUrl.searchParams.set("page_token", token);
    immersiveUrl.searchParams.set("api_key", apiKey);

    const immersiveRes = await fetch(immersiveUrl);
    if (!immersiveRes.ok) {
      throw new HttpsError(
        "unavailable",
        "SerpAPI immersive product lookup failed",
      );
    }
    const immersiveData = await immersiveRes.json();

    const sellers = immersiveData.product_results?.stores ?? [];
    const results: PriceResult[] = sellers
      .map((seller: { name?: string; price?: string; link?: string }) => {
        const price = Number(String(seller.price).replace(/[^0-9.]/g, ""));
        return {
          retailer: seller.name ?? "",
          price,
          url: seller.link ?? "",
        };
      })
      .filter((r: PriceResult) => r.retailer && !Number.isNaN(r.price));

    const date = new Date().toISOString();
    const batch = db.batch();
    for (const result of results) {
      const docId = `${productId}_${slugify(result.retailer)}`;
      batch.set(db.collection("priceChecks").doc(docId), {
        productId,
        retailer: result.retailer,
        price: result.price,
        url: result.url,
        date,
      });
    }
    await batch.commit();

    return results;
  },
);
