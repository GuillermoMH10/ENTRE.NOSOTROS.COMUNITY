import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyAs1ti_J3Fxi6t41kW_xC3OORk_PugyTSk",
  authDomain: "entre-nosotros-742c0.firebaseapp.com",
  projectId: "entre-nosotros-742c0",
  storageBucket: "entre-nosotros-742c0.firebasestorage.app",
  messagingSenderId: "67176257419",
  appId: "1:67176257419:web:c5e00b80c8f51aa428418e"
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with experimentalForceLongPolling for React Native / Expo compatibility
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  });
} catch (e) {
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;
export const storage = getStorage(app);
export default app;
