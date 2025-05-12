import axios from "axios";
import { BACKEND_URL } from "../constants";

export async function fetchMetaMap() {
  try {
    const response = await axios.get(`${BACKEND_URL}/meta-map`);
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
