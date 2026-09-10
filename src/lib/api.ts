// lib/api.ts
export const API_URL = "https://car-store-backend-1-tb9h.onrender.com";

export type Product = {
  id: number;
  name: string;
  description: string;
  image_url: string;
  price: number;
  discount_price?: number;
  is_new: boolean;
};

export async function getAllProducts(): Promise<Product[]> {
  const res = await fetch(`${API_URL}/api/products`);
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  return res.json();
}