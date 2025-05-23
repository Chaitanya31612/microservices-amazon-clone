import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
  console.log("Starting up payments service...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://payments-mongo-srv:27017/payments");
    console.log("Connected to payments MongoDB!");
  } catch (err) {
    console.error("Error in payments starter file", err);
  }
  app.listen(3000, () => {
    console.log("Listening to payments on port 3000");
  });
};

start();
