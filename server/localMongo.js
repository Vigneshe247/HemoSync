import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'mongodb_store.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Generate MongoDB-compatible 24-character hex ID
export function generateMongoId() {
  const timestamp = Math.floor(Date.now() / 1000).toString(16).padStart(8, '0');
  const random = Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  return timestamp + random;
}

const DEFAULT_BLOOD_BANKS = [
  {
    _id: generateMongoId(),
    id: 'bb-1',
    name: 'Government Rajaji Hospital Blood Centre',
    hospitalName: 'Government Rajaji Hospital',
    address: 'Alagar Kovil Road, Goripalayam',
    city: 'Madurai',
    district: 'Madurai',
    state: 'Tamil Nadu',
    contact: '+91 0452-2532535',
    phone: '+91 0452-2532535',
    email: 'bloodbank@grhmadurai.tn.gov.in',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 1.8,
    lat: 9.9312,
    lng: 78.1310,
    availableBloodGroups: { 'A+': 24, 'A-': 6, 'B+': 19, 'B-': 4, 'AB+': 11, 'AB-': 3, 'O+': 32, 'O-': 8 },
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: generateMongoId(),
    id: 'bb-2',
    name: 'Apollo Speciality Blood Bank',
    hospitalName: 'Apollo Speciality Hospital',
    address: 'Greams Road, Thousand Lights',
    city: 'Chennai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    contact: '+91 044-28290200',
    phone: '+91 044-28290200',
    email: 'bloodcentre@apollohospitals.com',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 3.5,
    lat: 13.0569,
    lng: 80.2525,
    availableBloodGroups: { 'A+': 35, 'A-': 9, 'B+': 28, 'B-': 7, 'AB+': 14, 'AB-': 5, 'O+': 46, 'O-': 12 },
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: generateMongoId(),
    id: 'bb-3',
    name: 'Manipal Comprehensive Blood Centre',
    hospitalName: 'Manipal Hospital',
    address: '98 HAL Airport Road, Kodihalli',
    city: 'Bangalore Urban',
    district: 'Bangalore Urban',
    state: 'Karnataka',
    contact: '+91 080-25024444',
    phone: '+91 080-25024444',
    email: 'bloodbank@manipalhospitals.com',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 4.2,
    lat: 12.9592,
    lng: 77.6499,
    availableBloodGroups: { 'A+': 16, 'A-': 4, 'B+': 14, 'B-': 3, 'AB+': 8, 'AB-': 2, 'O+': 22, 'O-': 5 },
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: generateMongoId(),
    id: 'bb-4',
    name: 'Lilavati Hospital & Research Blood Bank',
    hospitalName: 'Lilavati Hospital',
    address: 'A-791, Bandra Reclamation, Bandra West',
    city: 'Mumbai City',
    district: 'Mumbai City',
    state: 'Maharashtra',
    contact: '+91 022-26751000',
    phone: '+91 022-26751000',
    email: 'bloodbank@lilavatihospital.com',
    operatingHours: '24/7 Emergency Service',
    distanceKm: 5.0,
    lat: 19.0522,
    lng: 72.8315,
    availableBloodGroups: { 'A+': 20, 'A-': 5, 'B+': 18, 'B-': 4, 'AB+': 9, 'AB-': 2, 'O+': 29, 'O-': 7 },
    verified: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const DEFAULT_DONORS = [];


const DEFAULT_REQUESTS = [
  {
    _id: generateMongoId(),
    requestId: 'req-1',
    patientName: 'Meenakshi Sundaram',
    bloodGroup: 'O+',
    unitsRequired: 2,
    hospitalName: 'Government Rajaji Hospital',
    state: 'Tamil Nadu',
    city: 'Madurai',
    district: 'Madurai',
    address: 'Alagar Kovil Road, Goripalayam',
    emergencyLevel: 'CRITICAL',
    purpose: 'Emergency Heart Surgery',
    mobile: '+91 98940 12345',
    email: 'help@grh-hospital.org',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    acceptedDonorId: null,
    acceptedDonorName: null
  },
  {
    _id: generateMongoId(),
    requestId: 'req-2',
    patientName: 'Sanjay Verma',
    bloodGroup: 'A+',
    unitsRequired: 3,
    hospitalName: 'Apollo Speciality Hospitals',
    state: 'Tamil Nadu',
    city: 'Chennai',
    district: 'Chennai',
    address: 'Greams Road, Thousand Lights',
    emergencyLevel: 'URGENT',
    purpose: 'Accident Trauma Recovery',
    mobile: '+91 98401 54321',
    email: 'trauma@apollohospitals.com',
    status: 'OPEN',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    acceptedDonorId: null,
    acceptedDonorName: null
  }
];

const DEFAULT_CAMPS = [
  {
    _id: generateMongoId(),
    id: 'camp-1',
    title: 'Madurai Community Life Blood Donation Drive',
    location: 'Gandhi Museum Grounds, Tamukkam',
    city: 'Madurai',
    state: 'Tamil Nadu',
    date: '2026-10-05',
    time: '09:00 AM - 04:00 PM',
    organizer: 'Red Cross Madurai & GRH Blood Centre',
    contact: '+91 98765 11223',
    registeredCount: 84,
    createdAt: new Date().toISOString()
  },
  {
    _id: generateMongoId(),
    id: 'camp-2',
    title: 'Chennai Metro Tech Blood Drive',
    location: 'Tidel Park Atrium, Taramani',
    city: 'Chennai',
    state: 'Tamil Nadu',
    date: '2026-10-12',
    time: '10:00 AM - 05:00 PM',
    organizer: 'Rotary Club of Madras Central',
    contact: '+91 94440 22334',
    registeredCount: 120,
    createdAt: new Date().toISOString()
  }
];

class LocalDatabaseStore {
  constructor() {
    this.data = {
      users: [],
      bloodDonors: [],
      donors: [],
      bloodBanks: [],
      requests: [],
      camps: []
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const raw = fs.readFileSync(STORE_FILE, 'utf8');
        this.data = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Could not read existing store file, initializing new storage:', e.message);
    }

    let modified = false;
    if (!this.data.bloodBanks || this.data.bloodBanks.length === 0) {
      this.data.bloodBanks = [...DEFAULT_BLOOD_BANKS];
      modified = true;
    }
    if (!this.data.bloodDonors || this.data.bloodDonors.length === 0) {
      this.data.bloodDonors = [...DEFAULT_DONORS];
      modified = true;
    }
    if (!this.data.requests || this.data.requests.length === 0) {
      this.data.requests = [...DEFAULT_REQUESTS];
      modified = true;
    }
    if (!this.data.camps || this.data.camps.length === 0) {
      this.data.camps = [...DEFAULT_CAMPS];
      modified = true;
    }
    if (!this.data.users) {
      this.data.users = [];
      modified = true;
    }

    if (modified) {
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (e) {
      console.error('Failed to save to store file:', e);
    }
  }

  collection(name) {
    if (!this.data[name]) {
      this.data[name] = [];
    }
    const store = this;
    const items = this.data[name];

    // Helper for query matching
    const matchesQuery = (doc, query) => {
      if (!query || Object.keys(query).length === 0) return true;

      for (const [key, value] of Object.entries(query)) {
        if (key === '$or' && Array.isArray(value)) {
          const anyMatch = value.some(subQuery => matchesQuery(doc, subQuery));
          if (!anyMatch) return false;
          continue;
        }

        const docVal = doc[key];

        if (value instanceof RegExp) {
          if (!value.test(String(docVal || ''))) return false;
          continue;
        }

        if (value && typeof value === 'object' && value.toString) {
          // Compare ObjectId or String representations
          if (String(docVal) === String(value)) continue;
        }

        if (docVal !== value && String(docVal) !== String(value)) {
          return false;
        }
      }
      return true;
    };

    return {
      async insertOne(doc) {
        const id = doc._id || generateMongoId();
        const newDoc = { ...doc, _id: id };
        items.unshift(newDoc);
        store.save();
        return { insertedId: id, acknowledged: true };
      },

      async insertMany(docs) {
        const insertedIds = {};
        docs.forEach((doc, idx) => {
          const id = doc._id || generateMongoId();
          const newDoc = { ...doc, _id: id };
          items.unshift(newDoc);
          insertedIds[idx] = id;
        });
        store.save();
        return { insertedIds, acknowledged: true };
      },

      find(query = {}) {
        let results = items.filter(doc => matchesQuery(doc, query));
        return {
          sort(sortObj = {}) {
            results.sort((a, b) => {
              for (const [k, dir] of Object.entries(sortObj)) {
                if (a[k] < b[k]) return dir === 1 ? -1 : 1;
                if (a[k] > b[k]) return dir === 1 ? 1 : -1;
              }
              return 0;
            });
            return this;
          },
          limit(n) {
            results = results.slice(0, n);
            return this;
          },
          async toArray() {
            return JSON.parse(JSON.stringify(results));
          }
        };
      },

      async findOne(query) {
        const doc = items.find(d => matchesQuery(d, query));
        return doc ? JSON.parse(JSON.stringify(doc)) : null;
      },

      async findOneAndUpdate(query, update, options = {}) {
        const idx = items.findIndex(d => matchesQuery(d, query));
        if (idx === -1) return null;

        const current = items[idx];
        const updates = update.$set || update;
        const updatedDoc = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString()
        };

        items[idx] = updatedDoc;
        store.save();
        return JSON.parse(JSON.stringify(updatedDoc));
      },

      async updateOne(query, update) {
        const idx = items.findIndex(d => matchesQuery(d, query));
        if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

        const current = items[idx];
        const updates = update.$set || update;
        items[idx] = {
          ...current,
          ...updates,
          updatedAt: new Date().toISOString()
        };
        store.save();
        return { matchedCount: 1, modifiedCount: 1 };
      },

      async deleteOne(query) {
        const idx = items.findIndex(d => matchesQuery(d, query));
        if (idx === -1) return { deletedCount: 0 };

        items.splice(idx, 1);
        store.save();
        return { deletedCount: 1 };
      },

      async deleteMany(query) {
        const initialCount = items.length;
        const remaining = items.filter(d => !matchesQuery(d, query));
        store.data[name] = remaining;
        store.save();
        return { deletedCount: initialCount - remaining.length };
      },

      async countDocuments(query = {}) {
        return items.filter(d => matchesQuery(d, query)).length;
      }
    };
  }

  async command(cmd) {
    return { ok: 1 };
  }
}

export const localStore = new LocalDatabaseStore();
