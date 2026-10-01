import { connectToMongoDB, client } from './db.js';
import { ObjectId } from 'mongodb';

// Helper to convert string or ObjectId
export function toMongoId(id) {
  if (typeof id === 'string' && ObjectId.isValid(id) && id.length === 24) {
    return new ObjectId(id);
  }
  return id;
}

/* ==========================================================================
   USERS CRUD OPERATIONS (Collection: users)
   ========================================================================== */

/**
 * [CREATE] Create an application user
 */
export async function createUser({ name, email, phone = null, bloodGroup = null, birthDate = null, passwordHash = null, authProviders = ['password'], googleId = null, role = 'user', emailVerified = false }) {
  const db = await connectToMongoDB();
  const normalizedEmail = email.trim().toLowerCase();

  const userDoc = {
    name: name.trim(),
    email: normalizedEmail,
    phone: phone ? phone.trim() : null,
    bloodGroup: bloodGroup ? bloodGroup.trim() : null,
    birthDate: birthDate || null,
    passwordHash,
    authProviders,
    googleId,
    role,
    emailVerified,
    profileCompleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('users').insertOne(userDoc);
  return { _id: result.insertedId, ...userDoc };
}

/**
 * [READ] Find user by normalized email
 */
export async function findUserByEmail(email) {
  if (!email) return null;
  const db = await connectToMongoDB();
  const normalizedEmail = email.trim().toLowerCase();
  return await db.collection('users').findOne({ email: normalizedEmail });
}

/**
 * [READ] Find user by ID
 */
export async function findUserById(id) {
  if (!id) return null;
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  return await db.collection('users').findOne({
    $or: [{ _id }, { uid: id }]
  });
}

/**
 * [UPDATE] Update user record
 */
export async function updateUser(id, updateData) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  const updates = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('users').findOneAndUpdate(
    { $or: [{ _id }, { uid: id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );
  return result;
}

/**
 * [DELETE] Remove user account
 */
export async function deleteUser(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  const result = await db.collection('users').deleteOne({
    $or: [{ _id }, { uid: id }]
  });
  return { success: result.deletedCount > 0 };
}

/**
 * [READ] Get all users
 */
export async function getAllUsers() {
  const db = await connectToMongoDB();
  return await db.collection('users').find({}).toArray();
}

/* ==========================================================================
   BLOOD DONORS CRUD OPERATIONS (Collection: bloodDonors)
   ========================================================================== */

/**
 * [CREATE] Create a new donor profile in bloodDonors collection
 */
export async function createDonor(donorData) {
  const db = await connectToMongoDB();
  const donor = {
    uid: donorData.uid || `donor-${Date.now()}`,
    userId: donorData.userId ? String(donorData.userId) : null,
    name: donorData.name?.trim() || 'Anonymous Donor',
    email: donorData.email?.trim().toLowerCase() || '',
    bloodGroup: (donorData.bloodGroup || 'O+').toUpperCase().trim(),
    phone: donorData.phone?.trim() || '',
    age: donorData.age ? Number(donorData.age) : null,
    gender: donorData.gender || null,
    state: donorData.state || 'Tamil Nadu',
    city: donorData.city || donorData.district || 'Madurai',
    district: donorData.district || donorData.city || 'Madurai',
    address: donorData.address || '',
    availability: donorData.availability !== undefined ? donorData.availability : (donorData.isAvailable ?? true),
    isAvailable: donorData.isAvailable !== undefined ? donorData.isAvailable : (donorData.availability ?? true),
    totalDonations: donorData.totalDonations || 0,
    lastDonationDate: donorData.lastDonationDate || null,
    role: 'donor',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('bloodDonors').insertOne(donor);
  return { _id: result.insertedId, ...donor };
}

/**
 * [READ] Get donors from bloodDonors with filtering
 */
export async function getDonors(filter = {}) {
  const db = await connectToMongoDB();
  const query = {};

  if (filter.bloodGroup) {
    query.bloodGroup = filter.bloodGroup.toUpperCase().trim();
  }
  if (filter.state) {
    query.state = new RegExp(`^${filter.state}$`, 'i');
  }
  if (filter.city) {
    query.city = new RegExp(`^${filter.city}$`, 'i');
  }
  if (filter.district) {
    query.district = new RegExp(`^${filter.district}$`, 'i');
  }
  if (filter.availability !== undefined || filter.isAvailable !== undefined) {
    const val = filter.availability !== undefined ? filter.availability : filter.isAvailable;
    const isAvail = val === true || val === 'true';
    query.$or = [{ availability: isAvail }, { isAvailable: isAvail }];
  }

  // Primary: query bloodDonors
  let donors = await db.collection('bloodDonors').find(query).sort({ createdAt: -1 }).toArray();

  // Fallback: If bloodDonors is empty, check legacy donors
  if (donors.length === 0 && Object.keys(query).length === 0) {
    donors = await db.collection('donors').find({}).sort({ createdAt: -1 }).toArray();
  }

  return donors;
}

/**
 * [READ] Get single donor by id
 */
export async function getDonorById(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  let donor = await db.collection('bloodDonors').findOne({
    $or: [{ _id }, { uid: id }]
  });
  if (!donor) {
    donor = await db.collection('donors').findOne({
      $or: [{ _id }, { uid: id }]
    });
  }
  return donor;
}

/**
 * [READ] Get donor profile by associated userId
 */
export async function getDonorByUserId(userId) {
  if (!userId) return null;
  const db = await connectToMongoDB();
  const uidStr = String(userId);
  const _id = toMongoId(userId);

  return await db.collection('bloodDonors').findOne({
    $or: [{ userId: uidStr }, { userId: _id }, { _id }]
  });
}

/**
 * [UPDATE] Update donor profile (e.g. toggle availability, update phone, location)
 */
export async function updateDonor(id, updateData) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const updates = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  // Keep both isAvailable and availability synced for complete frontend compatibility
  if (updates.isAvailable !== undefined && updates.availability === undefined) {
    updates.availability = updates.isAvailable;
  }
  if (updates.availability !== undefined && updates.isAvailable === undefined) {
    updates.isAvailable = updates.availability;
  }

  let result = await db.collection('bloodDonors').findOneAndUpdate(
    { $or: [{ _id }, { uid: id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );

  // If not found in bloodDonors, attempt legacy donors
  if (!result) {
    result = await db.collection('donors').findOneAndUpdate(
      { $or: [{ _id }, { uid: id }] },
      { $set: updates },
      { returnDocument: 'after' }
    );
  }

  return result;
}

/**
 * [DELETE] Remove donor record
 */
export async function deleteDonor(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const result = await db.collection('bloodDonors').deleteOne({
    $or: [{ _id }, { uid: id }]
  });

  return { success: result.deletedCount > 0, deletedCount: result.deletedCount };
}

/* ==========================================================================
   BLOOD REQUESTS CRUD OPERATIONS (Collection: requests)
   ========================================================================== */

/**
 * [CREATE] Post a new blood request to MongoDB
 */
export async function createRequest(requestData) {
  const db = await connectToMongoDB();
  const request = {
    ...requestData,
    unitsRequired: parseInt(requestData.unitsRequired) || 1,
    status: requestData.status || 'OPEN',
    emergencyLevel: requestData.emergencyLevel || 'NORMAL',
    acceptedDonorId: null,
    acceptedDonorName: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('requests').insertOne(request);
  return { _id: result.insertedId, ...request };
}

/**
 * [READ] Get blood requests with optional filters
 */
export async function getRequests(filter = {}) {
  const db = await connectToMongoDB();
  const query = {};

  if (filter.status) query.status = filter.status;
  if (filter.bloodGroup) query.bloodGroup = filter.bloodGroup;
  if (filter.state) query.state = new RegExp(`^${filter.state}$`, 'i');
  if (filter.city) query.city = new RegExp(`^${filter.city}$`, 'i');
  if (filter.emergencyLevel) query.emergencyLevel = filter.emergencyLevel;

  return await db.collection('requests').find(query).sort({ createdAt: -1 }).toArray();
}

/**
 * [READ] Get single blood request by id
 */
export async function getRequestById(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  return await db.collection('requests').findOne({
    $or: [{ _id }, { requestId: id }]
  });
}

/**
 * [UPDATE] Update request details (units, status, details)
 */
export async function updateRequest(id, updateData) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const updates = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('requests').findOneAndUpdate(
    { $or: [{ _id }, { requestId: id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );

  return result;
}

/**
 * [UPDATE - SPECIALIZED] Pledge donation to request
 */
export async function pledgeRequest(requestId, donorId, donorName) {
  return await updateRequest(requestId, {
    acceptedDonorId: donorId,
    acceptedDonorName: donorName,
    status: 'PLEDGED'
  });
}

/**
 * [DELETE] Remove or cancel a blood request
 */
export async function deleteRequest(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const result = await db.collection('requests').deleteOne({
    $or: [{ _id }, { requestId: id }]
  });

  return { success: result.deletedCount > 0, deletedCount: result.deletedCount };
}

/* ==========================================================================
   BLOOD BANKS CRUD OPERATIONS (Collection: bloodBanks)
   ========================================================================== */

/**
 * [CREATE] Add a new Blood Bank to MongoDB
 */
export async function createBloodBank(bankData) {
  const db = await connectToMongoDB();
  const defaultStock = {
    'A+': 10, 'A-': 5, 'B+': 10, 'B-': 5,
    'AB+': 5, 'AB-': 2, 'O+': 15, 'O-': 5
  };

  const bank = {
    id: bankData.id || `bb-${Date.now()}`,
    name: bankData.name?.trim() || 'Community Blood Centre',
    hospitalName: bankData.hospitalName?.trim() || bankData.name?.trim() || 'Regional Hospital',
    address: bankData.address?.trim() || '',
    city: bankData.city?.trim() || 'Madurai',
    district: bankData.district?.trim() || bankData.city?.trim() || 'Madurai',
    state: bankData.state?.trim() || 'Tamil Nadu',
    contact: bankData.contact?.trim() || bankData.phone?.trim() || '',
    phone: bankData.phone?.trim() || bankData.contact?.trim() || '',
    email: bankData.email?.trim().toLowerCase() || '',
    operatingHours: bankData.operatingHours?.trim() || '24/7 Emergency Service',
    distanceKm: parseFloat(bankData.distanceKm) || 2.5,
    lat: parseFloat(bankData.lat) || 9.9312,
    lng: parseFloat(bankData.lng) || 78.1310,
    availableBloodGroups: {
      ...defaultStock,
      ...(bankData.availableBloodGroups || {})
    },
    verified: bankData.verified !== undefined ? bankData.verified : true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('bloodBanks').insertOne(bank);
  return { _id: result.insertedId, ...bank };
}

/**
 * [READ] Get blood banks with filters (city, state, search, bloodGroup availability)
 */
export async function getBloodBanks(filter = {}) {
  const db = await connectToMongoDB();
  const query = {};

  if (filter.state) {
    query.state = new RegExp(`^${filter.state}$`, 'i');
  }
  if (filter.city) {
    query.city = new RegExp(`^${filter.city}$`, 'i');
  }
  if (filter.district) {
    query.district = new RegExp(`^${filter.district}$`, 'i');
  }

  let banks = await db.collection('bloodBanks').find(query).sort({ createdAt: -1 }).toArray();

  if (filter.search) {
    const term = filter.search.toLowerCase().trim();
    banks = banks.filter(b =>
      (b.name && b.name.toLowerCase().includes(term)) ||
      (b.hospitalName && b.hospitalName.toLowerCase().includes(term)) ||
      (b.city && b.city.toLowerCase().includes(term)) ||
      (b.address && b.address.toLowerCase().includes(term))
    );
  }

  if (filter.bloodGroup) {
    const bg = filter.bloodGroup.toUpperCase().trim();
    banks = banks.filter(b => (b.availableBloodGroups?.[bg] || 0) > 0);
  }

  return banks;
}

/**
 * [READ] Get single blood bank by ID
 */
export async function getBloodBankById(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  return await db.collection('bloodBanks').findOne({
    $or: [{ _id }, { id }]
  });
}

/**
 * [UPDATE] Update blood bank details or stock
 */
export async function updateBloodBank(id, updateData) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const updates = {
    ...updateData,
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('bloodBanks').findOneAndUpdate(
    { $or: [{ _id }, { id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );

  return result;
}

/**
 * [UPDATE - SPECIALIZED] Update stock units for specific blood groups
 */
export async function updateBloodBankStock(id, stockUpdates) {
  const bank = await getBloodBankById(id);
  if (!bank) return null;

  const currentStock = bank.availableBloodGroups || {};
  const newStock = { ...currentStock, ...stockUpdates };

  return await updateBloodBank(id, { availableBloodGroups: newStock });
}

/**
 * [DELETE] Remove blood bank
 */
export async function deleteBloodBank(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);

  const result = await db.collection('bloodBanks').deleteOne({
    $or: [{ _id }, { id }]
  });

  return { success: result.deletedCount > 0, deletedCount: result.deletedCount };
}

/* ==========================================================================
   DONATION CAMPS CRUD OPERATIONS (Collection: camps)
   ========================================================================== */

export async function createCamp(campData) {
  const db = await connectToMongoDB();
  const camp = {
    id: campData.id || `camp-${Date.now()}`,
    title: campData.title?.trim() || 'Community Blood Camp',
    location: campData.location?.trim() || '',
    city: campData.city?.trim() || 'Madurai',
    state: campData.state?.trim() || 'Tamil Nadu',
    date: campData.date || new Date().toISOString().split('T')[0],
    time: campData.time || '09:00 AM - 04:00 PM',
    organizer: campData.organizer?.trim() || 'HemoSync Community',
    contact: campData.contact?.trim() || '',
    registeredCount: Number(campData.registeredCount) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const result = await db.collection('camps').insertOne(camp);
  return { _id: result.insertedId, ...camp };
}

export async function getCamps(filter = {}) {
  const db = await connectToMongoDB();
  const query = {};
  if (filter.city) query.city = new RegExp(`^${filter.city}$`, 'i');
  if (filter.state) query.state = new RegExp(`^${filter.state}$`, 'i');
  return await db.collection('camps').find(query).sort({ date: 1 }).toArray();
}

export async function getCampById(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  return await db.collection('camps').findOne({
    $or: [{ _id }, { id }]
  });
}

export async function updateCamp(id, updateData) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  const updates = { ...updateData, updatedAt: new Date().toISOString() };
  return await db.collection('camps').findOneAndUpdate(
    { $or: [{ _id }, { id }] },
    { $set: updates },
    { returnDocument: 'after' }
  );
}

export async function registerForCamp(campId) {
  const db = await connectToMongoDB();
  const _id = toMongoId(campId);
  const camp = await db.collection('camps').findOne({ $or: [{ _id }, { id: campId }] });
  if (!camp) return null;

  const currentCount = Number(camp.registeredCount) || 0;
  return await db.collection('camps').findOneAndUpdate(
    { $or: [{ _id }, { id: campId }] },
    {
      $set: {
        registeredCount: currentCount + 1,
        updatedAt: new Date().toISOString()
      }
    },
    { returnDocument: 'after' }
  );
}

export async function deleteCamp(id) {
  const db = await connectToMongoDB();
  const _id = toMongoId(id);
  const result = await db.collection('camps').deleteOne({
    $or: [{ _id }, { id }]
  });
  return { success: result.deletedCount > 0, deletedCount: result.deletedCount };
}

