
import type { Book } from './types';

export const BOOKS: Book[] = [
  {
    id: 1,
    title: "The Hum at Hex-Key Harbor",
    problem: "A low-frequency hum is shattering the good china.",
    resolution: "Realigning the local magnetic ley lines.",
    image: "https://via.placeholder.com/300x400?text=Hex-Key+Harbor",
    price: "$2.99",
    wordCount: 12000
  },
  {
    id: 2,
    title: "Toaster of Infinite Toast",
    problem: "The toaster won't stop producing toast, violating laws of conservation.",
    resolution: "Installing a localized temporal dampener.",
    image: "/covers/toaster_cover.png",
    price: "$2.99",
    wordCount: 14500
  },
  {
    id: 3,
    title: "Gravity-Defying Garden Gnomes",
    problem: "Lawn ornaments are migrating south for the winter.",
    resolution: "Negotiating with the gnome king.",
    image: "https://via.placeholder.com/300x400?text=Garden+Gnomes",
    price: "$2.99",
    wordCount: 11000
  }
];
