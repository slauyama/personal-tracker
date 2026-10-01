import { Routes, Route } from "react-router-dom";
import { useDogEvents } from "../hooks/useDogEvents";
import { useDogPurchases } from "../hooks/useDogPurchases";
import DogEventsView from "../components/dog/DogEventsView";
import DogPurchasesView from "../components/dog/DogPurchasesView";

export default function DogPage() {
  const {
    dogEvents,
    loading: isLoadingDogEvents,
    addEvent,
    updateEvent,
    deleteEvent,
  } = useDogEvents();
  const {
    dogPurchases,
    loading: isLoadingDogPurchases,
    addPurchase,
    updatePurchase,
    deletePurchase,
  } = useDogPurchases();

  return (
    <div>
      <Routes>
        <Route
          index
          element={
            <DogPurchasesView
              dogPurchases={dogPurchases}
              loading={isLoadingDogPurchases}
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
              loading={isLoadingDogEvents}
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
