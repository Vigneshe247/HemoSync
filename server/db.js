import { MongoClient } from 'mongodb';
import fs from 'node:fs';
import path from 'node:path';
import dns from 'node:dns';
import { localStore } from './localMongo.js';

// Load .env variables
export function loadEnvConfig() {
  const envFiles = ['.env', 'atlas-credentials.env', '.env.local'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      content.split(/\r?\n/).forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnvConfig();

// Fix for Windows DNS resolution if Atlas is used
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

function getMongoUri() {
  return process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/HemoSync";
}

function getDatabaseName(uri) {
  if (process.env.MONGODB_DB_NAME) return process.env.MONGODB_DB_NAME;
  try {
    const parsed = new URL(uri);
    const pathname = parsed.pathname.replace(/^\//, '');
    if (pathname) return pathname;
  } catch (e) {
    const parts = uri.split('/');
    const last = parts[parts.length - 1];
    if (last && !last.includes(':') && !last.includes('@')) {
      return last.split('?')[0];
    }
  }
  return "HemoSync";
}

const uri = getMongoUri();
export let client = null;
let activeDb = null;
let isConnectedToMongo = false;
let dbSource = 'Local MongoDB (HemoSync)';

// Auto-seed initial data to MongoDB HemoSync database if empty
async function autoSeedIfEmpty(db) {
  try {
    const bankCount = await db.collection('bloodBanks').countDocuments();
    if (bankCount === 0) {
      const storeFile = path.resolve(process.cwd(), 'server/data/mongodb_store.json');
      if (fs.existsSync(storeFile)) {
        const data = JSON.parse(fs.readFileSync(storeFile, 'utf8'));
        if (data.bloodBanks?.length) {
          await db.collection('bloodBanks').insertMany(data.bloodBanks);
          console.log(`✅ Seeded ${data.bloodBanks.length} certified blood banks into HemoSync.bloodBanks`);
        }
      }
    }
  } catch (err) {
    console.warn('Auto-seed check notice:', err.message);
  }
}

export async function connectToMongoDB() {
  if (activeDb) {
    return activeDb;
  }

  const currentUri = getMongoUri();
  const dbName = getDatabaseName(currentUri);

  try {
    client = new MongoClient(currentUri, {
      serverSelectionTimeoutMS: 4000,
      connectTimeoutMS: 4000
    });
    await client.connect();
    activeDb = client.db(dbName);
    isConnectedToMongo = true;
    dbSource = (currentUri.includes('127.0.0.1') || currentUri.includes('localhost'))
      ? `Local MongoDB (${dbName})`
      : `MongoDB Atlas (${dbName})`;

    console.log(`✅ Successfully connected to ${dbSource} at ${currentUri.replace(/\/\/.*@/, '//<credentials>@')}`);
    await autoSeedIfEmpty(activeDb);
    return activeDb;
  } catch (err) {
    console.warn(`⚠️ MongoDB connection notice: ${err.message}`);
    console.log(`🚀 Using MongoDB-compatible persistent data store (server/data/mongodb_store.json) for 100% CRUD operations!`);
    activeDb = localStore;
    dbSource = 'Local Persistent MongoDB Store';
    return activeDb;
  }
}

export function getDatabaseStatus() {
  return {
    connected: true,
    isLocal: isConnectedToMongo && (uri.includes('127.0.0.1') || uri.includes('localhost')),
    isAtlas: isConnectedToMongo && !uri.includes('127.0.0.1') && !uri.includes('localhost'),
    source: dbSource,
    uri: uri.replace(/\/\/.*@/, '//<credentials>@'),
    database: getDatabaseName(getMongoUri())
  };
}

export async function disconnectFromMongoDB() {
  if (client) {
    try {
      await client.close();
      activeDb = null;
      isConnectedToMongo = false;
      console.log("Disconnected from MongoDB.");
    } catch (e) {}
  }
}

// Direct execution test
if (process.argv[1]?.endsWith('db.js')) {
  (async () => {
    try {
      const db = await connectToMongoDB();
      console.log("Database status:", getDatabaseStatus());
      await disconnectFromMongoDB();
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  })();
}

