/* ==========================================================================
   Firebase Configuration & Hybrid Database Integration
   Real Firebase Auth/Firestore Client with Seamless Local Storage Fallback
   ========================================================================== */

// Firebase standard CDN SDK imports
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy 
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Default Firebase Configuration template
// Replace these with your project credentials from Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyCWpAPQA5cXCuHTswqx9ODrnCVDa5t6OCM",
  authDomain: "hemosync-9aab8.firebaseapp.com",
  projectId: "hemosync-9aab8",
  storageBucket: "hemosync-9aab8.firebasestorage.app",
  messagingSenderId: "959835673120",
  appId: "1:959835673120:web:b9e209e3cdde71a9662245",
  measurementId: "G-T1D86WT3E1"
};

let app, auth, db;
let isRealFirebaseConfigured = false;

// Check if credentials are set
if (firebaseConfig.apiKey && firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY") {
  try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    isRealFirebaseConfigured = true;
    console.log("🔥 Connected to live Firebase Auth & Firestore");
  } catch (err) {
    console.warn("⚠️ Firebase init failed, falling back to local database driver:", err);
  }
} else {
  console.log("ℹ️ Using local reactive database driver (Pre-seeded with Madurai/TN Demo Data)");
}

/* ==========================================================================
   Fallback Local Database Driver (Empty for Production)
   ========================================================================== */

const SEED_USERS = [];
const SEED_REQUESTS = [];
const SEED_NOTIFS = [];

class LocalStoreDriver {
  constructor() {
    this.init();
    this.listeners = [];
  }

  init() {
    if (!localStorage.getItem('lifepulse_users')) {
      localStorage.setItem('lifepulse_users', JSON.stringify(SEED_USERS));
    }
    if (!localStorage.getItem('lifepulse_requests')) {
      localStorage.setItem('lifepulse_requests', JSON.stringify(SEED_REQUESTS));
    }
    if (!localStorage.getItem('lifepulse_notifs')) {
      localStorage.setItem('lifepulse_notifs', JSON.stringify(SEED_NOTIFS));
    }
    if (!localStorage.getItem('lifepulse_donations')) {
      localStorage.setItem('lifepulse_donations', JSON.stringify([]));
    }
  }

  getUsers() { return JSON.parse(localStorage.getItem('lifepulse_users') || '[]'); }
  saveUsers(users) { 
    localStorage.setItem('lifepulse_users', JSON.stringify(users)); 
    this.notify();
  }

  getRequests() { return JSON.parse(localStorage.getItem('lifepulse_requests') || '[]'); }
  saveRequests(reqs) { 
    localStorage.setItem('lifepulse_requests', JSON.stringify(reqs)); 
    this.notify();
  }

  getNotifs() { return JSON.parse(localStorage.getItem('lifepulse_notifs') || '[]'); }
  saveNotifs(notifs) { 
    localStorage.setItem('lifepulse_notifs', JSON.stringify(notifs)); 
    this.notify();
  }

  getDonations() { return JSON.parse(localStorage.getItem('lifepulse_donations') || '[]'); }
  saveDonations(donations) { 
    localStorage.setItem('lifepulse_donations', JSON.stringify(donations)); 
    this.notify();
  }

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const localDb = new LocalStoreDriver();
export { auth, db, isRealFirebaseConfigured };
