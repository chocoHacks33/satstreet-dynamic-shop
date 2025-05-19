import { db } from '@/lib/db';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceInSats: number;
  shopName: string;
  imageUrl: string;
  priceChangePercentage: number;
	priceHistory: PriceHistoryEntry[];
  stockCount: number;
}

export interface PriceHistoryEntry {
  timestamp: string;
  price: number;
  explanation: string;
}

export const getProducts = async (): Promise<Product[]> => {
  // Simulate fetching products from a database or API
  // Replace this with your actual data fetching logic
  const products = await db.product.findMany({
    include: {
      priceHistory: true,
    },
  });
  return products.map(product => ({
    ...product,
    priceInSats: product.price,
    priceHistory: product.priceHistory.map(history => ({
      ...history,
      timestamp: history.timestamp.toISOString(),
    })),
  }));
};

export const getProductById = async (id: string): Promise<Product | null> => {
  // Simulate fetching a product by ID from a database or API
  // Replace this with your actual data fetching logic
  const product = await db.product.findUnique({
    where: { id },
    include: {
      priceHistory: true,
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    priceInSats: product.price,
    priceHistory: product.priceHistory.map(history => ({
      ...history,
      timestamp: history.timestamp.toISOString(),
    })),
  };
};

export const getProductImages = async (productId: string): Promise<string[]> => {
  // Simulate fetching product images from a database or API
  // Replace this with your actual data fetching logic
  return new Promise((resolve) => {
    setTimeout(() => {
      // Replace this with actual image URLs or paths
      const images = [
        `/images/image1.webp`,
        `/images/image2.webp`,
        `/images/image3.webp`,
      ];
      resolve(images);
    }, 500);
  });
};
