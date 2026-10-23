import mongoose from 'mongoose';
import { ENV } from './env.js';
import { logger } from './logger.js';

let mongodInstance = null;
let mongodPromise = null;

export const connectDB = async () => {
  let uri = ENV.MONGODB_URI;

  if (!uri) {
    if (!mongodInstance) {
      if (!mongodPromise) {
        logger.info('No MONGODB_URI provided. Initializing in-memory MongoDB instance...');
        mongodPromise = (async () => {
          const { MongoMemoryServer } = await import('mongodb-memory-server');
          mongodInstance = await MongoMemoryServer.create();
          const uri = mongodInstance.getUri();
          logger.info(`In-memory MongoDB initialized at: ${uri}`);
          return mongodInstance;
        })();
      }
      mongodInstance = await mongodPromise;
    }
    uri = mongodInstance.getUri();
  }

  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    logger.info(`MongoDB connected successfully to ${uri.startsWith('mongodb+srv') ? 'MongoDB Atlas' : 'local/in-memory instance'}`);
  } catch (error) {
    logger.error('MongoDB connection error:', error.message);
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    // Only stop memory server on non-test environments or shutdown
    if (mongodInstance && process.env.NODE_ENV !== 'test') {
      await mongodInstance.stop();
      mongodInstance = null;
      mongodPromise = null;
      logger.info('In-memory MongoDB stopped.');
    }
  } catch (err) {
    logger.error('Error disconnecting MongoDB:', err);
  }
};
