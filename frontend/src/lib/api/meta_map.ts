import axios from "axios";
import { BACKEND_URL } from "../constants";
import type { RecipeType } from "../store/scraper_store";

export async function fetchMetaMap(recipes: RecipeType[]) {
  try {
    const response = await axios.post(`${BACKEND_URL}/meta-map`, {
      recipes: recipes,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to fetch meta map:", error.message);
    } else {
      console.error("An unknown error occurred while fetching meta map.");
    }
    throw error;
  }
}
