import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getEnv } from "./firebase_helpers";

// One-off import of the historical dog spreadsheet into Firestore.
// Safe to review, NOT safe to run twice — running it again will duplicate every row.

interface RawRow {
  date: string; // M/D/YYYY, as written in the sheet
  type: string;
  notes: string;
  vendor?: string;
  location?: string;
  cost?: number;
}

// Rows with a blank Notes field in the original sheet are excluded entirely
// (per instruction: ignore any row with nothing in Notes), as are the ~150
// trailing blank rows at the end of the sheet.
const ROWS: RawRow[] = [
  { date: "8/15/2014", type: "Veternarian", notes: "Panacur Granules", vendor: "Pismo Beach Veterinary Clinic", location: "Pismo Beach", cost: 23.0 },
  { date: "8/15/2014", type: "Weight", notes: "12.2 lbs" },
  { date: "6/28/2016", type: "Food", notes: "Blue Buffalo Chicken & Brown Rice Food 30lb", vendor: "Chewy", cost: 35.73 },
  { date: "8/8/2016", type: "Food", notes: "Blue Buffalo Chicken & Brown Rice Food 30lb", vendor: "Chewy", cost: 48.64 },
  { date: "11/27/2017", type: "Veternarian", notes: "Physical Exam", vendor: "VCA Bascom Animal Hospital", location: "Campbell", cost: 71.0 },
  { date: "11/27/2017", type: "Veternarian", notes: "Metronidazole (gen) 250mg tab", vendor: "VCA Bascom Animal Hospital", location: "Campbell", cost: 29.2 },
  { date: "11/27/2017", type: "Veternarian", notes: "Fecal Test +Giardia", vendor: "VCA Bascom Animal Hospital", location: "Campbell", cost: 78.95 },
  { date: "11/27/2017", type: "Veternarian", notes: "PD i/d K9 13oz Can", vendor: "VCA Bascom Animal Hospital", location: "Campbell", cost: 3.66 },
  { date: "9/26/2018", type: "Weight", notes: "27 lbs" },
  { date: "5/1/2019", type: "Lodging", notes: "3 Nights", vendor: "Wag Hotel", location: "Santa Clara", cost: 165.0 },
  { date: "12/27/2019", type: "Weight", notes: "26.4 lbs" },
  { date: "6/7/2020", type: "Veternarian", notes: "Fecal Examination", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 72.47 },
  { date: "6/7/2020", type: "Veternarian", notes: "Pro Pectalin Anti Diarrheal Gel", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 23.32 },
  { date: "6/7/2020", type: "Veternarian", notes: "Blood Collection & Preparation", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 15.0 },
  { date: "6/7/2020", type: "Veternarian", notes: "IDX Total Health Profile", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 185.0 },
  { date: "6/7/2020", type: "Veternarian", notes: "Physical Exam", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 40.0 },
  { date: "6/7/2020", type: "Weight", notes: "24.6 lbs" },
  { date: "3/3/2021", type: "Veternarian", notes: "Heartworm", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 49.0 },
  { date: "3/3/2021", type: "Veternarian", notes: "Deworming Pyrantell", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 20.0 },
  { date: "3/3/2021", type: "Veternarian", notes: "Bordetella Vaccine", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 24.0 },
  { date: "3/3/2021", type: "Veternarian", notes: "Canine DA2PP", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 24.0 },
  { date: "3/3/2021", type: "Veternarian", notes: "Physical Exam", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 40.0 },
  { date: "3/3/2021", type: "Weight", notes: "26 lbs" },
  { date: "3/4/2021", type: "Veternarian", notes: "Blood Collection & Preparation", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 15.0 },
  { date: "3/4/2021", type: "Veternarian", notes: "Pre Op Wellness Panel", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 120.0 },
  { date: "3/4/2021", type: "Veternarian", notes: "Ear Flushing Cleaning", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 53.0 },
  { date: "3/4/2021", type: "Veternarian", notes: "IV Catheter and Fluids", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 52.0 },
  { date: "3/4/2021", type: "Veternarian", notes: "Dental Cleaning Package", vendor: "Alpha Animal Hospital", location: "Campbell", cost: 270.0 },
  { date: "3/4/2021", type: "Weight", notes: "26 lbs" },
  { date: "3/13/2024", type: "Veternarian", notes: "Comprehensive Physical Exam", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 325.0 },
  { date: "3/13/2024", type: "Veternarian", notes: "Cystocentesis w/ ultrasound", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 48.05 },
  { date: "3/13/2024", type: "Veternarian", notes: "Diphenhydramine 50mg/ml", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 53.26 },
  { date: "3/13/2024", type: "Veternarian", notes: "Medical Waste Fee", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 9.99 },
  { date: "3/13/2024", type: "Veternarian", notes: "Cytology w/ Microscopic Description", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 481.92 },
  { date: "3/13/2024", type: "Veternarian", notes: "Bordetella/Parainfluenza", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 57.05 },
  { date: "12/12/2025", type: "Veternarian", notes: "Physical Exam", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 91.0 },
  { date: "12/12/2025", type: "Veternarian", notes: "Rabies 3 year", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 52.7 },
  { date: "12/12/2025", type: "Veternarian", notes: "Bordetella / Parainfluenza", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 62.57 },
  { date: "12/12/2025", type: "Veternarian", notes: "DHPP 3 year", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 58.73 },
  { date: "12/12/2025", type: "Veternarian", notes: "Medical Waste Fee", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 9.99 },
  { date: "12/12/2025", type: "Veternarian", notes: "Cefpodoxime 100mg 15qty (Bump on Paw)", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 78.75 },
  { date: "12/26/2025", type: "Flea", notes: "Applied ZoGuard plus Topical Flea Med" },
  { date: "12/26/2025", type: "Flea", notes: "Capstar 6 pack", vendor: "Pet Food Express", location: "Campbell", cost: 64.15 },
  { date: "12/26/2025", type: "Fun", notes: "4 Frozen Duck Heart", vendor: "Pet Food Express", location: "Campbell", cost: 4.47 },
  { date: "12/26/2025", type: "Flea", notes: "Adams Carpet Powder Fleas", vendor: "Pet Food Express", location: "Campbell", cost: 12.99 },
  { date: "12/26/2025", type: "Flea", notes: "Applied Capstar" },
  { date: "12/27/2025", type: "Weight", notes: "26.8 lbs" },
  { date: "12/27/2025", type: "Hygiene", notes: "Bath", vendor: "Pet Food Express", location: "Campbell", cost: 18.0 },
  { date: "12/28/2025", type: "Flea", notes: "Applied Capstar" },
  { date: "12/29/2025", type: "Flea", notes: "Applied Capstar" },
  { date: "12/31/2025", type: "Flea", notes: "Applied Capstar" },
  { date: "1/1/2026", type: "Flea", notes: "Applied Capstar" },
  { date: "1/3/2026", type: "Flea", notes: "Applied Capstar" }, // sheet said 1/3/2029 — confirmed typo, corrected to 2026
  { date: "1/5/2026", type: "Flea", notes: "Applied Credelio" },
  { date: "1/5/2026", type: "Flea", notes: "Credelio 6month", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 144.0 },
  { date: "1/7/2026", type: "Flea", notes: "Applied ZoGuard plus Topical Flea Med" },
  { date: "2/10/2026", type: "Flea", notes: "Applied Credelio" },
  { date: "2/15/2026", type: "Hygiene", notes: "Bath", vendor: "Pet Food Express", location: "Willow Glen" },
  { date: "2/15/2026", type: "Food", notes: "5 duck heart", vendor: "Pet Food Express", location: "Willow Glen", cost: 6.55 },
  { date: "3/15/2026", type: "Flea", notes: "Applied Credelio" },
  { date: "3/21/2026", type: "Hygiene", notes: "Bath", vendor: "Pet Food Express" },
  { date: "4/1/2026", type: "Weight", notes: "27.4 lbs" },
  { date: "4/15/2026", type: "Hygiene", notes: "Bath", vendor: "Pet Food Express" },
  { date: "8/7/2026", type: "Food", notes: "4 dog food and bully stick", vendor: "Pet Food Express", cost: 299.96 },
  { date: "5/27/2026", type: "Hygiene", notes: "Bath" },
  { date: "6/17/2026", type: "Health", notes: "Carprofen 25 mg (pain reliever) neopoly bac ointment (eye)", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 524.09 },
  { date: "6/25/2026", type: "Health", notes: "Doctor Visit (follow up for eye)", vendor: "Willow Glen Pet Hospital", location: "Willow Glen", cost: 89.99 },
  { date: "7/2/2026", type: "Flea", notes: "Applied Capstar" },
  { date: "8/1/2026", type: "Hygiene", notes: "Bath", vendor: "Pet Food Express" },
  { date: "8/4/2026", type: "Health", notes: "Cefpodoxime 100mg 100 (Bump on Paw)", cost: 49.58 },
];

