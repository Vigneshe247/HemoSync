import { connectToMongoDB, disconnectFromMongoDB } from './db.js';
import { INITIAL_DONORS, INITIAL_REQUESTS } from '../src/data/initialData.js';

async function seedDatabase() {
  console.log("Seeding MongoDB Atlas with initial NeoBlood records...");
  const db = await connectToMongoDB();

  // Clear existing records
  await db.collection('donors').deleteMany({});
  await db.collection('requests').deleteMany({});

  // Insert initial donors
  const donorsToInsert = INITIAL_DONORS.map(d => ({
    ...d,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  const donorRes = await db.collection('donors').insertMany(donorsToInsert);
  console.log(`✅ Seeded ${donorRes.insertedCount} Donors into MongoDB.`);

  // Insert initial requests
  const requestsToInsert = INITIAL_REQUESTS.map(r => ({
    ...r,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  const reqRes = await db.collection('requests').insertMany(requestsToInsert);
  console.log(`✅ Seeded ${reqRes.insertedCount} Emergency Requests into MongoDB.`);

  await disconnectFromMongoDB();
  console.log("Database seeding completed successfully!");
}

seedDatabase().catch(err => {
  console.error("Seeding error:", err);
  process.exit(1);
});
