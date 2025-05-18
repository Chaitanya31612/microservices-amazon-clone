import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting up orders service...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://orders-mongo-srv:27017/orders");
    console.log("Connected to orders MongoDB!");
  } catch (err) {
    console.error("Error in starter file", err);
  }
  app.listen(3000, () => {
    console.log("Listening to tickets on port 3000");
  });
};

start();
