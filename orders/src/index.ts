import mongoose from "mongoose";
import { app } from "./app";
import { seedProducts } from "./seed";
import { kafka } from "./kafka-wrapper";
import { PaymentSucceededListener } from "./events/listeners/payment-succeeded-listener";
import { PaymentFailedListener } from "./events/listeners/payment-failed-listener";
import { setupKafkaTopics } from "./kafka-topic-setup";

const start = async () => {
  console.log("Starting up orders service...");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }
  
  if (!process.env.KAFKA_BROKERS) {
    throw new Error("KAFKA_BROKERS must be defined");
  }

  try {
    await mongoose.connect("mongodb://orders-mongo-srv:27017/orders");
    console.log("Connected to orders MongoDB!");

    // Connect to Kafka
    const brokers = process.env.KAFKA_BROKERS!.split(',');
    kafka.connect('orders-service', brokers);
    console.log('Connected to Kafka');
    
    // Setup Kafka topics before initializing listeners
    await setupKafkaTopics(kafka.client);
    
    // Initialize the Kafka listeners
    new PaymentSucceededListener(kafka.client).listen();
    new PaymentFailedListener(kafka.client).listen();
    console.log('Kafka listeners initialized');
    
    await seedProducts();
  } catch (err) {
    console.error("Error in orders starter file", err);
  }
  app.listen(3000, () => {
    console.log("Listening to orders on port 3000");
  });
};

start();
