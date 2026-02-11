import axios from "axios";

export async function fetchHealth() {
  try {
    const response = await axios.get("/api/health");
    return response.data;
  } catch (error) {
    console.error("Error fetching health status:", error);
    throw error;
  }
}