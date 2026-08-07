import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { Button, Heading } from "@slauyama/ui";
import { useDogEvents } from "../hooks/useDogEvents";
import { useDogPurchases } from "../hooks/useDogPurchases";
import DogEventsView from "../components/dog/DogEventsView";
import DogPurchasesView from "../components/dog/DogPurchasesView";

export default function DogPage() {
  const { dogEvents, addEvent, updateEvent, deleteEvent } = useDogEvents();
  const { dogPurchases, addPurchase, updatePurchase, deletePurchase } =
    useDogPurchases();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const showEvents = pathname.includes("/events");

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <Heading as="h1" variant="display">
          Momo Tracker
        </Heading>
        <Button
          variant="outlined"
          size="sm"
          onClick={() => navigate(showEvents ? "/dog" : "/dog/events")}
        >
          {showEvents ? "← Purchases" : "Events"}
        </Button>
      </div>

      <Routes>
        <Route
          index
          element={
            <DogPurchasesView
              dogPurchases={dogPurchases}
              onAddPurchase={addPurchase}
              onUpdatePurchase={updatePurchase}
              onDeletePurchase={deletePurchase}
            />
          }
        />
        <Route
          path="events"
          element={
            <DogEventsView
              dogEvents={dogEvents}
              onAddEvent={addEvent}
              onUpdateEvent={updateEvent}
              onDeleteEvent={deleteEvent}
            />
          }
        />
      </Routes>
    </div>
  );
}
