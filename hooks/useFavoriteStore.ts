import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface FavoriteState {
  favorites: string[]; // An array of property IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavoriteStore = create<FavoriteState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (id: string) => {
        const { favorites } = get();
        const isAlreadyFavorite = favorites.includes(id);

        if (isAlreadyFavorite) {
          // Remove from favorites
          set({ favorites: favorites.filter((favId) => favId !== id) });
        } else {
          // Add to favorites
          set({ favorites: [...favorites, id] });
        }
      },
      isFavorite: (id: string) => {
        return get().favorites.includes(id);
      },
    }),
    {
      name: 'favorite-properties-storage', // Unique name for the localStorage item
      storage: createJSONStorage(() => localStorage), // Specify localStorage
    }
  )
);