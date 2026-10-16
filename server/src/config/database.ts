import { MongoClient, Db } from 'mongodb';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const isMongoDb = DATABASE_URL?.includes('mongodb');

let pool: any;
let mongoDb: Db;
let mongoClient: MongoClient;

if (isMongoDb) {
  // MongoDB Connection with SSL support
  async function connectMongoDB() {
    try {
      mongoClient = new MongoClient(DATABASE_URL!, {
        maxPoolSize: 10,
        minPoolSize: 2,
        ssl: true,
        retryWrites: true,
        w: 'majority',
      });
      await mongoClient.connect();
      mongoDb = mongoClient.db('hireflow_ai');
      console.log('✓ MongoDB Database connection successful');
      return mongoDb;
    } catch (error) {
      console.error('✗ Database connection failed:', error instanceof Error ? error.message : String(error));
      // Retry on SSL issues - sometimes MongoDB Atlas needs a moment
      setTimeout(() => {
        console.log('Retrying MongoDB connection...');
        connectMongoDB();
      }, 5000);
    }
  }
  connectMongoDB();
  pool = mongoDb;
} else {
  // MySQL Connection (local)
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'hireflow_ai',
    waitForConnections: true,
    connectionLimit: parseInt(process.env.DB_POOL_MAX || '10'),
    queueLimit: 0,
  });

  // Test connection on startup
  pool.getConnection()
    .then((connection: any) => {
      console.log('✓ MySQL Database connection successful');
      connection.release();
    })
    .catch((error: any) => {
      console.error('✗ Database connection failed:', error.message);
      setTimeout(() => process.exit(1), 5000);
    });
}

export default pool;
export { isMongoDb, mongoDb, mongoClient };
