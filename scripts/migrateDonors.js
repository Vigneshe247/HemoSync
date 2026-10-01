import { connectToMongoDB, client } from '../server/db.js';

async function migrateDonors() {
  console.log('--- Starting Safe Donor Migration ---');
  try {
    const db = await connectToMongoDB();
    const sourceCollection = db.collection('donors');
    const targetCollection = db.collection('bloodDonors');

    // 1. Fetch source donors
    const existingDonors = await sourceCollection.find({}).toArray();
    console.log(`Found ${existingDonors.length} existing donor records in 'donors' collection.`);

    let migrated = 0;
    let skipped = 0;

    for (const donor of existingDonors) {
      // Check if already in bloodDonors by _id or uid or phone
      const query = {
        $or: [
          { _id: donor._id },
          ...(donor.uid ? [{ uid: donor.uid }] : []),
          ...(donor.phone ? [{ phone: donor.phone, name: donor.name }] : [])
        ]
      };
      const existing = await targetCollection.findOne(query);

      if (existing) {
        skipped++;
        continue;
      }

      // Format document according to new bloodDonors schema
      const newDonorDoc = {
        _id: donor._id,
        uid: donor.uid || `donor-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        userId: donor.userId || null, // null for legacy donors
        name: donor.name?.trim() || 'Anonymous Donor',
        bloodGroup: (donor.bloodGroup || 'O+').toUpperCase().trim(),
        phone: donor.phone?.trim() || '',
        age: donor.age ? Number(donor.age) : null,
        gender: donor.gender || null,
        state: donor.state || 'Tamil Nadu',
        city: donor.city || donor.district || 'Madurai',
        district: donor.district || donor.city || 'Madurai',
        address: donor.address || '',
        availability: donor.isAvailable !== undefined ? donor.isAvailable : (donor.availability !== undefined ? donor.availability : true),
        isAvailable: donor.isAvailable !== undefined ? donor.isAvailable : (donor.availability !== undefined ? donor.availability : true),
        lastDonationDate: donor.lastDonationDate || null,
        totalDonations: donor.totalDonations || 0,
        createdAt: donor.createdAt || new Date().toISOString(),
        updatedAt: donor.updatedAt || new Date().toISOString()
      };

      await targetCollection.insertOne(newDonorDoc);
      migrated++;
    }

    console.log(`Migration results:`);
    console.log(` - Migrated: ${migrated}`);
    console.log(` - Skipped (already existed): ${skipped}`);
    console.log(` - Total in 'bloodDonors': ${await targetCollection.countDocuments()}`);

    // Create Indexes
    console.log('Ensuring indexes...');
    await targetCollection.createIndex({ bloodGroup: 1 });
    await targetCollection.createIndex({ city: 1 });
    await targetCollection.createIndex({ availability: 1 });
    await targetCollection.createIndex({ userId: 1 }, { sparse: true });

    const usersCollection = db.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ googleId: 1 }, { sparse: true });
    console.log('Indexes created successfully.');

    console.log('Safe migration completed without deleting source collection.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.close();
  }
}

migrateDonors();
