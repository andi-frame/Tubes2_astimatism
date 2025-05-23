import axios from "axios";

export async function fetchBFSSearch(elementId: number, limit: number) {
  try {
    const response = await axios.get(`https://astimatism-be.up.railway.app/bfs-limited-tree?target=${elementId}&limit=${limit}`);
    return response.data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Failed to fetch BFS search:", error.message);
    } else {
      console.error("An unknown error occurred while fetching BFS search.");
    }
    throw error;
  }
}