function toIsoDate(sheetDate: string): string {
  const [m, d, y] = sheetDate.split("/").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function toCreatedAt(isoDate: string): string {
  return Timestamp.fromDate(new Date(`${isoDate}T00:00:00`)).toDate().toISOString();
}

const EVENT_CATEGORY_TYPES = new Set(["Weight"]);

interface PreparedEvent {
  date: string;
  type: string;
  notes: string;
  weightLbs: number | null;
  createdAt: string;
}

interface PreparedPurchase {
  date: string;
  category: string;
  name: string;
  notes: string;
  vendor: string;
  location: string;
  price: number | null;
  createdAt: string;
}

function classify(row: RawRow): {
  event: PreparedEvent | null;
  purchase: PreparedPurchase | null;
} {
  const date = toIsoDate(row.date);
  const createdAt = toCreatedAt(date);

  if (EVENT_CATEGORY_TYPES.has(row.type)) {
    const weightLbs = parseFloat(row.notes);
    return {
      event: {
        date,
        type: "Weight",
        notes: "",
        weightLbs: isNaN(weightLbs) ? null : weightLbs,
        createdAt,
      },
      purchase: null,
    };
  }

  if (row.type === "Flea" && row.notes.startsWith("Applied ") && row.cost == null) {
    return {
      event: { date, type: "Medicine", notes: row.notes, weightLbs: null, createdAt },
      purchase: null,
    };
  }

  if (row.type === "Hygiene") {
    return {
      event: { date, type: "Hygiene", notes: row.notes, weightLbs: null, createdAt },
      purchase:
        row.cost != null
          ? {
              date,
              category: "Hygiene",
              name: row.notes,
              notes: "",
              vendor: row.vendor ?? "",
              location: row.location ?? "",
              price: row.cost,
              createdAt,
            }
          : null,
    };
  }

  // Veternarian is a spelling fix on write, not on read — the sheet only ever
  // uses the misspelling.
  const category = row.type === "Veternarian" ? "Veterinarian" : row.type;

  return {
    event: null,
    purchase: {
      date,
      category,
      name: row.notes,
      notes: "",
      vendor: row.vendor ?? "",
      location: row.location ?? "",
      price: row.cost ?? null,
      createdAt,
    },
  };
}

async function main() {
  const prodApp = initializeApp({
    credential: cert(
      JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
    ),
  });
  const db = getFirestore(prodApp);

  const events: PreparedEvent[] = [];
  const purchases: PreparedPurchase[] = [];

  for (const row of ROWS) {
    const { event, purchase } = classify(row);
    if (event) events.push(event);
    if (purchase) purchases.push(purchase);
  }

  console.log(`Importing ${events.length} events and ${purchases.length} purchases...`);

  const batch = db.batch();
  for (const event of events) {
    batch.set(db.collection("dogEvents").doc(), event);
  }
  for (const purchase of purchases) {
    batch.set(db.collection("dogPurchases").doc(), purchase);
  }
  await batch.commit();

  console.log("Import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
