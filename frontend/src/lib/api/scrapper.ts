import axios from "axios";
import { BACKEND_URL } from "../constants";

export async function fetchScraperData() {
  try {
    const response = await axios.get(`${BACKEND_URL}/scraper`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to fetch scraper data:", error.message);
    } else {
      console.error("An unknown error occurred while fetching scraper data.");
    }
    throw error;
  }
}
