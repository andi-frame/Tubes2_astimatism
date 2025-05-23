import axios from "axios";

export async function fetchDFSSearch(elementId: number, limit: number) {
  try {
    const response = await axios.get(`https://astimatism-be.up.railway.app/dfs-limited-tree?target=${elementId}&limit=${limit}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to fetch DFS search:", error.message);
    } else {
      console.error("An unknown error occurred while fetching DFS search.");
    }
    throw error;
  }
}
