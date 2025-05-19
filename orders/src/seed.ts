import axios from "axios";
import { Product } from "./models/product";
import mongoose from "mongoose";

const API_URL = "https://fakestoreapi.com/products";

export async function seedProducts() {
  console.log("Seeding products...");
  try {
    console.log("Checking connection to MongoDB...")
    await mongoose.connect("mongodb://orders-mongo-srv:27017/orders");
    console.log("Connected to MongoDB! Starting seed...")

    const { data: products } = await axios.get(API_URL);
    console.log("Fetched products from API!", products.length)

    for (const product of products) {
      const productDoc = await Product.build({
        id: product.id,
        title: product.title,
        price: product.price,
        description: product.description,
        category: product.category,
        image: product.image
      }).save();

      console.log(`Created product: ${productDoc.title}`);
    }

    console.log(`Successfully created ${products.length} products`);
  } catch (error) {
    console.error("Error seeding products:", error);
    throw error;
  }
}

// Run the seed function when this file is executed
// seedProducts();
