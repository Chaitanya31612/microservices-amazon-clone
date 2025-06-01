import { Subjects } from '@cgecommerceproject/common';
import { Kafka } from 'kafkajs';

export const setupKafkaTopics = async (client: Kafka) => {
  const admin = client.admin();
  
  console.log('Connecting to Kafka admin client...');
  await admin.connect();
  
  try {
    console.log('Creating Kafka topics if they do not exist...');
    
    // Get list of topics we need for this service
    const requiredTopics = [
      Subjects.PaymentSucceeded, // payment_succeeded
      Subjects.PaymentFailed,    // payment_failed
      Subjects.OrderCreated,     // order_created
      Subjects.OrderUpdated,     // order_updated
      Subjects.OrderCancelled,   // order_cancelled
      Subjects.PaymentCreated    // payment_created
    ];
    
    // Get existing topics
    const existingTopics = await admin.listTopics();
    console.log('Existing topics:', existingTopics);
    
    // Filter out topics that already exist
    const topicsToCreate = requiredTopics
      .filter(topic => !existingTopics.includes(topic));
    
    if (topicsToCreate.length > 0) {
      console.log('Creating topics:', topicsToCreate);
      
      await admin.createTopics({
        topics: topicsToCreate.map(topic => ({
          topic,
          numPartitions: 1,
          replicationFactor: 1,
        })),
      });
      
      console.log('Topics created successfully');
    } else {
      console.log('All required topics already exist');
    }
  } catch (error) {
    console.error('Error setting up Kafka topics:', error);
  } finally {
    await admin.disconnect();
  }
};
