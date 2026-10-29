import { useFirebaseCollection } from "./useFirebaseCollection";

export interface CarService {
  id: string;
  date: string;
  mileage: number | null;
  activity: string;
  vendor: string;
  location: string;
  cost: number | null;
  notes: string;
  createdAt: string;
}

export type CarServiceInput = Omit<CarService, "id" | "createdAt">;

export interface GasFillUp {
  id: string;
  date: string;
  odometer: number | null;
  location: string;
  pricePerGallon: number | null;
  cost: number | null;
  // Trip meter reading at fill-up, not an odometer delta — fill-ups can be
  // skipped in the log, so consecutive odometer readings over-count.
  tripMiles: number | null;
  premium: boolean;
  notes: string;
  createdAt: string;
}

export type GasFillUpInput = Omit<GasFillUp, "id" | "createdAt">;

export interface InsurancePayment {
  id: string;
  date: string;
  cost: number | null;
  notes: string;
  createdAt: string;
}

export type InsurancePaymentInput = Omit<InsurancePayment, "id" | "createdAt">;

export function useCarServices() {
  return useFirebaseCollection<CarService>("carServices");
}

export function useGasFillUps() {
  return useFirebaseCollection<GasFillUp>("carGas");
}

export function useInsurancePayments() {
  return useFirebaseCollection<InsurancePayment>("carInsurance");
}
