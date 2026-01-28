
export interface Book {
  id: number;
  title: string;
  problem: string;
  resolution: string;
  image: string;
  price: string;
  wordCount: number;
  priceId?: string;
  audioAmbience?: string;
  backgroundMusic?: string;
}

export type ImageSize = '256x256' | '512x512' | '1024x1024' | '1K';
