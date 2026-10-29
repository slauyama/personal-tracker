import { Routes, Route } from "react-router-dom";
import { TabDef } from "@slauyama/ui";
import {
  useCarServices,
  useGasFillUps,
  useInsurancePayments,
} from "../hooks/useCarLogs";
import CarOverviewView from "../components/car/CarOverviewView";
import CarServicesView from "../components/car/CarServicesView";
import CarGasView from "../components/car/CarGasView";
import CarInsuranceView from "../components/car/CarInsuranceView";
import RouteTabs from "../components/ui/RouteTabs";

const CAR_TABS: TabDef[] = [
  { label: "Overview", value: "/car", icon: "analytics" },
  { label: "Repair", value: "/car/repair", icon: "build" },
  { label: "Gas", value: "/car/gas", icon: "local_gas_station" },
  { label: "Insurance", value: "/car/insurance", icon: "shield" },
];

export default function CarPage() {
  const services = useCarServices();
  const gas = useGasFillUps();
  const insurance = useInsurancePayments();

  return (
    <div>
      <RouteTabs tabs={CAR_TABS} className="mb-6" />
      <Routes>
        <Route
          index
          element={
            <CarOverviewView
              services={services.items}
              fillUps={gas.items}
              payments={insurance.items}
              loading={services.loading || gas.loading || insurance.loading}
            />
          }
        />
        <Route path="repair" element={<CarServicesView collection={services} />} />
        <Route path="gas" element={<CarGasView collection={gas} />} />
        <Route path="insurance" element={<CarInsuranceView collection={insurance} />} />
      </Routes>
    </div>
  );
}
