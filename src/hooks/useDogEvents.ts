import { DogEventType } from "../constants";
import { useFirebaseCollection } from "./useFirebaseCollection";

export interface DogEvent {
  id: string;
  date: string;
  type: DogEventType;
  notes: string;
  weightLbs: number | null;
  createdAt: string;
}

export type DogEventInput = Omit<DogEvent, "id" | "createdAt">;

export function useDogEvents() {
  const { items: dogEvents, loading, add, update, remove } =
    useFirebaseCollection<DogEvent>("dogEvents");

  async function addEvent(input: DogEventInput): Promise<void> {
    await add(input);
  }

  async function updateEvent(id: string, updates: Partial<DogEvent>): Promise<void> {
    await update(id, updates);
  }

  async function deleteEvent(id: string): Promise<void> {
    await remove(id);
  }

  return {
    dogEvents,
    loading,
    addEvent,
    updateEvent,
    deleteEvent,
  };
}
