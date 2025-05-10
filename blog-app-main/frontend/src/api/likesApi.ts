import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";

// Types definitions
export interface LikeInfo {
  likeCount: number;
  userHasLiked: boolean;
}

export interface LikeCountResponse {
  count: number;
}

const handleApiError = async (response: Response) => {
  if (!response.ok) {
    try {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.status}`);
    } catch (e) {
      throw new Error(`API Error: ${response.statusText}`);
    }
  }
  return response;
};

export const toggleLike = async (
  postId: number,
  userId: number
): Promise<LikeInfo> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/posts/${postId}/toggle-like`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ userId }),
        credentials: "include",
      }
    );

    await handleApiError(response);
    return await response.json();
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

export const likePost = async (postId: number, userId: number) => {
  try {
    const response = await axios.post(
      `http://localhost:8080/api/posts/${postId}/like`,
      null, // No body required
      {
        params: {
          userId: userId,
        },
      }
    );
    console.log("✅ Like updated successfully:", response.data);
  } catch (error) {
    console.error("❌ Failed to update like:", error);
  }
};
