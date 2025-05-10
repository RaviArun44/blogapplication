export interface User {
  token(arg0: string, token: any): unknown;
  id: number;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
}

export interface IPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  category: string;
  tags: string[] | null;
  likes: number[];
  commentCount: number;
  createdAt: string;
  updatedAt: string;
  userId: number;
  username: string;
}

export interface Comment {
  id: number;
  content: string;
  author: User;
  createdAt: string;
  postId: number;
}
