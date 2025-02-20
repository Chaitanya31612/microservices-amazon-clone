import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';

export = async function globalSetup() {
  const instance = await MongoMemoryServer.create();
  await instance.start();
  const uri = instance.getUri();
  (global as any).__MONGOINSTANCE = instance;
  process.env.MONGO_URI = uri.slice(0, uri.lastIndexOf('/'));

  // The following is to make sure the database is clean before an test starts
  await mongoose.connect(`${process.env.MONGO_URI}/testdb`);
  await mongoose.connection.db.dropDatabase();
  await mongoose.disconnect();

  // ! above code is giving following error - Instance Exited before being ready and without throwing an error! suggest solution

  // const mongo = await MongoMemoryServer.create();
  // const mongoUri = mongo.getUri();

  // await mongo.start();
};
