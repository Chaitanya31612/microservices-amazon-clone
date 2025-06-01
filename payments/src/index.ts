import mongoose from "mongoose";
import { app } from "./app";
import { kafka } from "./kafka-wrapper";
import { OrderCreatedListener } from "./events/listeners/order-created-listener";
import { OrderUpdatedListener } from "./events/listeners/order-updated-listener";
import { setupKafkaTopics } from "./kafka-topic-setup";

const start = async () => {
  console.log("Starting up payments service...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  
  if (!process.env.STRIPE_KEY) {
    throw new Error("STRIPE_KEY must be defined");
  }
  
  if (!process.env.KAFKA_BROKERS) {
    throw new Error("KAFKA_BROKERS must be defined");
  }

  try {
    await mongoose.connect("mongodb://payments-mongo-srv:27017/payments");
    console.log("Connected to payments MongoDB!");
    
    // Connect to Kafka
    const brokers = process.env.KAFKA_BROKERS!.split(',');
    kafka.connect('payments-service', brokers);
    console.log('Connected to Kafka');
    
    // Setup Kafka topics before initializing listeners
    await setupKafkaTopics(kafka.client);
    
    // Initialize the Kafka listeners
    new OrderCreatedListener(kafka.client).listen();
    new OrderUpdatedListener(kafka.client).listen();
    console.log('Kafka listeners initialized');
  } catch (err) {
    console.error("Error in payments starter file", err);
  }
  app.listen(3000, () => {
    console.log("Listening to payments on port 3000");
  });
};

start();
