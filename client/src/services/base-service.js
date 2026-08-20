import axios from "axios";
import { getSession } from "next-auth/react";

const API_URL = "https://api-gateway-canva-clone.onrender.com";

export async function fetchWithAuth(endpoint, options = {}) {
  const session = await getSession();

  if (!session) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await axios({
      url: `${API_URL}${endpoint}`,
      method: options.method || "GET",
      headers: {
        Authorization: `Bearer ${session.idToken}`,
        ...options.headers,
      },
      data: options.body,
      params: options.params,
    });

    return response.data;
  } catch (error) {
    console.error("API request failed:", {
      url: `${API_URL}${endpoint}`,
      status: error.response?.status,
      data: error.response?.data,
      headers: error.response?.headers,
    });

    throw error;
  }
}
