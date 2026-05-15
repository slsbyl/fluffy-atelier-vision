import product1 from "@/assets/product-1.jpg";
import product2 from "@/assets/product-2.jpg";
import product3 from "@/assets/product-3.jpg";
import product4 from "@/assets/product-4.jpg";
import product5 from "@/assets/product-5.jpg";
import product6 from "@/assets/product-6.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  sizes: string[];
  inStock: boolean;
  category: string;
  description: string;
  isBestSeller: boolean;
  isNewArrival: boolean;
  rating: number;
  reviews: number;
  soldCount: number;
}

export const products: Product[] = [
  {
    id: "1",
    name: "Silk Blush Blouse",
    price: 129,
    image: product1,
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    category: "Tops",
    description: "A luxurious silk blouse in our signature blush pink. Features delicate button details and a relaxed fit that drapes beautifully.",
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.8,
    reviews: 124,
    soldCount: 340,
  },
  {
    id: "2",
    name: "Cream Midi Dress",
    price: 189,
    image: product2,
    sizes: ["S", "M", "L"],
    inStock: true,
    category: "Dresses",
    description: "An elegant cream midi dress perfect for any occasion. Crafted from premium fabric with a flattering A-line silhouette.",
    isBestSeller: true,
    isNewArrival: true,
    rating: 4.9,
    reviews: 89,
    soldCount: 280,
  },
  {
    id: "3",
    name: "Camel Wool Coat",
    price: 349,
    image: product3,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    category: "Outerwear",
    description: "A timeless camel wool coat that elevates any outfit. Oversized fit with notch lapels and side pockets.",
    isBestSeller: true,
    isNewArrival: false,
    rating: 4.7,
    reviews: 156,
    soldCount: 420,
  },
  {
    id: "4",
    name: "Rose Pleated Skirt",
    price: 99,
    image: product4,
    sizes: ["XS", "S", "M", "L"],
    inStock: true,
    category: "Bottoms",
    description: "A feminine pleated midi skirt in soft rose. Elastic waist for comfort with elegant movement.",
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.6,
    reviews: 67,
    soldCount: 150,
  },
  {
    id: "5",
    name: "White Linen Cami",
    price: 79,
    image: product5,
    sizes: ["XS", "S", "M"],
    inStock: false,
    category: "Tops",
    description: "A breezy white linen camisole perfect for warm days. Delicate button front with adjustable straps.",
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.5,
    reviews: 43,
    soldCount: 95,
  },
  {
    id: "6",
    name: "Camel Knit Sweater",
    price: 159,
    image: product6,
    sizes: ["S", "M", "L", "XL"],
    inStock: true,
    category: "Knitwear",
    description: "A cozy ribbed knit sweater in warm camel. Premium cashmere blend for ultimate softness.",
    isBestSeller: false,
    isNewArrival: true,
    rating: 4.8,
    reviews: 78,
    soldCount: 200,
  },
];
