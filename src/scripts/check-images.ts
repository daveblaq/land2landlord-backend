import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const mongoUri = process.env.MONGO_URI!;

async function checkImages() {
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB');

  const db = mongoose.connection.db;
  const properties = await db.collection('properties').find({}).toArray();

  console.log(`Found ${properties.length} properties:`);
  properties.forEach((p: any) => {
    console.log(`Title: ${p.title}`);
    console.log(`HeroImage: ${p.heroImage}`);
    console.log(`Gallery:`, JSON.stringify(p.gallery));
  });

  await mongoose.disconnect();
}

checkImages().catch(err => {
  console.error(err);
  process.exit(1);
});
