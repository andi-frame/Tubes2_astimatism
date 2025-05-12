// lib/store/scraperStore.ts
import { create } from "zustand";

interface RecipeType {
  ElementId: number;
  Element: string;
  ImgUrl: string;
  ImgUrl1: string;
  ImgUrl2: string;
  IngredientId1: number;
  Ingredient1: string;
  IngredientId2: number;
  Ingredient2: string;
  Tier: number;
}

interface ScraperStore {
  scrapData: RecipeType[] | null;
  setScrapData: (scrapData: RecipeType[]) => void;
}

export const useScraperStore = create<ScraperStore>((set) => ({
  scrapData: null,
  setScrapData: (scrapData) => set({ scrapData }),
}));
