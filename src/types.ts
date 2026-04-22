export interface User {
  id: string;
  name: string;
  email: string;
  college: string;
  avatar?: string;
  rating?: number;
  joinedAt: string;
}

export type ProductCondition = "New" | "Used - Like New" | "Used - Good" | "Used - Fair";
export type ProductStatus = "active" | "sold" | "archived";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  condition: ProductCondition;
  images: string[];
  sellerId: string;
  sellerName: string;
  college: string;
  createdAt: string;
  status: ProductStatus;
  savedBy: string[];
}

export interface Chat {
  id: string;
  participants: string[];
  productId: string;
  productTitle: string;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount?: Record<string, number>;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
}
