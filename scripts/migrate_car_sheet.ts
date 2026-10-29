import { initializeApp, cert, type ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getEnv } from "./firebase_helpers";

// One-off import of the "Subaru Car Log" spreadsheet (Maintenance Log, Gas
// Log, AAA Insurance tabs) into Firestore.
// Safe to review, NOT safe to run twice — running it again will duplicate every row.

// [date M/D/YYYY, mileage, activity, vendor, location, cost]
type ServiceRow = [string, number | null, string, string, string, number | null];

// The trailing undated "Oil Change, Transmission Fluid — Jiffy Lube" row is
// excluded: it has no date, mileage, or cost yet.
const SERVICES: ServiceRow[] = [
  ["6/4/2016", 0, "Cargo Tray", "Carlson Subaru", "", 69.75],
  ["6/28/2016", null, "Registration", "CA DMV", "", 255.0],
  ["7/18/2016", 0, "First Bought Car", "Carlson Subaru", "Redwood City", null],
  ["11/8/2016", 5992, "Maintenance", "Steven's Creek Subaru", "", 0], // sheet said 11/8/2013 — mileage places it in 2016
  ["1/6/2017", 13028, "Maintenance (Oil Change)", "Steven's Creek Subaru", "", 0],
  ["2/13/2018", 23710, "Maintenance (Oil Change)", "Steven's Creek Subaru", "", 0],
  ["5/19/2018", null, "Registration", "CA DMV", "", 289.0],
  ["6/10/2018", 30271, "2 Tires", "Costco", "", 277.13],
  ["7/27/2018", 32399, "Oil Change", "Steven's Creek Subaru", "", 0],
  ["8/19/2018", 33988, "2 Tires", "Costco", "", 278.99],
  ["11/21/2018", 38565, "Rebalance and Rotation", "", "", null],
  ["12/27/2018", null, "Tire wheel nut hub bolt", "Steven's Creek Subaru", "", 109.76],
  ["12/27/2019", null, "Tire Rotation", "Costco", "", null],
  ["12/27/2019", null, "Battery", "Costco", "", 118.68],
  ["12/30/2019", 56904, "Recall", "Steven's Creek Subaru", "", 0],
  ["3/5/2020", 62554, "60k maintenance, brake fluid, oil", "Steven's Creek Subaru", "", 880.54],
  ["2/8/2021", null, "Glass Repair", "Glasswest Replacement", "", 0],
  ["3/29/2021", null, "Car Registration", "", "", 260.0],
  ["5/9/2021", 70067, "Oil Change and Lamp Replacement", "Jiffy Lube", "Campbell", 95.62],
  ["1/6/2022", 77393, "Oil Change", "Steven's Creek Subaru", "", 99.95],
  ["12/30/2022", null, "Glass Repair", "Safelite", "Mobile", 0],
  ["4/27/2023", null, "Car Registration", "", "", 246.0],
  ["5/6/2023", 92838, "Oil Change, Wiper Replaced", "Jiffy Lube", "San Jose", 159.53],
  ["3/30/2024", 103095, "4 Tires Replaced", "America's Tire", "Santa Clara", 804.23],
  ["5/5/2024", 104296, "Smog Test", "Winchester All Smog", "San Jose", 79.95],
  ["9/5/2024", null, "Scratches Pulled Out", "James Auto Repair", "Mobile", 600.0],
  ["2/12/2025", 114065, "Oil Change", "Jiffy Lube", "", 120.49],
  ["6/8/2025", null, "Car Registration", "CA DMV", "", 1800.0],
  ["8/10/2025", 120736, "Oil Change", "Jiffy Lube", "El Camino", 106.45],
  ["12/10/2025", 124111, "Air in Tires", "Costco", "San Jose", 0],
  ["12/13/2025", 124268, "120K Car Service", "Steven's Creek Subaru", "San Jose", 1033.38],
  ["1/11/2026", 125164, "Battery", "Costco", "San Jose", 139.02],
  ["4/1/2026", 128145, "Air in Tires", "Costco", "San Jose", 0],
  ["5/6/2026", 129559, "Oil Change", "Jiffy Lube", "San Jose", 106.94],
  ["5/6/2026", null, "Smog Test", "Winchester All Smog", "San Jose", 79.95],
  ["8/10/2026", 133240, "Air in Tires", "Costco", "", null], // sheet said 8/1/1026 — mileage matches the 8/10/2026 gas fill-up
  ["10/21/2026", 137059, "Air in Tire", "Costco", "", null],
];

// [date, odometer, location, price/gal, cost, trip miles, premium, notes]
type GasRow = [string, number | null, string, number, number, number | null, boolean, string?];

