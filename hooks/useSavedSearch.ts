import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

// Keep in sync with your app's FilterInput
export interface FilterInput {
  property_type?: string;
  offer_type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedroom?: number;
  bathroom?: number;
}

export interface SavedSearchState {
  searches: FilterInput[];
  save: (filters: FilterInput) => void; // de-duplicates
  exists: (filters: FilterInput) => boolean;
  removeAt: (index: number) => void;
  clear: () => void;
  setAll: (list: FilterInput[]) => void;
}

// Factory for dynamic storage key if needed
export const createSavedSearchStore = (storageKey: string = "savedsearch") =>
  create<SavedSearchState>()(
    persist(
      (set, get) => ({
        searches: [],
        exists: (filters) =>
          get().searches.some(
            (s) => JSON.stringify(s) === JSON.stringify(filters)
          ),
        save: (filters) => {
          const { searches } = get();
          const dup = searches.some(
            (s) => JSON.stringify(s) === JSON.stringify(filters)
          );
          if (!dup) set({ searches: [filters, ...searches].slice(0, 50) });
        },
        removeAt: (index) => {
          const next = [...get().searches];
          next.splice(index, 1);
          set({ searches: next });
        },
        clear: () => set({ searches: [] }),
        setAll: (list) => set({ searches: list }),
      }),
      {
        name: "savedSearch", // Use a different key than 'favorite-properties-storage'
        storage: createJSONStorage(() => localStorage), // Same storage config shape you showed
      }
    )
  );

// Default instance
export const useSavedSearch = createSavedSearchStore();
