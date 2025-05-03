import clientPromise from '@/lib/mongodb';
import { Bus } from '@/types/schema';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
console.log(`Attempting to load environment variables from: ${envPath}`);
dotenv.config({ path: envPath });

// Verify environment variables are loaded
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined after loading .env.local');
}
if (!process.env.MONGODB_DB) {
  throw new Error('MONGODB_DB is not defined after loading .env.local');
}

async function seedBuses() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB);

    // Read the buses.json file
    const filePath = path.join(process.cwd(), 'src', 'data', 'buses.json');
    const jsonData = await fs.readFile(filePath, 'utf-8');
    const buses: Bus[] = JSON.parse(jsonData);

    // Clear existing buses
    await db.collection('buses').deleteMany({});

    // Insert buses into MongoDB
    const result = await db.collection('buses').insertMany(buses);

    console.log(`Successfully inserted ${result.insertedCount} buses into MongoDB.`);
  } catch (error) {
    console.error('Error seeding buses:', error);
  } finally {
    const client = await clientPromise;
    await client.close();
  }
}

seedBuses();