import axios from "axios";

const API_URL = "http://localhost:8080/api";

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface PostRequest {
  title: string;
  excerpt: string;
  category: string;
  coverImage: string;
  content: string;
}

export const register = (data: RegisterData) => {
  const { confirmPassword, ...registerData } = data as any;

  return axios.post(`${API_URL}/auth/signup`, registerData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const login = (data: SignInData) => {
  return axios.post(`${API_URL}/auth/signin`, data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createPost = (postData: PostRequest, userId: number) => {
  return axios.post(`${API_URL}/posts?userId=${userId}`, postData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const getPostsByCategory = async (category: string) => {
  try {
    const response = await axios.get(`${API_URL}/posts/${category}`, {
      headers: {
        "Content-Type": "application/json",
      },
      validateStatus: (status) => {
        return status === 200 || status === 204;
      },
    });
    return response.status === 204 ? [] : response.data;
  } catch (error) {
    console.error(`Error fetching posts for category '${category}':`, error);
    throw error;
  }
};

export const getLikesByPostId = async (postId: number): Promise<number[]> => {
  const response = await axios.get<number[]>(
    `${API_URL}/posts/${postId}/likes`
  );
  return response.data;
};

export const getUsernamesByIds = async (userIds: number[]) => {
  try {
    // Join the userIds array into a comma-separated string
    const response = await axios.get(
      "http://localhost:8080/api/auth/getUserNames",
      {
        params: {
          userIds: userIds.join(","), // Convert the array into a comma-separated string
        },
      }
    );
    return response.data.usernames; // Return the list of usernames
  } catch (error) {
    console.error("Error fetching usernames:", error);
    return []; // Return an empty array if an error occurs
  }
};

export const getCommentsByPostId = async (
  postId: number
): Promise<{ userName: string; text: string }[]> => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/posts/${postId}/comments`, // Ensure this URL works directly in browser
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "*/*",
        },
      }
    );
    return Array.isArray(response.data) ? response.data : [];
  } catch (err) {
    console.error("Error fetching comments:", err);
    return [];
  }
};

export const addComment = async (
  postId: number,
  userId: number,
  message: string
): Promise<void> => {
  try {
    await axios.post(
      `http://localhost:8080/api/posts/${postId}/comments`, // ✅ correct URL
      { message }, // ✅ backend expects "message"
      {
        params: { userId }, // ✅ query param
        headers: {
          "Content-Type": "application/json", // ✅ correct content type
          Accept: "*/*", // ✅ as in Thunder Client
        },
      }
    );
  } catch (err) {
    console.error("Error adding comment:", err);
    throw new Error("Failed to add comment");
  }
};

export const fetchPostsByUserId = async (userId: number): Promise<any[]> => {
  try {
    const response = await axios.get(
      `http://localhost:8080/api/posts/user/${userId}`, // Correct URL to fetch posts
      {
        headers: {
          Accept: "application/json", // Expect JSON response
        },
      }
    );
    return response.data; // Return the list of posts
  } catch (err) {
    console.error("Error fetching posts:", err);
    throw new Error("Failed to fetch posts");
  }
};

export const deletePost = async (postId: any, userId: any) => {
  try {
    const response = await axios.delete(
      `${API_URL}/posts/${postId}?userId=${userId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updatePost = async (
  postId: any,
  userId: any,
  updatedData: any
) => {
  try {
    const response = await axios.put(
      `http://localhost:8080/api/posts/${postId}?userId=${userId}`,
      updatedData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating post:");
    throw error;
  }
};
