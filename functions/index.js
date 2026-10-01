import { onRequest } from "firebase-functions/v2/https";
import app from "../server/index.js";

// Set Atlas environment variable defaults if not present in Cloud runtime
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = "mongodb+srv://sridharanak032006_db_user:Q90RkAlqLABCBs0d@neoblood.4pdpews.mongodb.net/?appName=NeoBlood";
}
if (!process.env.MONGODB_DB_NAME) {
  process.env.MONGODB_DB_NAME = "HemoSync";
}
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = "hemosync_super_secret_jwt_key_2026_secure";
}

// Export Express app as 2nd gen Firebase Cloud Function 'api'
export const api = onRequest({ cors: true, maxInstances: 10 }, app);
