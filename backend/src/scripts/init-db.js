import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { logger } from '../utils/logger.js';

// Load environment variables
dotenv.config();

/**
 * Initialize database and collections
 * Creates the database and sets up collections with indexes
 */
const initDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    logger.info('Connecting to MongoDB...');
    logger.info(`Connection string: ${mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`); // Hide credentials in logs
    
    // Connect to MongoDB
    await mongoose.connect(mongoURI);
    
    const dbName = mongoose.connection.db.databaseName;
    logger.info(`Connected to database: ${dbName}`);
    
    // Get database instance
    const db = mongoose.connection.db;
    
    // List existing collections
    const existingCollections = await db.listCollections().toArray();
    const collectionNames = existingCollections.map(c => c.name);
    logger.info(`Existing collections: ${collectionNames.length > 0 ? collectionNames.join(', ') : 'None'}`);
    
    // Create collections if they don't exist
    // Mongoose creates collections automatically, but we'll ensure they exist with proper structure
    
    // Ensure Users collection exists
    if (!collectionNames.includes('users')) {
      logger.info('Creating users collection...');
      await db.createCollection('users');
      logger.info('✓ Users collection created');
    } else {
      logger.info('✓ Users collection already exists');
    }
    
    // Ensure Tasks collection exists
    if (!collectionNames.includes('tasks')) {
      logger.info('Creating tasks collection...');
      await db.createCollection('tasks');
      logger.info('✓ Tasks collection created');
    } else {
      logger.info('✓ Tasks collection already exists');
    }
    
    // Create indexes for Users collection
    logger.info('Creating indexes for users collection...');
    try {
      await User.collection.createIndex({ email: 1 }, { unique: true, name: 'email_1' });
      logger.info('✓ Email index created on users');
    } catch (error) {
      if (error.code === 85) {
        logger.info('✓ Email index already exists on users');
      } else {
        throw error;
      }
    }
    
    // Create indexes for Tasks collection
    logger.info('Creating indexes for tasks collection...');
    try {
      await Task.collection.createIndex({ userId: 1, date: 1 }, { name: 'userId_1_date_1' });
      logger.info('✓ userId + date index created on tasks');
    } catch (error) {
      if (error.code === 85) {
        logger.info('✓ userId + date index already exists on tasks');
      } else {
        throw error;
      }
    }
    
    try {
      await Task.collection.createIndex({ userId: 1, completed: 1 }, { name: 'userId_1_completed_1' });
      logger.info('✓ userId + completed index created on tasks');
    } catch (error) {
      if (error.code === 85) {
        logger.info('✓ userId + completed index already exists on tasks');
      } else {
        throw error;
      }
    }
    
    try {
      await Task.collection.createIndex({ userId: 1, priority: 1 }, { name: 'userId_1_priority_1' });
      logger.info('✓ userId + priority index created on tasks');
    } catch (error) {
      if (error.code === 85) {
        logger.info('✓ userId + priority index already exists on tasks');
      } else {
        throw error;
      }
    }
    
    // Verify collections
    const finalCollections = await db.listCollections().toArray();
    logger.info(`\n✓ Database initialization complete!`);
    logger.info(`Database: ${dbName}`);
    logger.info(`Collections: ${finalCollections.map(c => c.name).join(', ')}`);
    
    // List indexes
    logger.info('\nIndexes:');
    for (const collection of finalCollections) {
      const indexes = await db.collection(collection.name).indexes();
      logger.info(`  ${collection.name}: ${indexes.length} index(es)`);
      indexes.forEach(idx => {
        const keys = Object.keys(idx.key).map(k => `${k}:${idx.key[k]}`).join(', ');
        logger.info(`    - ${idx.name}: { ${keys} }`);
      });
    }
    
    logger.info('\n✅ Database is ready to use!');
    
    // Close connection
    await mongoose.disconnect();
    logger.info('Disconnected from MongoDB');
    
    process.exit(0);
  } catch (error) {
    logger.error('Database initialization failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run initialization
initDatabase();