const GAS: GasRow[] = [
  ["1/19/2025", 113000, "Sunnyvale", 3.799, 40.24, null, false],
  ["2/12/2025", 114083, "Costco - Coleman", 4.799, 46.3, null, true],
  ["3/13/2025", 114699, "Costco - Coleman", 4.299, 51.64, 334.1, false],
  ["3/23/2025", 115024, "Costco - Coleman", 4.249, 48.68, 324.8, false],
  ["3/27/2025", 115363, "", 4.249, 48.33, 339.7, false],
  ["4/7/2025", 115652, "Costco - Coleman", 4.799, 50.28, 288.9, false],
  ["4/15/2025", 115988, "Costco - Coleman", 4.499, 51.15, 335.1, false],
  ["4/22/2025", 116209, "Costco - Sunnyvale", 4.499, 39.97, 221.5, false],
  ["4/26/2025", 116484, "Costco - Coleman", 4.359, 38.78, 270.6, false],
  ["5/8/2025", 116762, "", 4.399, 43.63, 277.9, false],
  ["5/14/2025", 117004, "Costco - Coleman", 4.459, 41.25, 241.2, false],
  ["5/22/2025", 117350, "Costco - Coleman", 4.839, 55.3, 346, true],
  ["5/30/2025", 117636, "Costco - Berryessa", 4.399, 46.66, 286, false],
  ["6/5/2025", 117913, "Costco - Coleman", 4.699, 47.42, null, true],
  ["6/11/2025", 118246, "Costco - Coleman", 4.299, 48.85, 332.8, false],
  ["6/15/2025", 118556, "Costco - Coleman", 4.199, 45.31, 310.1, false],
  ["6/23/2025", 118918, "Costco - Coleman", 4.259, 49.75, 361.8, false],
  ["7/1/2025", 119238, "Costco - Coleman", 4.039, 44.17, 320.1, false],
  ["7/11/2025", 119557, "Costco - Coleman", 4.379, 46.68, 319.3, true],
  ["7/19/2025", 119883, "Costco - Newark", 3.999, 48.55, 325.1, false],
  ["7/26/2025", 120156, "Costco - Coleman", 3.879, 37.43, 273.1, false],
  ["8/2/2025", 120485, "Costco - Coleman", 4.399, 50.09, 328.9, true],
  ["8/10/2025", 120733, "Costco - Coleman", 3.999, 38.51, 248.1, false],
  ["8/19/2025", 121023, "Costco - Coleman", 3.999, 41.28, 290.1, false],
  ["8/28/2025", 121324, "Costco - Great Oaks", 4.199, 48.21, 300.3, false],
  ["9/11/2025", 121639, "Costco - Coleman", 4.039, 44.95, 315, false],
  ["9/21/2025", 121962, "Costco - Coleman", 4.039, 45.94, 323.1, false],
  ["9/30/2025", 122252, "Costco - Coleman", 3.999, 43.47, 289.8, false],
  ["10/8/2025", 122573, "Costco - Coleman", 4.099, 47.77, 320.8, false],
  ["10/16/2025", 122897, "Costco - San Bruno", 4.199, 51.46, 323.9, false],
  ["10/28/2025", 123242, "Costco - Coleman", 3.799, 43.84, 339.7, false],
  ["11/6/2025", 123502, "Costco - Coleman", 3.949, 38.97, 259.8, false],
  ["12/4/2025", 123827, "Costco - Coleman", 3.799, 46.64, 324.8, false],
  ["12/10/2025", 124111, "Costco - Coleman", 4.159, 45.03, 284, true],
  ["12/16/2025", 124412, "Costco - Coleman", 3.599, 40.24, 301, false, "Got 120k service"],
  ["12/22/2025", 124672, "Costco - Coleman", 3.499, 34.43, 259.6, false],
  ["1/5/2026", 124961, "Costco - Coleman", 3.449, 38.74, 289, false],
  ["1/14/2026", 125220, "Costco - Coleman", 3.459, 35.55, 259, false],
  ["1/25/2026", 125556, "Costco - Coleman", 3.599, 42.82, 336.2, false],
  ["2/8/2026", 125849, "Costco - Coleman", 3.949, 45.05, 293, false],
  ["2/19/2026", 126134, "Costco - Coleman", 4.059, 45.59, 285.1, false],
  ["2/25/2026", 126418, "Costco - Coleman", 4.099, 44.08, 284, false],
  ["3/8/2026", 126732, "Costco - Coleman", 4.559, 53.69, 313.9, false],
  ["3/19/2026", 127067, "Costco - Coleman", 5.159, 60.54, 335.4, false],
  ["4/1/2026", 128145, "Costco - Coleman", 5.259, 60.74, null, false],
  ["4/15/2026", 129075, "Costco - Coleman", 5.199, 58.46, null, false],
  ["5/2/2026", 129417, "Costco - Coleman", 5.499, 61.29, 342, false],
  ["5/10/2026", 129716, "Costco - Coleman", 5.559, 58.6, 299, false],
  ["5/21/2026", 130000, "Costco - Coleman", 5.599, 57.88, 284.5, false], // sheet said 13000 — dropped a zero
  ["6/3/2026", 130397, "Costco - Coleman", 5.259, 54.92, null, false],
  ["6/9/2026", 130704, "Costco - Coleman", 5.259, 55.5, 306.8, false],
  ["6/20/2026", null, "Costco - Coleman", 4.999, 56.67, 308.2, false],
  ["6/26/2026", 131375, "Costco - Coleman", 4.859, 46.42, null, false],
  ["7/3/2026", 131713, "Costco - Auto Mall", 4.779, 54.42, 338, false],
  ["7/11/2026", 131989, "Costco - Brokaw", 5.099, 55.45, 275.5, false],
  ["7/16/2026", 132325, "Costco - Coleman", 4.999, 55.08, 336, false],
  ["7/24/2026", 132597, "Costco - Coleman", 5.099, 52.78, 272.5, false],
  ["7/31/2026", 132929, "Costco - Coleman", 4.999, 56.35, 332.1, false],
  ["8/10/2026", 133240, "Costco - Coleman", 4.799, 55.34, 310.6, false],
  ["8/19/2026", 133527, "Costco - Coleman", 4.999, 56.0, 287.1, false],
  ["9/3/2026", 133854, "Costco - Coleman", 5.559, 69.0, 326.6, true],
  ["9/5/2026", 134102, "Costco - SLO", 5.799, 47.41, 248.3, false],
  ["9/10/2026", 134357, "Costco - Coleman", 5.499, 50.31, 255, false],
  ["9/21/2026", 134630, "Costco - Coleman", 5.699, 58.75, 273.1, false],
  ["9/28/2026", 134998, "Costco - Coleman", 5.859, 73.79, 368.3, false],
  ["10/3/2026", 135331, "Shell - San Francisco", 6.559, 81.47, 332.5, false],
  ["10/4/2026", 135575, "Vons Express", 6.199, 50.75, 243.9, false],
  ["10/13/2026", null, "Costco - Coleman", 5.639, 70.78, null, false],
  ["10/21/2026", 136475, "Costco - Coleman", 5.559, 57.71, 267.6, false],
];

