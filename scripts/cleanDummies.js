import { connectToMongoDB, client } from '../server/db.js';

async function cleanDummies() {
  console.log('--- Cleaning Dummy Users and Duplicate Donors ---');
  try {
    const db = await connectToMongoDB();

    // 1. Delete dummy test users
    const delUsers = await db.collection('users').deleteMany({
      email: { $regex: '^(testuser_|user_with_phone_)' }
    });
    console.log(`Deleted ${delUsers.deletedCount} dummy test users from 'users' collection.`);

    // 2. Delete duplicate test donors named 'Sridharan' (keeping the real 'Sridharan A')
    const delBloodDonors = await db.collection('bloodDonors').deleteMany({
      name: 'Sridharan'
    });
    console.log(`Deleted ${delBloodDonors.deletedCount} dummy duplicate records from 'bloodDonors' collection.`);

    const delDonors = await db.collection('donors').deleteMany({
      name: 'Sridharan'
    });
    console.log(`Deleted ${delDonors.deletedCount} dummy duplicate records from 'donors' collection.`);

    // 3. Display current remaining records
    console.log('\n=== Remaining Users ===');
    const remainingUsers = await db.collection('users').find({}).toArray();
    for (const u of remainingUsers) {
      console.log(` - ID: ${u._id} | Name: ${u.name} | Email: ${u.email} | Phone: ${u.phone || 'N/A'}`);
    }

    console.log('\n=== Remaining Blood Donors ===');
    const remainingDonors = await db.collection('bloodDonors').find({}).toArray();
    for (const d of remainingDonors) {
      console.log(` - ID: ${d._id} | Name: ${d.name} | Group: ${d.bloodGroup} | City: ${d.city} | Phone: ${d.phone}`);
    }

    console.log('\nCleanup completed successfully!');
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await client.close();
  }
}

cleanDummies();
