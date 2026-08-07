import { Heading } from "@slauyama/ui";
import { useDogEvents } from "../hooks/useDogEvents";
import { useDogPurchases } from "../hooks/useDogPurchases";
import DogTimelineView from "../components/dog/DogTimelineView";

export default function DogPage() {
  const { dogEvents, addEvent, updateEvent, deleteEvent } = useDogEvents();
  const { dogPurchases, addPurchase, updatePurchase, deletePurchase } =
    useDogPurchases();

  return (
    <div className="flex-col gap-2">
      <Heading as="h1" variant="display">
        Momo Tracker
      </Heading>
      <DogTimelineView
        dogEvents={dogEvents}
        dogPurchases={dogPurchases}
        onAddEvent={addEvent}
        onUpdateEvent={updateEvent}
        onDeleteEvent={deleteEvent}
        onAddPurchase={addPurchase}
        onUpdatePurchase={updatePurchase}
        onDeletePurchase={deletePurchase}
      />
    </div>
  );
}
