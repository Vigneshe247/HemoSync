import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCWpAPQA5cXCuHTswqx9ODrnCVDa5t6OCM",
  authDomain: "hemosync-9aab8.firebaseapp.com",
  projectId: "hemosync-9aab8",
  storageBucket: "hemosync-9aab8.firebasestorage.app",
  messagingSenderId: "959835673120",
  appId: "1:959835673120:web:b9e209e3cdde71a9662245",
  measurementId: "G-T1D86WT3E1"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Safe Analytics init for environments that support it
let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then(supported => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

export { analytics };
