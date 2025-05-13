import axios from "axios";

export async function fetchScraperData() {
  try {
    const response = await axios.get(`https://astimatism-be.up.railway.app/scraper`);
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