// [date, cost]
const INSURANCE: Array<[string, number]> = [
  ["10/17/2016", 227.0],
  ["11/27/2018", 1564.76],
  ["2/13/2020", 987.68],
  ["11/15/2020", 1100.76],
  ["4/27/2021", 356.15],
  ["11/4/2021", 1138.76],
  ["12/9/2021", 99.51],
  ["1/9/2022", 97.75],
  ["2/9/2022", 97.75],
  ["3/9/2022", 97.75],
  ["4/9/2022", 97.75],
  ["5/9/2022", 97.75],
  ["6/9/2022", 97.75],
  ["8/9/2022", 97.75],
  ["9/9/2022", 97.75],
  ["10/9/2022", 97.75],
  ["11/7/2022", 1570.51],
  ["11/9/2023", 140.9],
  ["12/9/2023", 218.52],
  ["1/9/2024", 215.0],
  ["2/9/2024", 215.0],
  ["3/9/2024", 215.0],
  ["4/9/2024", 215.0],
  ["5/9/2024", 215.0],
  ["6/9/2024", 215.0],
  ["7/9/2024", 215.0], // sheet said 7/9/2022 — sits in the 2024 monthly run
  ["8/9/2024", 215.0], // sheet said 8/9/2022 — sits in the 2024 monthly run
  ["9/9/2024", 215.0],
  ["9/10/2024", 424.0],
];

function toIsoDate(sheetDate: string): string {
  const [m, d, y] = sheetDate.split("/").map(Number);
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function toCreatedAt(isoDate: string): string {
  return new Date(`${isoDate}T00:00:00`).toISOString();
}

async function main() {
  const prodApp = initializeApp({
    credential: cert(
      JSON.parse(getEnv("FIREBASE_PROD_SERVICE_ACCOUNT")) as ServiceAccount,
    ),
  });
  const db = getFirestore(prodApp);
  const batch = db.batch();

  for (const [sheetDate, mileage, activity, vendor, location, cost] of SERVICES) {
    const date = toIsoDate(sheetDate);
    batch.set(db.collection("carServices").doc(), {
      date,
      mileage,
      activity,
      vendor,
      location,
      cost,
      notes: "",
      createdAt: toCreatedAt(date),
    });
  }

  for (const [sheetDate, odometer, location, pricePerGallon, cost, tripMiles, premium, notes] of GAS) {
    const date = toIsoDate(sheetDate);
    batch.set(db.collection("carGas").doc(), {
      date,
      odometer,
      location,
      pricePerGallon,
      cost,
      tripMiles,
      premium,
      notes: notes ?? "",
      createdAt: toCreatedAt(date),
    });
  }

  for (const [sheetDate, cost] of INSURANCE) {
    const date = toIsoDate(sheetDate);
    batch.set(db.collection("carInsurance").doc(), {
      date,
      cost,
      notes: "AAA",
      createdAt: toCreatedAt(date),
    });
  }

  console.log(
    `Importing ${SERVICES.length} services, ${GAS.length} fill-ups, and ${INSURANCE.length} insurance payments...`,
  );
  await batch.commit();
  console.log("Import complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
